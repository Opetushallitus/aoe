import { ErrorHandler } from '@/helpers/errorHandler';
import { ISearchIndexMap } from '@aoe/search/es';
import elasticsearch, { Client, ClientOptions } from '@elastic/elasticsearch';
import { getPopularityQuery } from '@query/analyticsQueries';
import { db } from '@resource/postgresClient';
import { aoeThumbnailDownloadUrl } from '@services/urlService';
import winstonLogger from '@util/winstonLogger';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import * as pgLib from 'pg-promise';
import { collectionDataToEs, collectionFromEs, getCollectionDataToEs, getCollectionDataToUpdate } from './esCollection';
import { AoeBody, AoeCollectionResult } from './esTypes';

const index: string = process.env.ES_INDEX;

/**
 * Elastisearch client configuration
 */
const client: Client = new elasticsearch.Client({
  node: process.env.ES_NODE,
  log: 'trace',
  keepAlive: true
} as ClientOptions);

// values for index last update time
export namespace Es {
  export const ESupdated: { value: Date } = { value: new Date() };
  export const ESCounterUpdated: { value: Date } = { value: new Date() };
  export const CollectionEsUpdated: { value: Date } = { value: new Date() };
}

// Create a reusable transaction mode (serializable + read-only + deferrable):
const mode = new pgLib.txMode.TransactionMode({
  tiLevel: pgLib.txMode.isolationLevel.serializable,
  readOnly: true,
  deferrable: true
});

export const createEsIndex = async (): Promise<any> => {
  client.ping({
    // ping usually has a 3000ms timeout
    // requestTimeout: 1000
  }, async function(error: any) {
    if (error) {
      winstonLogger.error('Elasticsearch cluster is down: ' + error);
    } else {
      // Delete existing index before recreation.
      const indexFound: boolean = await indexExists(index);
      if (indexFound) await deleteIndex(index);

      const createIndexResult: boolean = await createIndex(index);
      if (createIndexResult) {
        try {
          await addMapping(index, process.env.ES_MAPPING_FILE);
          let i = 0;
          let n;
          Es.ESupdated.value = new Date();
          do {
            n = await metadataToEs(i, 1000);
            i++;
          } while (n);
        } catch (error) {
          winstonLogger.error(error);
        }
      }
    }
  });
};

/**
 * Delete existing search index.
 * @param index
 */
export const deleteIndex = async (index: string): Promise<boolean> => {
  return client.indices.delete({
    index: index
  }).then((data: any) => {
    return !!data.body;
  }).catch((error: any) => {
    winstonLogger.error('Search index deletion failed: %o', error);
    return false;
  });
};

/**
 * @param index
 * Create a new index
 */
export const createIndex = async (index: string): Promise<any> => {
  return client.indices.create({
    index: index
  }).then((data: any) => {
    return data.body;
  }).catch((error: any) => {
    winstonLogger.error(error);
    return false;
  });
};

/**
 * Verify that specific search engine index exists.
 * @param index
 */
export const indexExists = async (index: string): Promise<boolean> => {
  return client.indices.exists({
    index: index
  }).then((data: any) => {
    return !!data.body;
  }).catch((error: any) => {
    winstonLogger.error(error);
    return false;
  });
};

/**
 * @param index
 * @param fileLocation
 * add mapping to index
 */
export const addMapping = async (index: string, fileLocation: string): Promise<{ status: string }> => {
  return new Promise(async (resolve, reject) => {
    const rawdata: Buffer = fs.readFileSync(fileLocation);
    const searchIndexMap: ISearchIndexMap = JSON.parse(rawdata.toString());
    client.indices.putMapping({
      index: index,
      // body: aoemapping
      body: searchIndexMap.mappings,
    }, (err: any, _resp: any) => {
      if (err) {
        reject(new Error(err));
      } else {
        // winstonLogger.debug("ES mapping created: ", index, resp.body);
        resolve({ 'status': 'success' });
      }
    });
  });
};

/**
 * @param offset
 * @param limit
 * insert metadata
 */
