import { Collection } from '@/collection/collection'
import { db, pgp } from '@resource/postgresClient'
import { aoeCollectionThumbnailDownloadUrl, aoeThumbnailDownloadUrl } from '@services/urlService'
import * as log from '@util/winstonLogger'
import { ITask } from 'pg-promise'
import { IClient } from 'pg-promise/typescript/pg-subset'

/**
 *
 * @param username
 * @param collection
 * create new collection to database
 */
export async function insertCollection(username: string, collection: Collection) {
  try {
    const id = await db.tx(async (t: any) => {
      let query
      query =
        'insert into collection (createdat, updatedat, createdby, collectionname) ' +
        'values (now(), now(), $1, $2) returning id'
      log.debug(`CollectionQueries insertCollection: ${query}`, [username, collection.name])
      const id = await t.oneOrNone(query, [username, collection.name])
      query =
        'INSERT INTO userscollection (usersusername, collectionid) ' +
        'VALUES ($1,$2) ' +
        'ON CONFLICT (usersusername, collectionid) DO NOTHING'
      log.debug(`CollectionQueries insertCollection: ${query}`, [username, id.id])
      await t.none(query, [username, id.id])
      return { id }
    })
    return id.id
  } catch (err) {
    throw new Error(err)
  }
}

/**
 *
 * @param collection
 * insert educational materials to collection
 */
export async function insertEducationalMaterialToCollection(collection: Collection) {
  try {
    const values: any[] = []
    collection.emId.map((id) =>
      values.push({ collectionid: collection.collectionId, educationalmaterialid: id })
    )
    const cs = new pgp.helpers.ColumnSet(['collectionid', 'educationalmaterialid'], {
      table: 'collectioneducationalmaterial'
    })
    const query =
      pgp.helpers.insert(values, cs) +
      ' ON CONFLICT (collectionid, educationalmaterialid) DO NOTHING;'
    log.debug(`Query in insertEducationalMaterialToCollection()${query}`)
    await db.none(query)
  } catch (err) {
    throw new Error(err)
  }
}

/**
 *
 * @param collection
 * remove educational materials from collection
 */
export async function deleteEducationalMaterialFromCollection(collection: Collection) {
  const query =
    'DELETE FROM collectioneducationalmaterial WHERE collectionid = $1 AND educationalmaterialid IN ($2:list)'
  await db.none(query, [collection.collectionId, collection.emId])
}

/**
 *
 * @param username
 * get collection for user
 */
export async function userCollections(username: string) {
  try {
    const data = await db.tx(async (t: any) => {
      const query =
        'select collection.id, publishedat, updatedat, createdat, collectionname as name, description, ct.filekey as thumbnail from collection join userscollection as uc on collection.id = uc.collectionid left join collectionthumbnail as ct on collection.id = ct.collectionid and ct.obsoleted = 0 where usersusername = $1'
      const collections = await Promise.all(
        await t.map(query, [username], async (q: any) => {
          const emIds = await t.any(
            'select educationalmaterialid as id, priority from collectioneducationalmaterial where collectionid = $1;',
            [q.id]
          )
          q.emIds = emIds.map((m) => m.id)
          if (q.thumbnail) {
            q.thumbnail = await aoeCollectionThumbnailDownloadUrl(q.thumbnail)
          }
          return q
        })
      )
      return { collections }
    })
    return data
  } catch (err) {
    throw new Error(err)
  }
}

/**
 *
 * @param collectionId
 * @param username
 * get collection educational materials and metadata
 * if published username is not required
 * otherwise check if username is owner of the collection to return data
 */
