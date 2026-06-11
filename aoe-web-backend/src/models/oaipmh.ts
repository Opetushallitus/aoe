import { z } from 'zod'

const dateField = z.preprocess(
  (val) => (val instanceof Date ? val.toISOString() : val),
  z.string().nullable().optional()
)

const MaterialDisplayNameSchema = z.object({
  displayname: z.string(),
  language: z.string()
})

const AoeMaterialSchema = z.object({
  id: z.coerce.number(),
  language: z.string().default(''),
  link: z.string().nullable().optional(),
  priority: z.number().nullable().optional(),
  filesize: z.union([z.number(), z.bigint(), z.string()]).nullable().optional(),
  mimetype: z.string().nullable().optional(),
  filekey: z.string().nullable().optional(),
  obsoleted: z.number().default(0),
  pdfkey: z.string().nullable().optional(),
  filepath: z.string().nullable().optional(),
  pdfpath: z.string().nullable().optional(),
  materialdisplayname: z.array(MaterialDisplayNameSchema).nullable().optional()
})

export const AoeMetadataSchema = z.object({
  id: z.coerce.number(),
  createdat: dateField,
  publishedat: dateField,
  urnpublishedat: dateField,
  updatedat: dateField,
  archivedat: dateField,
  obsoleted: z.number().default(0),
  timerequired: z.string().nullable().optional(),
  agerangemin: z.number().nullable().optional(),
  agerangemax: z.number().nullable().optional(),
  licensecode: z.string().nullable().optional(),
  expires: dateField,
  materials: z.array(AoeMaterialSchema).nullable().optional(),
  materialname: z
    .array(z.object({ language: z.string(), materialname: z.string() }))
    .nullable()
    .optional(),
  materialdescription: z
    .array(z.object({ language: z.string(), description: z.string() }))
    .nullable()
    .optional(),
  educationalaudience: z
    .array(z.object({ educationalrole: z.string() }))
    .nullable()
    .optional(),
  learningresourcetype: z
    .array(z.object({ value: z.string() }))
    .nullable()
    .optional(),
  accessibilityfeature: z
    .array(z.object({ value: z.string() }))
    .nullable()
    .optional(),
  accessibilityhazard: z
    .array(z.object({ value: z.string() }))
    .nullable()
    .optional(),
  keyword: z
    .array(z.object({ value: z.string(), keywordkey: z.string() }))
    .nullable()
    .optional(),
  educationallevel: z
    .array(z.object({ value: z.string() }))
    .nullable()
    .optional(),
  educationaluse: z
    .array(z.object({ value: z.string() }))
    .nullable()
    .optional(),
  publisher: z
    .array(z.object({ name: z.string() }))
    .nullable()
    .optional(),
  author: z
    .array(z.object({ authorname: z.string(), organization: z.string() }))
    .nullable()
    .optional(),
  isbasedon: z
    .array(
      z.object({
        materialname: z.string(),
        url: z.string(),
        author: z
          .array(z.object({ authorname: z.string() }))
          .nullable()
          .optional()
      })
    )
    .nullable()
    .optional(),
  alignmentobject: z
    .array(
      z.object({
        alignmenttype: z.string(),
        targetname: z.string(),
        targeturl: z.string().nullable().optional(),
        educationalframework: z.string().default('')
      })
    )
    .nullable()
    .optional(),
  thumbnail: z
    .object({
      filekey: z.string(),
      mimetype: z.string(),
      filepath: z.string().nullable().optional()
    })
    .nullable()
    .optional(),
  urn: z.string().nullable().optional(),
  aoeUrl: z.string().nullable().optional()
})

export const FetchMetadataResultSchema = z.object({
  dateMin: z.string(),
  dateMax: z.string(),
  materialPerPage: z.number(),
  pageNumber: z.number(),
  pageTotal: z.number(),
  completeListSize: z.number(),
  content: z.array(AoeMetadataSchema)
})

export const FetchMetadataParamsSchema = z.object({
  dateMin: z.string(),
  dateMax: z.string(),
  materialPerPage: z.number().int().positive(),
  pageNumber: z.number().int().nonnegative(),
  allVersions: z.boolean().default(false)
})

export const OaiPmhParamsSchema = z.object({
  verb: z.string().default(''),
  identifier: z.string().default(''),
  metadataPrefix: z.string().default(''),
  from: z.string().default(''),
  until: z.string().default(''),
  resumptionToken: z.coerce.number().int().nonnegative().default(0)
})

export type AoeMetadata = z.infer<typeof AoeMetadataSchema>
export type FetchMetadataParams = z.infer<typeof FetchMetadataParamsSchema>
export type FetchMetadataResult = z.infer<typeof FetchMetadataResultSchema>
export type OaiPmhParams = z.infer<typeof OaiPmhParamsSchema>
