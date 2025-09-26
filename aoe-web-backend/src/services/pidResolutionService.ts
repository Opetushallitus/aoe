import { updateEduMaterialVersionURN } from '@query/apiQueries'
import { getEdumaterialVersionsWithoutURN } from '@query/pidQueries'
import { getEduMaterialVersionURL } from './urlService'
import { debug, error } from '@util/winstonLogger'
import { Urn } from '@domain/aoeModels'

/**
 * Request for PID registration using URN type.
 * @param url string Resource URL for PID registration.
 */
export const registerPID = async (url: string): Promise<string> => {
  const record = await Urn.findOne({
    where: { material_url: url }
  })

  if (record) {
    error(`URL ${url} already has urn generated`)
    return null
  }

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
  try {
    const limit = 5000
    const eduMaterialVersions: {
      educationalmaterialid: string
      publishedat: string
    }[] = await getEdumaterialVersionsWithoutURN(limit)

    let eduMaterialVersionURL: string
    let registeredURN: string

    for (const eduMaterialVersion of eduMaterialVersions) {
      eduMaterialVersionURL = await getEduMaterialVersionURL(
        eduMaterialVersion.educationalmaterialid,
        eduMaterialVersion.publishedat
      )
      registeredURN = await registerPID(eduMaterialVersionURL)

      if (typeof registeredURN === 'string' && registeredURN.length > 0) {
        await updateEduMaterialVersionURN(
          eduMaterialVersion.educationalmaterialid,
          eduMaterialVersion.publishedat,
          registeredURN
        )
      } else {
        return Promise.reject(
          Error(
            `PID registration for an educational material version failed in ` +
              `processEntriesWithoutPID() [educationalmaterialid=${eduMaterialVersion.educationalmaterialid}, ` +
              `eduMaterialVersionURL=${eduMaterialVersionURL}, registeredURN=${registeredURN}]`
          )
        )
      }
      debug(
        `URN registration completed: eduMaterialVersionURL=${eduMaterialVersionURL} => registeredURN=${registeredURN}`
      )
    }
  } catch (error) {
    throw Error(
      'PID registration for educational materials without PID failed in processEntriesWithoutPID(): ' +
        error
    )
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

export default {
  processEntriesWithoutPID,
  registerPID
}