export async function collectionQuery(collectionId: string, username?: string) {
  try {
    const data = await db.task(async (t: any) => {
      let query =
        'select id, publishedat, updatedat, createdat, collectionname as name, description from collection where id = $1'
      const collection = await t.oneOrNone(query, [collectionId])
      let owner = false
      if (!collection) {
        return {}
      }
      query = 'Select * from userscollection where collectionid = $1 and usersusername = $2;'
      if (!collection.publishedat) {
        if (!username) {
          return {}
        }
        const ownerResult = await t.oneOrNone(query, [collectionId, username])
        if (!ownerResult) {
          return {}
        } else {
          owner = true
        }
      } else {
        if (!username) {
          owner = false
        }
        const ownerResult = await t.oneOrNone(query, [collectionId, username])
        if (!ownerResult) {
          owner = false
        } else {
          owner = true
        }
      }
      query = 'SELECT value, keywordkey as key FROM collectionkeyword WHERE collectionid = $1;'
      const keywords = await t.any(query, [collectionId])
      query = 'SELECT language FROM collectionlanguage WHERE collectionid = $1;'
      const languageObjects = await t.any(query, [collectionId])
      const languages = languageObjects.map((o) => o.language)
      query =
        'SELECT alignmenttype, targetname, source, educationalframework, objectkey, targeturl FROM collectionalignmentobject WHERE collectionid = $1;'
      const alignmentObjects = await t.any(query, [collectionId])
      query =
        'SELECT value, educationalusekey as key FROM collectioneducationaluse WHERE collectionid = $1;'
      const educationalUses = await t.any(query, [collectionId])
      query =
        'SELECT educationalrole as value, educationalrolekey as key FROM collectioneducationalaudience WHERE collectionid = $1;'
      const educationalRoles = await t.any(query, [collectionId])
      query =
        'SELECT value, accessibilityhazardkey as key FROM collectionaccessibilityhazard WHERE collectionid = $1;'
      const accessibilityHazards = await t.any(query, [collectionId])
      query =
        'SELECT value, accessibilityfeaturekey as key FROM collectionaccessibilityfeature WHERE collectionid = $1;'
      const accessibilityFeatures = await t.any(query, [collectionId])
      query =
        'SELECT value, educationallevelkey as key FROM collectioneducationallevel WHERE collectionid = $1;'
      const educationalLevels = await t.any(query, [collectionId])

      query =
        'select educationalmaterialid as id, priority, publishedat from collectioneducationalmaterial as cem left join educationalmaterial as em on cem.educationalmaterialid = em.id where collectionid = $1;'
      const educationalmaterials = await Promise.all(
        await t.map(query, [collection.id], async (q: any) => {
          query =
            'select authorname, organization, organizationkey from author where educationalmaterialid = $1'
          q.author = await t.any(query, [q.id])
          query =
            'select licensecode as key, l.license as value from educationalmaterial as m left join licensecode as l ON l.code = m.licensecode where id = $1'
          q.license = await t.oneOrNone(query, [q.id])
          query = 'select * from materialname where educationalmaterialid = $1'
          const emname = await t.any(query, [q.id])
          q.name = emname.reduce(function (map, obj) {
            map[obj.language] = obj.materialname
            return map
          }, {})
          query = 'select * from materialdescription where educationalmaterialid = $1;'
          const emdescription = await t.any(query, [q.id])
          q.description = emdescription.reduce(function (map, obj) {
            map[obj.language] = obj.description
            return map
          }, {})
          query =
            'Select filekey as thumbnail from thumbnail where educationalmaterialid = $1 and obsoleted = 0;'
          const thumbnailresponse = await t.oneOrNone(query, [q.id])
          if (thumbnailresponse) {
            thumbnailresponse.thumbnail = await aoeThumbnailDownloadUrl(thumbnailresponse.thumbnail)
          }
          q.thumbnail = thumbnailresponse

          query = 'select * from learningresourcetype where educationalmaterialid = $1;'
          q.learningResourceTypes = await t.any(query, [q.id])

          return q
        })
      )
      query =
        'SELECT id, heading, description, priority FROM collectionheading WHERE collectionid = $1;'
      const headings = await t.any(query, [collectionId])

      query =
        'Select filepath, filekey as thumbnail from collectionthumbnail where collectionid = $1 and obsoleted = 0;'
      let response = await db.oneOrNone(query, [collectionId])
      let thumbnail
      if (response) {
        thumbnail = await aoeCollectionThumbnailDownloadUrl(response.thumbnail)
      }
      query =
        "select concat(firstname, ' ', lastname) as name from userscollection join users on usersusername = username where collectionid = $1;"
      response = await t.any(query, [collectionId])
      const authors = []
      response.map((o) => authors.push(o.name))
      return {
        collection,
        keywords,
        languages,
        alignmentObjects,
        educationalUses,
        educationalRoles,
        educationalmaterials,
        accessibilityHazards,
        accessibilityFeatures,
        educationalLevels,
        headings,
        owner,
        thumbnail,
        authors
      }
    })
    return data
  } catch (err) {
    log.error(err)
    throw new Error(err)
  }
}