export async function metadataToEs(offset: number, limit: number) {
  return new Promise(async (resolve, reject) => {
    db.tx({ mode }, async (t: any) => {
      const params: any = [];
      params.push(offset * limit);
      params.push(limit);
      let query = 'select em.id, em.createdat, em.publishedat, em.updatedat, em.archivedat, em.timerequired, em.agerangemin, em.agerangemax, em.obsoleted, em.originalpublishedat, em.expires, em.suitsallearlychildhoodsubjects, em.suitsallpreprimarysubjects, em.suitsallbasicstudysubjects, em.suitsalluppersecondarysubjects, em.suitsalluppersecondarysubjectsnew, em.suitsallvocationaldegrees, em.suitsallselfmotivatedsubjects, em.suitsallbranches' +
                  ' from educationalmaterial as em where em.obsoleted = 0 and em.publishedat IS NOT NULL order by em.id asc OFFSET $1 LIMIT $2;';
      return t.map(query, params, async (q: any) => {
        const m: any = [];
        t.map('select m.id, m.materiallanguagekey as language, link, version.priority, filepath, originalfilename, filesize, mimetype, filekey, filebucket, obsoleted ' +
              'from (select materialid, publishedat, priority from versioncomposition where publishedat = (select max(publishedat) from versioncomposition where educationalmaterialid = $1)) as version ' +
              'left join material m on m.id = version.materialid left join record r on m.id = r.materialid where m.educationalmaterialid = $1', [q.id], (q2: any) => {
          t.any('select * from materialdisplayname where materialid = $1;', q2.id)
            .then((data: any) => {
              q2.materialdisplayname = data;
              m.push(q2);
            });
          q.materials = m;
        });
        query = 'select * from materialname where educationalmaterialid = $1;';
        q.materialname = await t.any(query, q.id);
        query = 'select * from materialdescription where educationalmaterialid = $1;';
        q.materialdescription = await t.any(query, q.id);

        query = 'select * from educationalaudience where educationalmaterialid = $1;';
        let response = await t.any(query, [q.id]);
        q.educationalaudience = response;

        query = 'select * from learningresourcetype where educationalmaterialid = $1;';
        response = await t.any(query, [q.id]);
        q.learningresourcetype = response;

        query = 'select * from accessibilityfeature where educationalmaterialid = $1;';
        response = await t.any(query, [q.id]);
        q.accessibilityfeature = response;

        query = 'select * from accessibilityhazard where educationalmaterialid = $1;';
        response = await t.any(query, [q.id]);
        q.accessibilityhazard = response;

        query = 'select * from keyword where educationalmaterialid = $1;';
        response = await t.any(query, [q.id]);
        q.keyword = response;

        query = 'select * from educationallevel where educationalmaterialid = $1;';
        response = await t.any(query, [q.id]);
        q.educationallevel = response;

        query = 'select * from educationaluse where educationalmaterialid = $1;';
        response = await t.any(query, [q.id]);
        q.educationaluse = response;

        query = 'select * from publisher where educationalmaterialid = $1;';
        response = await t.any(query, [q.id]);
        q.publisher = response;

        query = 'select * from author where educationalmaterialid = $1;';
        response = await t.any(query, [q.id]);
        q.author = response;

        query = 'select * from isbasedon where educationalmaterialid = $1;';
        response = await t.map(query, [q.id], (q2: any) => {
          t.any('select * from isbasedonauthor where isbasedonid = $1;', q2.id)
            .then((data: any) => {
              q2.author = data;
            });
          return q2;
        });
        q.isbasedon = response;

        query = 'select * from alignmentobject where educationalmaterialid = $1;';
        response = await t.any(query, [q.id]);
        q.alignmentobject = response;

        query = 'SELECT users.firstname, users.lastname FROM educationalmaterial INNER JOIN users ON educationalmaterial.usersusername = users.username WHERE educationalmaterial.id = $1;';
        response = await t.any(query, [q.id]);
        q.owner = response;

        query = 'select * from educationalaudience where educationalmaterialid = $1;';
        response = await t.any(query, [q.id]);
        q.educationalaudience = response;

        query = 'select * from thumbnail where educationalmaterialid = $1 and obsoleted = 0 limit 1;';
        response = await t.oneOrNone(query, [q.id]);
        if (response) {
          response.filepath = await aoeThumbnailDownloadUrl(response.filekey);
        }
        q.thumbnail = response;

        query = 'select licensecode as key, license as value from educationalmaterial as m left join licensecode as l on m.licensecode = l.code WHERE m.id = $1;';
        q.license = await t.oneOrNone(query, [q.id]);
        response = await t.oneOrNone(getPopularityQuery, [q.id]);
        if (response) {
          q.popularity = response.popularity;
        }
        return q;
      })
        .then(t.batch)
        .catch((error: any) => {
          winstonLogger.error(error);
          return error;
        });
    })
      .then(async (data: any) => {
        // winstonLogger.debug("inserting data to elastic material number: " + (offset * limit + 1));
        if (data.length > 0) {
          const body = data.flatMap(doc => [{ index: { _index: index, _id: doc.id } }, doc]);
          // winstonLogger.debug("THIS IS BODY:");
          // winstonLogger.debug(JSON.stringify(body));
          const { body: bulkResponse } = await client.bulk({ refresh: true, body });
          if (bulkResponse.errors) {
            const erroredDocuments = [];
            // The items array has the same order of the dataset we just indexed.
            // The presence of the `error` key indicates that the operation
            // that we did for the document has failed.
            bulkResponse.items.forEach((action, i) => {
              const operation = Object.keys(action)[0];
              if (action[operation].error) {
                erroredDocuments.push({
                  // If the status is 429 it means that you can retry the document,
                  // otherwise it's very likely a mapping error, and you should
                  // fix the document before to try it again.
                  status: action[operation].status,
                  error: action[operation].error,
                  operation: body[i * 2],
                  document: body[i * 2 + 1]
                });
              }
            });
            winstonLogger.debug('Error documents in metadataToEs(): %o', erroredDocuments);
          }
          resolve(data.length);
        } else {
          resolve(data.length);
        }
      })
      .catch(error => {
        winstonLogger.error(error);
        reject();
      });
  });
}

