import { MetadataResponse } from '@aoe/util/metadataModifier';
import { db } from '@resource/postgresClient';
import {
  aoeFileDownloadUrl,
  aoePdfDownloadUrl,
  aoeThumbnailDownloadUrl,
  getEduMaterialVersionURL,
} from '@services/urlService';
import winstonLogger from '@util/winstonLogger';
import { Request, Response } from 'express';

/**
 * API function to fetch the metadata of educational materials as batch requests.
 * Used by the external service module OAI-PMH Provider for metadata harvesting.
 * @param {e.Request} req
 * @param {e.Response} res
 * @return {Promise<void>}
 */
export const getMaterialMetaData = async (req: Request, res: Response): Promise<void> => {
  winstonLogger.debug(
    'OAI-PMH: allversions=%s dateMin=%s, dateMax=%s, materialPerPage=%d, pageNumber=%d',
    req.body.allVersions,
    req.body.dateMin,
    req.body.dateMax,
    req.body.materialPerPage,
    req.body.pageNumber,
  );

  if (
    !req.body.dateMin ||
    !req.body.dateMax ||
    req.body.materialPerPage < 1 ||
    req.body.pageNumber < 0
  ) {
    res
      .status(400)
      .json({
        message: 'Mandatory field dateMin, dateMax, materialPerPage or pageNumber is missing',
      })
      .end();
    return;
  }

  const loadAllVersions: boolean = req.body.allVersions;

  // Query to count the total amount of published educational materials with a time range requirement.
  // Notice that a published material has an 'updatedat' value, otherwise it is an unpublished draft.
  const countQueryWithTimeRange = `
    SELECT count(*)
    FROM educationalmaterial em
      ${
        loadAllVersions
          ? `INNER JOIN educationalmaterialversion emv on emv.educationalmaterialid = em.id`
          : ''
      }
    WHERE em.updatedat >= timestamp $1 AND em.updatedat < timestamp $2 AND em.publishedat IS NOT NULL
  `;
  // Query to fetch a batch from the database with the provided requirements.
  const batchQueryWithTimeRange = `
    SELECT em.id, em.createdat, em.publishedat, emv.publishedat as "urnpublishedat", em.updatedat, em.archivedat, em.obsoleted,
           CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.timerequired END AS timerequired,
           CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.agerangemin END AS agerangemin,
           CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.agerangemax END AS agerangemax,
           CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.licensecode END AS licensecode,
           CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.originalpublishedat END AS originalpublishedat,
           CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.expires END AS expires,
           CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.suitsallearlychildhoodsubjects END AS suitsallearlychildhoodsubjects,
           CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.suitsallpreprimarysubjects END AS suitsallpreprimarysubjects,
           CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.suitsallbasicstudysubjects END AS suitsallbasicstudysubjects,
           CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.suitsalluppersecondarysubjects END AS suitsalluppersecondarysubjects,
           CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.suitsallvocationaldegrees END AS suitsallvocationaldegrees,
           CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.suitsallselfmotivatedsubjects END AS suitsallselfmotivatedsubjects,
           CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.suitsallbranches END AS suitsallbranches
    FROM educationalmaterial em
    INNER JOIN educationalmaterialversion emv on emv.educationalmaterialid = em.id
    ${
      !loadAllVersions
        ? `AND emv.publishedat = (SELECT MAX(publishedat) FROM educationalmaterialversion emv2 WHERE emv2.educationalmaterialid = emv.educationalmaterialid)`
        : ''
    }
    WHERE em.updatedat >= timestamp $1 AND em.updatedat < timestamp $2 AND em.publishedat IS NOT NULL
    ORDER BY em.id ASC
    OFFSET $3
    LIMIT $4
  `;
  const joinQueryWithLatestVersionMaterials = `
    SELECT m.id, m.materiallanguagekey AS language, m.link, version.priority, r.originalfilename, r.filesize,
      r.mimetype, r.filekey, r.filebucket, m.obsoleted, r.pdfkey
    FROM (
      SELECT vc.materialid, vc.publishedat, vc.priority FROM versioncomposition vc
      WHERE vc.publishedat = $2
    ) AS version
    LEFT JOIN material m ON version.materialid = m.id
    LEFT JOIN record r ON m.id = r.materialid
    WHERE m.educationalmaterialid = $1 AND m.obsoleted = 0
  `;
  const dateMin: string = req.body.dateMin;
  const dateMax: string = req.body.dateMax;
  const materialPerPage: number = req.body.materialPerPage;
  const pageNumber: number = req.body.pageNumber;

  try {
    const result = await db.oneOrNone(countQueryWithTimeRange, [dateMin, dateMax]);
    const completeListSize: number = result ? parseInt(result.count, 10) : 0;
    const pageTotal: number = Math.ceil(completeListSize / materialPerPage);

    db.task(async (t: any): Promise<any> => {
      return t
        .map(
          batchQueryWithTimeRange,
          [dateMin, dateMax, pageNumber * materialPerPage, materialPerPage],
          async (q: any): Promise<any> => {
            const m: any = [];
            await Promise.all(
              await t.map(
                joinQueryWithLatestVersionMaterials,
                [q.id, q.urnpublishedat],
                async (q2: any): Promise<void> => {
                  q2.filepath = await aoeFileDownloadUrl(q2.filekey);
                  q2.pdfpath = await aoePdfDownloadUrl(q2.pdfkey);
                  t.any('select * from materialdisplayname where materialid = $1;', q2.id).then(
                    (data: any) => {
                      q2.materialdisplayname = data;
                      m.push(q2);
                    },
                  );
                  q.materials = m;
                },
              ),
            );
            let query: string;
            let response: any;

            if (q.obsoleted === 0) {
              query = 'SELECT * FROM materialname WHERE educationalmaterialid = $1';
              q.materialname = await t.any(query, q.id);

              query = 'SELECT * FROM materialdescription WHERE educationalmaterialid = $1';
              q.materialdescription = await t.any(query, q.id);

              query = 'SELECT * FROM educationalaudience WHERE educationalmaterialid = $1';
              q.educationalaudience = await t.any(query, [q.id]);

              query = 'SELECT * FROM learningresourcetype WHERE educationalmaterialid = $1';
              q.learningresourcetype = await t.any(query, [q.id]);

              query = 'SELECT * FROM accessibilityfeature WHERE educationalmaterialid = $1';
              q.accessibilityfeature = await t.any(query, [q.id]);

              query = 'SELECT * FROM accessibilityhazard WHERE educationalmaterialid = $1';
              q.accessibilityhazard = await t.any(query, [q.id]);

              query = 'SELECT * FROM keyword WHERE educationalmaterialid = $1';
              q.keyword = await t.any(query, [q.id]);

              query = 'SELECT * FROM educationallevel WHERE educationalmaterialid = $1';
              q.educationallevel = await t.any(query, [q.id]);

              query = 'SELECT * FROM educationaluse WHERE educationalmaterialid = $1';
              q.educationaluse = await t.any(query, [q.id]);

              query = 'SELECT * FROM publisher WHERE educationalmaterialid = $1';
              q.publisher = await t.any(query, [q.id]);

              query = 'SELECT * FROM author WHERE educationalmaterialid = $1';
              q.author = await t.any(query, [q.id]);

              query = 'SELECT * FROM isbasedon WHERE educationalmaterialid = $1';
              q.isbasedon = await t.map(query, [q.id], (q2: any) => {
                t.any('SELECT * FROM isbasedonauthor WHERE isbasedonid = $1', q2.id).then(
                  (data: any): void => {
                    q2.author = data;
                  },
                );
                return q2;
              });

              query = 'SELECT * FROM inlanguage WHERE educationalmaterialid = $1';
              q.inlanguage = await t.any(query, [q.id]);

              query = 'SELECT * FROM alignmentobject WHERE educationalmaterialid = $1';
              response = await t.any(query, [q.id]);

              q.alignmentobject = response;

              query = `
                SELECT u.firstname, u.lastname
                FROM educationalmaterial em
                INNER JOIN users u ON em.usersusername = u.username
                WHERE em.id = $1
              `;
              q.owner = await t.any(query, [q.id]);

              query = 'SELECT * FROM educationalaudience WHERE educationalmaterialid = $1';
              q.educationalaudience = await t.any(query, [q.id]);

              query =
                'SELECT filekey, mimetype FROM thumbnail WHERE educationalmaterialid = $1 AND obsoleted = 0';
              response = await db.oneOrNone(query, [q.id]);
              if (response) {
                response.filepath = await aoeThumbnailDownloadUrl(response.filekey);
                q.thumbnail = response;
              }
            }
            // Query to attach URN for the OAI-PMH metadata response.
            query = `
              SELECT urn, publishedat FROM educationalmaterialversion
              WHERE educationalmaterialid = $1 AND publishedat = $2
            `;
            response = await db.oneOrNone(query, [q.id, q.urnpublishedat]);
            q.urn = response?.urn || null;

            if (loadAllVersions) {
              q.aoeUrl = await getEduMaterialVersionURL(q.id, response?.publishedat ?? null);
            }

            return q;
          },
        )
        .then(t.batch)
        .catch((err: any): void => {
          winstonLogger.error('Fetching a metadata batch failed at OAI-PMH API endpoint: %o', err);
          throw err;
        });
    })
      .then((data: Record<string, unknown>[]): void => {
        res.status(200).json({
          dateMin,
          dateMax,
          materialPerPage,
          pageNumber,
          pageTotal,
          completeListSize,
          content: data,
        } as MetadataResponse);
      })
      .catch((err: any): void => {
        throw err;
      });
  } catch (err) {
    res.status(500).json({ error: err }).end();
  }
};