/**
 *
 * @param collection
 * insert metadata to collection
 */
export async function insertCollectionMetadata(collection: Collection) {
  try {
    const collectionId = collection.collectionId
    await db.tx(async (t: any) => {
      const description = collection.description || ''

      // Update collection description and name
      await t.none(
        'UPDATE collection SET description = $1, collectionname = $2, updatedat = now() WHERE id = $3',
        [description, collection.name, collectionId]
      )

      // Update keywords
      await t.none('DELETE FROM collectionkeyword WHERE collectionid = $1', [collectionId])
      if (collection.keywords) {
        for (const element of collection.keywords) {
          await t.none(
            'INSERT INTO collectionkeyword (collectionid, value, keywordkey) VALUES ($1, $2, $3)',
            [collectionId, element.value, element.key]
          )
        }
      }

      // Update languages
      await t.none('DELETE FROM collectionlanguage WHERE collectionid = $1', [collectionId])
      if (collection.languages) {
        for (const element of collection.languages) {
          await t.none('INSERT INTO collectionlanguage (collectionid, language) VALUES ($1, $2)', [
            collectionId,
            element
          ])
        }
      }

      // Update educational audiences
      await t.none('DELETE FROM collectioneducationalaudience WHERE collectionid = $1', [
        collectionId
      ])
      if (collection.educationalRoles) {
        for (const element of collection.educationalRoles) {
          await t.none(
            'INSERT INTO collectioneducationalaudience (collectionid, educationalrole, educationalrolekey) VALUES ($1, $2, $3)',
            [collectionId, element.value, element.key]
          )
        }
      }

      // Update alignment objects
      await t.none('DELETE FROM collectionalignmentobject WHERE collectionid = $1', [collectionId])
      if (collection.alignmentObjects) {
        for (const element of collection.alignmentObjects) {
          await t.none(
            'INSERT INTO collectionalignmentobject (collectionid, alignmenttype, targetname, source, objectkey, educationalframework, targeturl) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [
              collectionId,
              element.alignmentType,
              element.targetName,
              element.source,
              element.key,
              element.educationalFramework,
              element.targetUrl
            ]
          )
        }
      }

      // Update educational uses
      await t.none('DELETE FROM collectioneducationaluse WHERE collectionid = $1', [collectionId])
      if (collection.educationalUses) {
        for (const element of collection.educationalUses) {
          await t.none(
            'INSERT INTO collectioneducationaluse (collectionid, value, educationalusekey) VALUES ($1, $2, $3)',
            [collectionId, element.value, element.key]
          )
        }
      }

      // Update accessibility hazards
      await t.none('DELETE FROM collectionaccessibilityhazard WHERE collectionid = $1', [
        collectionId
      ])
      if (collection.accessibilityHazards) {
        for (const element of collection.accessibilityHazards) {
          await t.none(
            'INSERT INTO collectionaccessibilityhazard (collectionid, value, accessibilityhazardkey) VALUES ($1, $2, $3)',
            [collectionId, element.value, element.key]
          )
        }
      }

      // Update accessibility features
      await t.none('DELETE FROM collectionaccessibilityfeature WHERE collectionid = $1', [
        collectionId
      ])
      if (collection.accessibilityFeatures) {
        for (const element of collection.accessibilityFeatures) {
          await t.none(
            'INSERT INTO collectionaccessibilityfeature (collectionid, value, accessibilityfeaturekey) VALUES ($1, $2, $3)',
            [collectionId, element.value, element.key]
          )
        }
      }

      // Update educational levels
      await t.none('DELETE FROM collectioneducationallevel WHERE collectionid = $1', [collectionId])
      if (collection.educationalLevels) {
        for (const element of collection.educationalLevels) {
          await t.none(
            'INSERT INTO collectioneducationallevel (collectionid, value, educationallevelkey) VALUES ($1, $2, $3)',
            [collectionId, element.value, element.key]
          )
        }
      }

      // Update publish status
      if (collection.publish) {
        await t.none(
          'UPDATE collection SET publishedat = now() WHERE id = $1 AND publishedat IS NULL',
          [collectionId]
        )
      }

      // Update materials
      if (collection.materials) {
        for (const element of collection.materials) {
          await t.none(
            'UPDATE collectioneducationalmaterial SET priority = $1 WHERE collectionid = $2 AND educationalmaterialid = $3',
            [element.priority, collectionId, element.id]
          )
        }
      }

      // Update headings
      await t.none('DELETE FROM collectionheading WHERE collectionid = $1', [collectionId])
      if (collection.headings) {
        for (const element of collection.headings) {
          await t.none(
            'INSERT INTO collectionheading (collectionid, heading, description, priority) VALUES ($1, $2, $3, $4)',
            [collectionId, element.heading, element.description, element.priority]
          )
        }
      }
    })
  } catch (err) {
    log.error('Error in insertCollectionMetadata()', err)
    throw new Error(err)
  }
}

