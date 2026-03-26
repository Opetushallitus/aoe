import { z } from 'zod'

// Time-series response (usage statistics: views, searches, downloads, edits)
export const IntervalResponseSchema = z.object({
  year: z.number(),
  month: z.number().optional(),
  week: z.number().optional(),
  day: z.number().optional(),
  monthTotal: z.number().optional(),
  weekTotal: z.number().optional(),
  dayTotal: z.number().optional()
})

export const StatisticsIntervalResponseSchema = z.object({
  interval: z.string(),
  since: z.string(),
  until: z.string(),
  values: z.array(IntervalResponseSchema)
})

// Portion response shared value schema
export const PortionResponseSchema = z.object({
  key: z.string(),
  value: z.number()
})

// Published materials response (has date range, no interval)
export const StatisticsPublishedResponseSchema = z.object({
  interval: z.null(),
  since: z.string(),
  until: z.string(),
  values: z.array(PortionResponseSchema)
})

// Expired materials response (only has until date)
export const StatisticsExpiredResponseSchema = z.object({
  interval: z.null(),
  since: z.null(),
  until: z.string(),
  values: z.array(PortionResponseSchema)
})

export type IntervalResponse = z.infer<typeof IntervalResponseSchema>
export type StatisticsIntervalResponse = z.infer<typeof StatisticsIntervalResponseSchema>
export type PortionResponse = z.infer<typeof PortionResponseSchema>
export type StatisticsPublishedResponse = z.infer<typeof StatisticsPublishedResponseSchema>
export type StatisticsExpiredResponse = z.infer<typeof StatisticsExpiredResponseSchema>