/**
 * Update search engine index after recent changes in information resources.
 * TODO: Complexity of the function must be refactored.
 * @param updateCounters
 */
export const updateEsDocument = (updateCounters?: boolean): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    db.tx({ mode }, async (t: any) => { // #1 async start
      const params: any = [];
      let query = '';
      if (updateCounters) {
        params.push(Es.ESCounterUpdated.value);
        query = 'SELECT em.id, em.createdat, em.publishedat, em.updatedat, em.archivedat, em.timerequired, ' +
                'em.agerangemin, em.agerangemax, em.obsoleted, em.originalpublishedat, em.expires, ' +
                'em.suitsallearlychildhoodsubjects, em.suitsallpreprimarysubjects, em.suitsallbasicstudysubjects, ' +
                'em.suitsalluppersecondarysubjects, em.suitsalluppersecondarysubjectsnew, ' +
                'em.suitsallvocationaldegrees, em.suitsallselfmotivatedsubjects, em.suitsallbranches ' +
                'FROM educationalmaterial AS em ' +
                'WHERE counterupdatedat > $1 AND em.publishedat IS NOT NULL';
      } else {
        params.push(Es.ESupdated.value);
        query = 'SELECT em.id, em.createdat, em.publishedat, em.updatedat, em.archivedat, em.timerequired, ' +
                'em.agerangemin, em.agerangemax, em.obsoleted, em.originalpublishedat, em.expires, ' +
                'em.suitsallearlychildhoodsubjects, em.suitsallpreprimarysubjects, em.suitsallbasicstudysubjects, ' +
                'em.suitsalluppersecondarysubjects, em.suitsalluppersecondarysubjectsnew, ' +
                'em.suitsallvocationaldegrees, em.suitsallselfmotivatedsubjects, em.suitsallbranches ' +
                'FROM educationalmaterial AS em ' +
                'WHERE updatedat > $1 AND em.publishedat IS NOT NULL';
      }
      return t.map(query, params, async (q: any) => { // #2 async start
        const m: any = [];
        t.map('SELECT m.id, m.materiallanguagekey AS language, link, version.priority, filepath, ' +
              'originalfilename, filesize, mimetype, filekey, filebucket, obsoleted ' +
              'FROM (select materialid, publishedat, priority ' +
              'FROM versioncomposition ' +
              'WHERE publishedat = ' +
              '(SELECT MAX(publishedat) FROM versioncomposition WHERE educationalmaterialid = $1)) AS version ' +
              'LEFT JOIN material m ON m.id = version.materialid ' +
              'LEFT JOIN record r ON m.id = r.materialid ' +
              'WHERE m.educationalmaterialid = $1', [q.id], (q2: any) => {
            t.any('select * from materialdisplayname where materialid = $1;', q2.id).then((data: any) => {
              q2.materialdisplayname = data;
              m.push(q2);
            });
            q.materials = m;
          }
        );
        query = 'SELECT * FROM materialname WHERE educationalmaterialid = $1';
        q.materialname = await t.any(query, q.id);

        query = 'SELECT * FROM materialdescription WHERE educationalmaterialid = $1';
        q.materialdescription = await t.any(query, q.id);

        query = 'SELECT * FROM educationalaudience WHERE educationalmaterialid = $1';
        let response = await t.any(query, [q.id]);
        q.educationalaudience = response;

        query = 'SELECT * FROM learningresourcetype WHERE educationalmaterialid = $1';
        response = await t.any(query, [q.id]);
        q.learningresourcetype = response;

        query = 'SELECT * FROM accessibilityfeature WHERE educationalmaterialid = $1';
        response = await t.any(query, [q.id]);
        q.accessibilityfeature = response;

        query = 'SELECT * FROM accessibilityhazard WHERE educationalmaterialid = $1';
        response = await t.any(query, [q.id]);
        q.accessibilityhazard = response;

        query = 'SELECT * FROM keyword WHERE educationalmaterialid = $1';
        response = await t.any(query, [q.id]);
        q.keyword = response;

        query = 'SELECT * FROM educationallevel WHERE educationalmaterialid = $1';
        response = await t.any(query, [q.id]);
        q.educationallevel = response;

        query = 'SELECT * FROM educationaluse WHERE educationalmaterialid = $1';
        response = await t.any(query, [q.id]);
        q.educationaluse = response;

        query = 'SELECT * FROM publisher WHERE educationalmaterialid = $1';
        response = await t.any(query, [q.id]);
        q.publisher = response;

        query = 'SELECT * FROM author WHERE educationalmaterialid = $1';
        response = await t.any(query, [q.id]);
        q.author = response;

        query = 'SELECT * FROM isbasedon WHERE educationalmaterialid = $1';
        response = await t.map(query, [q.id], (q2: any) => {
          t.any('SELECT * FROM isbasedonauthor WHERE isbasedonid = $1', q2.id)
            .then((data: any) => {
              q2.author = data;
            });
          return q2;
        });

        // response = await t.any(query, [q.id]);
        q.isbasedon = response;

        // query = "select * from inlanguage where educationalmaterialid = $1;";
        // response = await t.any(query, [q.id]);
        // q.inlanguage = response;

        query = 'SELECT * FROM alignmentobject WHERE educationalmaterialid = $1';
        response = await t.any(query, [q.id]);
        q.alignmentobject = response;

        query = 'SELECT users.firstname, users.lastname ' +
                'FROM educationalmaterial ' +
                'INNER JOIN users ON educationalmaterial.usersusername = users.username ' +
                'WHERE educationalmaterial.id = $1';
        response = await t.any(query, [q.id]);
        q.owner = response;

        query = 'SELECT * FROM educationalaudience WHERE educationalmaterialid = $1';
        response = await t.any(query, [q.id]);
        q.educationalaudience = response;

        query = 'SELECT * FROM thumbnail WHERE educationalmaterialid = $1 AND obsoleted = 0 LIMIT 1';
        response = await t.oneOrNone(query, [q.id]);
        if (response) {
          response.filepath = await aoeThumbnailDownloadUrl(response.filekey);
        }
        q.thumbnail = response;

        query = 'SELECT licensecode AS key, license AS value ' +
                'FROM educationalmaterial AS m ' +
                'LEFT JOIN licensecode AS l ON m.licensecode = l.code ' +
                'WHERE m.id = $1';
        q.license = await t.oneOrNone(query, [q.id]);

        response = await t.oneOrNone(getPopularityQuery, [q.id]);
        if (response) {
          q.popularity = response.popularity;
        }
        return q;
      }) // #2 async end
        .then(t.batch) // #2 then start/end
        .catch((error: any) => { // #2 catch start
          winstonLogger.error(error);
          return error;
        }); // #2 catch end
    }) // #1 async end
      .then(async (data: any) => { // #1 then start
          if (data.length > 0) {
            const body = data.flatMap(doc => [{ index: { _index: index, _id: doc.id } }, doc]);
            const { body: bulkResponse } = await client.bulk({ refresh: true, body });
            if (bulkResponse.errors) {
              winstonLogger.error('Bulk response error: %o', bulkResponse.errors);
            } else {
              if (updateCounters) {
                Es.ESCounterUpdated.value = new Date();
              } else {
                Es.ESupdated.value = new Date();
              }
            }
            resolve(data.length);
          } else {
            resolve(data.length);
          }
        }
      ) // #1 then end
      .catch((error) => { // #1 catch start
        winstonLogger.debug('Search index update faild in updateEsDocument(): ' + error);
        reject(error);
      }); // #1 catch end
  });
};

