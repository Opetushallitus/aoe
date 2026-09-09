import { ePerusteetResultPage } from '@/models/ref/data'
import * as winstonLogger from '@util/winstonLogger'

async function fetchValidPage(
  fetchPage: (pageNumber: number) => Promise<any>,
  pageNumber: number
): Promise<{ data: any[]; sivuja: number } | undefined> {
  const page = ePerusteetResultPage.safeParse(await fetchPage(pageNumber))

  if (!page.success) {
    winstonLogger.error(`Unusable page ${pageNumber} from ePerusteet: ${page.error.message}`)
    return undefined
  }

  return page.data
}

export async function fetchAllPages(
  fetchPage: (pageNumber: number) => Promise<any>
): Promise<any[] | undefined> {
  const firstPage = await fetchValidPage(fetchPage, 0)

  if (!firstPage) {
    return undefined
  }

  const items = [...firstPage.data]

  for (let pageNumber = 1; pageNumber < firstPage.sivuja; pageNumber++) {
    const page = await fetchValidPage(fetchPage, pageNumber)

    if (!page) {
      return undefined
    }

    items.push(...page.data)
  }

  return items
}

export function getUnique<T>(data: T[], uniqueProperty: keyof T): T[] {
  const seen = new Set()
  return data.filter((item) => !seen.has(item[uniqueProperty]) && seen.add(item[uniqueProperty]))
}

export const sortByValue = (a: any, b: any) => {
  return a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: 'accent' })
}

export const sortByTargetName = (a: any, b: any) => {
  return a.targetName.localeCompare(b.targetName, undefined, {
    numeric: true,
    sensitivity: 'accent'
  })
}

export const sortByOrder = (a: any, b: any) => {
  return a.order - b.order
}
