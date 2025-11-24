import { updateEduMaterialVersionURN } from '@query/apiQueries'
import { getEduMaterialVersionURL } from './urlService'
import { db } from '@resource/postgresClient'
import * as log from '@util/winstonLogger'
import { Urn } from '@domain/aoeModels'
import { ITask } from 'pg-promise'
import { IClient } from 'pg-promise/typescript/pg-subset'

/**
 * Request for PID registration using URN type.
 * @param url string Resource URL for PID registration.
 */
export const registerPID = async (url: string): Promise<string> => {
  const newId = await Urn.create({ material_url: url })
  const internalId = newId.id
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')

  // Previous URN generator generated formattedInternalId with 8 digits. To prevent possible duplicates increase it to 9
  const formattedInternalId = internalId.toString().padStart(9, '0')
  const formattedString = `${year}${month}${formattedInternalId}`

  const luhnChecksum = calculateLuhn(formattedString)
  return `urn:nbn:fi:oerfi-${year}${month}${formattedInternalId}_${luhnChecksum}`
}

/**
 * Fetch recently published educational materials without a PID identifier and run the registration process to
 * attach a permanent URN typed resource PID identifier (URL).
 */
export const processEntriesWithoutPID = async (): Promise<void> => {
  const limit = 5000
  const eduMaterialVersions = await getEdumaterialVersionsWithoutURN(limit)

  for (const eduMaterialVersion of eduMaterialVersions) {
    try {
      const eduMaterialVersionURL = getEduMaterialVersionURL(
        eduMaterialVersion.educationalmaterialid,
        eduMaterialVersion.publishedat
      )

      const record = await Urn.findOne({
        where: { material_url: eduMaterialVersionURL }
      })

      if (record) {
        log.info(`Skipping URL ${eduMaterialVersionURL} that already has urn generated.`)
        continue
      }

      const registeredURN = await registerPID(eduMaterialVersionURL)

      await updateEduMaterialVersionURN(
        eduMaterialVersion.educationalmaterialid,
        eduMaterialVersion.publishedat,
        registeredURN
      )
      log.debug(
        `URN registration completed: eduMaterialVersionURL=${eduMaterialVersionURL} => registeredURN=${registeredURN}`
      )
    } catch (error) {
      log.error(
        `PID registration for educational material with id ${eduMaterialVersion.educationalmaterialid} failed`,
        error
      )
    }
  }
}

export const getEdumaterialVersionsWithoutURN = async (limit: number) => {
  try {
    return await db.task(async (t: ITask<IClient>) => {
      return await t.manyOrNone<{
        educationalmaterialid: string
        publishedat: string
      }>(
        `SELECT educationalmaterialid, publishedat
          FROM educationalmaterialversion
          WHERE urn IS NULL
          ORDER BY educationalmaterialid
          LIMIT $1`,
        [limit]
      )
    })
  } catch (err) {
    log.error(`Querying educational material versions with missing urns failed`, err)
    throw err
  }
}

const calculateLuhn = (number: string): number => {
  let sum = 0
  let alternate = false

  for (let i = number.length - 1; i >= 0; i--) {
    let n = parseInt(number[i], 10)

    if (alternate) {
      n *= 2
      if (n > 9) {
        n -= 9
      }
    }

    sum += n
    alternate = !alternate
  }

  return (10 - (sum % 10)) % 10
}