export async function createEsCollectionIndex() {
  try {
    const collectionIndex = process.env.ES_COLLECTION_INDEX;
    const result: boolean = await indexExists(collectionIndex);
    // winstonLogger.debug("COLLECTION INDEX RESULT: " + result);
    if (result) {
      await deleteIndex(collectionIndex);
      // winstonLogger.debug("COLLECTION DELETE INDEX RESULT: " + JSON.stringify(deleteResult));
    }
    const createIndexResult = await createIndex(collectionIndex);
    // winstonLogger.debug("createIndexResult: " + JSON.stringify(createIndexResult));
    if (createIndexResult) {
      await addMapping(collectionIndex, process.env.ES_COLLECTION_MAPPING_FILE);
      // winstonLogger.debug("mappingResult: " + JSON.stringify(mappingResult));
      let i = 0;
      let dataToEs;
      do {
        dataToEs = await getCollectionDataToEs(i, 1000);
        i++;
        await collectionDataToEs(collectionIndex, dataToEs.collections);
      } while (dataToEs.collections && dataToEs.collections.length > 0);
      // set new date CollectionEsUpdated
      Es.CollectionEsUpdated.value = new Date();
    }
  } catch (err) {
    winstonLogger.debug('Error creating collection index');
    winstonLogger.error(err);
  }
}

