import type {
  EPerusteetDegree,
  EPerusteetResultPage,
  Lang,
  LocalizedText
} from '@/models/referenceData'

export async function fetchAllEPerusteetPages(
  fetchPage: (pageNumber: number) => Promise<EPerusteetResultPage>
): Promise<EPerusteetDegree[]> {
  const firstPage = await fetchPage(0)
  const items = [...firstPage.data]

  for (let pageNumber = 1; pageNumber < firstPage.sivuja; pageNumber++) {
    const page = await fetchPage(pageNumber)
    items.push(...page.data)
  }

  return items
}

export function getUnique<T>(data: T[], uniqueProperty: keyof T): T[] {
  const seen = new Set()
  return data.filter((item) => !seen.has(item[uniqueProperty]) && seen.add(item[uniqueProperty]))
}

const compareText = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'accent' })

export const sortByValue = (a: { value: string }, b: { value: string }): number =>
  compareText(a.value, b.value)

export const sortByTargetName = (a: { targetName: string }, b: { targetName: string }): number =>
  compareText(a.targetName, b.targetName)

const fallbackOrder: Record<Lang, Lang[]> = {
  fi: ['fi', 'sv', 'en'],
  sv: ['sv', 'fi', 'en'],
  en: ['en', 'fi', 'sv']
}

export const label = (text: LocalizedText, lang: Lang): string =>
  fallbackOrder[lang].map((fallback) => text[fallback]).find(Boolean)
