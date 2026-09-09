import { type EPerusteetDegree, ePerusteetResultPage } from '@/models/ref/data'
import * as winstonLogger from '@util/winstonLogger'

async function fetchValidEPerusteetPage(
  fetchPage: (pageNumber: number) => Promise<any>,
  pageNumber: number,
  listing: string
): Promise<{ data: EPerusteetDegree[]; sivuja: number } | undefined> {
  const response = await fetchPage(pageNumber)

  // A request that failed is not a shape problem, and getDataFromApi has already logged the
  // url and the reason. Parsing it here would report it as a missing object instead.
  if (!response) {
    return undefined
  }

  const page = ePerusteetResultPage.safeParse(response)

  if (!page.success) {
    winstonLogger.error(
      `Unusable ${listing} page ${pageNumber} from ePerusteet: ${page.error.message}`
    )
    return undefined
  }

  return page.data
}

export async function fetchAllEPerusteetPages(
  fetchPage: (pageNumber: number) => Promise<any>,
  listing: string
): Promise<EPerusteetDegree[] | undefined> {
  const firstPage = await fetchValidEPerusteetPage(fetchPage, 0, listing)

  if (!firstPage) {
    return undefined
  }

  const items = [...firstPage.data]

  for (let pageNumber = 1; pageNumber < firstPage.sivuja; pageNumber++) {
    const page = await fetchValidEPerusteetPage(fetchPage, pageNumber, listing)

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
