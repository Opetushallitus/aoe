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
