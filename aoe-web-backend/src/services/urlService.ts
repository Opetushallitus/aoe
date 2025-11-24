import { config } from '@/config'

export async function aoeFileDownloadUrl(key: string) {
  return !key ? undefined : process.env.FILE_DOWNLOAD_URL + key
}

export async function aoeThumbnailDownloadUrl(id: string) {
  return !id ? undefined : process.env.THUMBNAIL_DOWNLOAD_URL + id
}

export async function aoeCollectionThumbnailDownloadUrl(id: string) {
  return !id ? undefined : process.env.COLLECTION_THUMBNAIL_DOWNLOAD_URL + id
}

export async function aoePdfDownloadUrl(key: string) {
  return !key ? undefined : config.MEDIA_FILE_PROCESS.conversionToPdfApi + key
}

export const getEduMaterialVersionURL = (id: string, date: string): string =>
  `${process.env.MATERIAL_VERSION_URL + id}/${date}`