export async function getCollectionEsData(req: Request, res: Response, next: NextFunction) {
  try {
    const responseBody: AoeBody<AoeCollectionResult> = await collectionFromEs(req.body);
    res.status(200).json(responseBody);
  } catch (err) {
    winstonLogger.debug('elasticSearchQuery error');
    winstonLogger.error(err);
    next(new ErrorHandler(500, 'There was an issue prosessing your request'));
  }
}

export const updateEsCollectionIndex = async (): Promise<void> => {
  try {
    const collectionIndex = process.env.ES_COLLECTION_INDEX;
    const newDate = new Date();
    const dataToEs = await getCollectionDataToUpdate(Es.CollectionEsUpdated.value);
    await collectionDataToEs(collectionIndex, dataToEs.collections);

    Es.CollectionEsUpdated.value = newDate;
  } catch (error) {
    winstonLogger.error('Error in updateEsCollectionIndex(): %o', error);
    throw new Error(error);
  }
};

/**
 * START POINT OF SEARCH ENGINE INDEXING
 */
if (process.env.CREATE_ES_INDEX) {
  createEsIndex().then();
  createEsCollectionIndex().then();
}

export default {
  createEsIndex,
  getCollectionEsData,
  updateEsCollectionIndex,
  updateEsDocument,
};
