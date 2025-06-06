import { db } from '@resource/postgresClient';
import { aoeCollectionThumbnailDownloadUrl } from '@services/urlService';
import winstonLogger from '@util/winstonLogger';
import { createMatchAllObject } from './esQueries';
import { AoeBody, AoeCollectionResult, MultiMatchSeachBody, SearchResponse } from './esTypes';
import { AwsSigv4Signer } from "@opensearch-project/opensearch/aws";
import AWS from "aws-sdk";
import { Client, ApiResponse } from "@opensearch-project/opensearch";
import { performBulkOperation } from "@search/es";

const isProd = process.env.NODE_ENV == 'production';

const client = new Client(
  isProd
    ? {
      ...AwsSigv4Signer({
        region: process.env.AWS_REGION || 'eu-west-1',
        service: 'aoss',
        getCredentials: () =>
          new Promise((resolve, reject) => {
            AWS.config.getCredentials((err, credentials) => {
              if (err) {
                reject(err);
              } else {
                resolve(credentials);
              }
            });
          }),
      }),
      node: process.env.ES_NODE,
    }
    : {
      node: process.env.ES_NODE,
    }
);

/**
 * create es collection query
 * @param obj
 */
export async function collectionFromEs(obj: any) {
  try {
    const index: string = process.env.ES_COLLECTION_INDEX;
    let from: number = Number(process.env.ES_FROM_DEFAULT) || 0;
    let size: number = Number(process.env.ES_SIZE_DEFAULT) || 100;
    if (obj.from) {
      from = obj.from;
    }
    if (obj.size) {
      size = obj.size;
    }
    const mustList = [];
    // match all if keywords null
    mustList.push(createMatchAllObject());

    const body: MultiMatchSeachBody = {
      'query': {
        'bool': {
          'must': mustList
        }
      }
    };
    const query = {
      'index': index,
      'from': from,
      'size': size,
      'body': body
    };

    const result: ApiResponse<SearchResponse<AoeCollectionResult>> = await client.search<SearchResponse<AoeCollectionResult>>(query);
    return await aoeCollectionResponseMapper(result);
  } catch (error) {
    throw new Error(error);
  }
}

/**
 *
 * @param response
 * map collection elasticsearch response to aoe response
 */
async function aoeCollectionResponseMapper(response: ApiResponse<SearchResponse<AoeCollectionResult>>) {
  try {
    const resp: AoeBody<AoeCollectionResult> = {
      hits: response.body.hits.total.value
    };
    const hits = response.body.hits.hits;
    if (hits) {
      /**
       * map source here if needed
       */
      resp.results = hits.map(hit => hit._source);
    }
    return resp;
  } catch (error) {
    throw new Error(error);
  }
}

export const getCollectionDataToEs = async (offset: number, limit: number) => {
  try {
    return await db.tx(async (t: any) => {
      let query = 'select collection.id, publishedat, updatedat, createdat, collectionname as name, description from collection WHERE publishedat IS NOT NULL order by collection.id asc OFFSET $1 LIMIT $2;';
      const params: any = [];
      params.push(offset * limit);
      params.push(limit);
      const collections = await Promise.all(
        await t.map(query, params, async (q: any) => {
            query = 'SELECT value, keywordkey as key FROM collectionkeyword WHERE collectionid = $1;';
            q.keywords = await db.any(query, [q.id]);
            query = 'SELECT language FROM collectionlanguage WHERE collectionid = $1;';
            const languageObjects = await db.any(query, [q.id]);
            q.languages = languageObjects.map(o => o.language);
            query = 'SELECT alignmenttype, targetname, source, educationalframework, objectkey, targeturl FROM collectionalignmentobject WHERE collectionid = $1;';
            q.alignmentObjects = await db.any(query, [q.id]);
            query = 'SELECT value, educationalusekey as key FROM collectioneducationaluse WHERE collectionid = $1;';
            q.educationalUses = await db.any(query, [q.id]);
            query = 'SELECT educationalrole as value, educationalrolekey as key FROM collectioneducationalaudience WHERE collectionid = $1;';
            q.educationalRoles = await db.any(query, [q.id]);
            query = 'SELECT value, accessibilityhazardkey as key FROM collectionaccessibilityhazard WHERE collectionid = $1;';
            q.accessibilityHazards = await db.any(query, [q.id]);
            query = 'SELECT value, accessibilityfeaturekey as key FROM collectionaccessibilityfeature WHERE collectionid = $1;';
            q.accessibilityFeatures = await db.any(query, [q.id]);
            query = 'SELECT value, educationallevelkey as key FROM collectioneducationallevel WHERE collectionid = $1;';
            q.educationalLevels = await db.any(query, [q.id]);
            query = 'Select filepath, filekey as thumbnail from collectionthumbnail where collectionid = $1 and obsoleted = 0;';
            let response = await db.oneOrNone(query, [q.id]);
            q.thumbnail = undefined;
            if (response) {
              q.thumbnail = await aoeCollectionThumbnailDownloadUrl(response.thumbnail);
            }
            query = 'select concat(firstname, \' \', lastname) as name from userscollection join users on usersusername = username where collectionid = $1;';
            response = await db.any(query, [q.id]);
            const authors = [];
            response.map(o => authors.push(o.name));
            q.authors = authors;
            return q;
          }
        )
      );
      return { collections };
    });
  } catch (err) {
    throw new Error(err);
  }
};

