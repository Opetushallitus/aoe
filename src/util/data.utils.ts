export function getUnique(data: any[], uniqueProperty: string): any[] {
  return data.map(e => e[uniqueProperty])
    .map((e, i, final) => final.indexOf(e) === i && i)
    .filter(e => data[e])
    .map(e => data[e]);
}

export const sortByValue = (a: any, b: any) => {
  return a.value.localeCompare(b.value);
};
