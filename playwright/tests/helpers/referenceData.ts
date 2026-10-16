import { z } from 'zod'

const keyedItems = z.array(z.object({ key: z.union([z.string(), z.number()]) }))

export const firstKeys = (items: unknown): string =>
  keyedItems
    .parse(items)
    .slice(0, 100)
    .map(({ key }) => key)
    .join(',')