export async function collectionDataToEs(index: string, data: any, operation : 'create' | 'index') {
  try {
    if (data.length > 0) {
      const body = data.flatMap(doc => [{ [operation]: { _index: index, _id: doc.id } }, doc]);
      winstonLogger.info(`Adding ${data.length} documents to OpenSearch index ${index}`)

      const { statusCode, body: bulkResponse } = await performBulkOperation(client, index, body)
      winstonLogger.info(`OpenSearch index ${index} bulk completed with status code: ${statusCode} , took: ${bulkResponse.took}, errors: ${bulkResponse.errors}`);

      if (winstonLogger.isDebugEnabled()) {
        winstonLogger.debug(`OpenSearch index ${index} bulk completed with response body ${JSON.stringify(bulkResponse)}`);
      }

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
        winstonLogger.error('Document errors: %o', erroredDocuments);
      }
    }
  } catch (err) {
    winstonLogger.error(`Failed to add documents to OpenSearch index ${index} due to ${JSON.stringify(err)}`)
    throw new Error(err);
  }
}

export const getCollectionDataToUpdate = async (time: Date) => {
  try {
    return await db.tx(async (t: any) => {
      let query = 'select collection.id, publishedat, updatedat, createdat, collectionname as name, description from collection WHERE updatedat > $1 and publishedat IS NOT NULL;';
      const params: any = [];
      params.push(time);
      const collections = await Promise.all(
        await t.map(query, params, async (q: any) => {
            query = 'SELECT value, keywordkey as key FROM collectionkeyword WHERE collectionid = $1;';
            q.keywords = await db.any(query, [q.id]);
            query = 'SELECT language FROM collectionlanguage WHERE collectionid = $1;';
            const languageObjects = await db.any(query, [q.id]);
            q.languages = languageObjects.map(o => o.language);
            query = 'SELECT alignmenttype, targetname, source, educationalframework, objectkey, targeturl FROM collectionalignmentobject WHERE collectionid = $1;';
            q.alignmentObjects = await db.any(query, [q.id]);
            query = 'SELECT value, educationalusekey as key FROM collectioneducationaluse WHERE collectionid = $1;';
            q.educationalUses = await db.any(query, [q.id]);
            query = 'SELECT educationalrole as value, educationalrolekey as key FROM collectioneducationalaudience WHERE collectionid = $1;';
            q.educationalRoles = await db.any(query, [q.id]);
            query = 'SELECT value, accessibilityhazardkey as key FROM collectionaccessibilityhazard WHERE collectionid = $1;';
            q.accessibilityHazards = await db.any(query, [q.id]);
            query = 'SELECT value, accessibilityfeaturekey as key FROM collectionaccessibilityfeature WHERE collectionid = $1;';
            q.accessibilityFeatures = await db.any(query, [q.id]);
            query = 'SELECT value, educationallevelkey as key FROM collectioneducationallevel WHERE collectionid = $1;';
            q.educationalLevels = await db.any(query, [q.id]);
            query = 'Select filepath, filekey as thumbnail from collectionthumbnail where collectionid = $1 and obsoleted = 0;';
            let response = await db.oneOrNone(query, [q.id]);
            q.thumbnail = undefined;
            if (response) {
              q.thumbnail = await aoeCollectionThumbnailDownloadUrl(response.thumbnail);
            }
            query = 'select concat(firstname, \' \', lastname) as name from userscollection join users on usersusername = username where collectionid = $1;';
            response = await db.any(query, [q.id]);
            const authors = [];
            response.map(o => authors.push(o.name));
            q.authors = authors;
            return q;
          }
        )
      );
      return { collections };
    });
  } catch (err) {
    throw new Error(err);
  }
};