export async function recentCollectionQuery() {
  try {
    const data = await db.tx(async (t: ITask<IClient>) => {
      const collections = await Promise.all(
        await t.map(
          'SELECT collection.id, publishedat, updatedat, createdat, collectionname AS name, description FROM collection WHERE publishedat IS NOT NULL ORDER BY updatedAt DESC LIMIT 6',
          [],
          async (collection: any) => {
            collection.keywords = await t.any(
              'SELECT value, keywordkey AS key FROM collectionkeyword WHERE collectionid = $1',
              [collection.id]
            )

            const languageObjects = await t.any(
              'SELECT language FROM collectionlanguage WHERE collectionid = $1',
              [collection.id]
            )
            collection.languages = languageObjects.map((o) => o.language)

            collection.alignmentObjects = await t.any(
              'SELECT alignmenttype, targetname, source, educationalframework, objectkey, targeturl FROM collectionalignmentobject WHERE collectionid = $1',
              [collection.id]
            )

            collection.educationalUses = await t.any(
              'SELECT value, educationalusekey AS key FROM collectioneducationaluse WHERE collectionid = $1',
              [collection.id]
            )

            collection.educationalRoles = await t.any(
              'SELECT educationalrole AS value, educationalrolekey AS key FROM collectioneducationalaudience WHERE collectionid = $1',
              [collection.id]
            )

            collection.accessibilityHazards = await t.any(
              'SELECT value, accessibilityhazardkey AS key FROM collectionaccessibilityhazard WHERE collectionid = $1',
              [collection.id]
            )

            collection.accessibilityFeatures = await t.any(
              'SELECT value, accessibilityfeaturekey AS key FROM collectionaccessibilityfeature WHERE collectionid = $1',
              [collection.id]
            )

            collection.educationalLevels = await t.any(
              'SELECT value, educationallevelkey AS key FROM collectioneducationallevel WHERE collectionid = $1',
              [collection.id]
            )

            const thumbnailResponse = await t.oneOrNone(
              'SELECT filepath, filekey AS thumbnail FROM collectionthumbnail WHERE collectionid = $1 AND obsoleted = 0',
              [collection.id]
            )
            collection.thumbnail = thumbnailResponse
              ? await aoeCollectionThumbnailDownloadUrl(thumbnailResponse.thumbnail)
              : undefined

            const authorResponse = await t.any(
              "SELECT CONCAT(firstname, ' ', lastname) AS name FROM userscollection JOIN users ON usersusername = username WHERE collectionid = $1",
              [collection.id]
            )
            collection.authors = authorResponse.map((o) => o.name)

            return collection
          }
        )
      )
      return { collections }
    })
    return data
  } catch (err) {
    log.error('Error in recentCollectionQuery()', err)
    throw new Error(err)
  }
}
