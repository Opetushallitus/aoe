import {
  type AlignmentObject,
  type ChildCategory,
  langSchema,
  type ReferenceDataCategory
} from '@/models/referenceData'
import licences from '@/constants/licences.json'
import {
  getReferenceData,
  getReferenceDataChildren,
  getReferenceDataItem,
  getReferenceDataWithParentNames
} from '@query/referenceDataQueries'
import { Request, Response, Router } from 'express'
import { z } from 'zod'

const langParams = z.object({ lang: z.string().toLowerCase().pipe(langSchema) })
const rowParams = langParams.extend({ key: z.string() })
const childrenParams = langParams.extend({ ids: z.string().transform((ids) => ids.split(',')) })

const route =
  <P>(paramsSchema: z.ZodType<P>, read: (params: P) => unknown) =>
  async (req: Request, res: Response): Promise<void> => {
    const params = paramsSchema.safeParse(req.params)

    if (!params.success) {
      res.status(404).json({ error: 'Not Found' }).end()
      return
    }

    const data = await read(params.data)

    if (data === undefined) {
      res.status(404).json({ error: 'Not Found' }).end()
      return
    }

    res.status(200).json(data).end()
  }

const list = (category: ReferenceDataCategory) =>
  route(langParams, ({ lang }) => getReferenceData(category, lang))

/** @deprecated Our frontend does not call the single-item routes. Check the prod access logs before removing. */
const row = (category: ReferenceDataCategory) =>
  route(rowParams, ({ lang, key }) => getReferenceDataItem(category, lang, key))

const children = (category: ChildCategory) =>
  route(childrenParams, ({ lang, ids }) => getReferenceDataChildren(category, lang, ids))

const nestedFilterOptions = (items: AlignmentObject[]) =>
  items.flatMap((item) =>
    (item.children ?? []).map((child) => ({
      key: child.key,
      value: child.targetName,
      parent: item.targetName
    }))
  )

/**
 * Reference API version 1.0 endpoints.
 *
 * Public prefix is mounted in app.ts as /ref/api/v1.
 *
 * @param router express.Router
 */
export default (router: Router): void => {
  router.get('/asiasanat/:lang', list('asiasanat'))
  router.get('/organisaatiot/:lang', list('organisaatiot'))
  router.get('/oppimateriaalityypit/:lang', list('oppimateriaalityypit'))
  router.get('/koulutusasteet/:lang', list('koulutusasteet'))
  router.get('/tieteenalat/:lang', list('tieteenalat'))
  router.get('/kohderyhmat/:lang', list('kohderyhmat'))
  router.get('/kayttokohteet/:lang', list('kayttokohteet'))
  router.get('/saavutettavuudentukitoiminnot/:lang', list('saavutettavuudentukitoiminnot'))
  router.get('/saavutettavuudenesteet/:lang', list('saavutettavuudenesteet'))
  router.get('/kielet/:lang', list('kielet'))
  router.get('/oppiaineet/:lang', list('oppiaineet'))
  router.get('/tavoitteet/:ids/:lang', children('tavoitteet'))

  router.get(
    '/sisaltoalueet/:ids/:lang',
    route(childrenParams, async ({ lang, ids }) => {
      const competences = await getReferenceData('laaja-alaiset-osaamiset', lang)
      const contents = await getReferenceDataChildren('sisaltoalueet', lang, ids)
      return contents && [...(competences ?? []), ...contents]
    })
  )

  router.get(
    '/lisenssit/:lang',
    route(langParams, ({ lang }) => licences[lang])
  )

  router.get(
    '/lukio-vanha-oppiaineet/:lang',
    route(langParams, ({ lang }) => getReferenceDataWithParentNames('lukio-vanha-oppiaineet', lang))
  )

  router.get('/lukio-vanha-kurssit/:ids/:lang', children('lukio-vanha-kurssit'))

  router.get(
    '/lukio-oppiaineet/:lang',
    route(langParams, ({ lang }) => getReferenceDataWithParentNames('lukio-uusi-oppiaineet', lang))
  )

  router.get('/lukio-moduulit/:ids/:lang', children('lukio-uusi-moduulit'))
  router.get('/lukio-tavoitteet/:ids/:lang', children('lukio-uusi-tavoitteet'))
  router.get('/lukio-sisallot/:ids/:lang', children('lukio-uusi-sisallot'))
  router.get('/ammattikoulu-tutkinnot/:lang', list('ammattikoulu-perustutkinnot'))
  router.get('/ammattikoulu-yto-aineet/:lang', list('ammattikoulun-yto-aineet'))
  router.get('/ammattikoulu-tutkinnon-osat/:ids/:lang', children('ammattikoulu-tutkinnonosat'))
  router.get('/ammattikoulu-vaatimukset/:ids/:lang', children('ammattikoulu-vaatimukset'))
  router.get('/ammattikoulu-ammattitutkinnot/:lang', list('ammattikoulu-ammattitutkinnot'))

  router.get(
    '/ammattikoulu-erikoisammattitutkinnot/:lang',
    list('ammattikoulu-erikoisammattitutkinnot')
  )

  router.get(
    '/filters-oppiaineet-tieteenalat-tutkinnot/:lang',
    route(langParams, async ({ lang }) => {
      const educationLevels = await getReferenceData('koulutusasteet', lang)
      const basicSubjects = await getReferenceData('oppiaineet', lang)
      const upperSecondarySubjects = await getReferenceData('lukio-uusi-oppiaineet', lang)
      const branchesOfScience = await getReferenceData('tieteenalat', lang)

      const filterGroup = <T>(id: string, children: T[]) => {
        const level = educationLevels?.find((educationLevel) => educationLevel.key === id)
        return {
          key: level?.key,
          value: level && level.value.charAt(0).toUpperCase() + level.value.slice(1),
          children
        }
      }

      return [
        basicSubjects
          ? filterGroup('8cb1a02f-54cb-499a-b470-4ee980519707', nestedFilterOptions(basicSubjects))
          : null,
        upperSecondarySubjects
          ? filterGroup(
              '94f79e1e-10e6-483d-b651-27521f94f7bf',
              upperSecondarySubjects.map((subject) => ({
                key: subject.key,
                value: subject.targetName,
                parent: subject.parent?.value
              }))
            )
          : null,
        null,
        branchesOfScience
          ? filterGroup(
              'e5a48ada-3de0-4246-9b8f-32d4ff68e22f',
              nestedFilterOptions(branchesOfScience)
            )
          : null
      ]
    })
  )

  router.get('/tuva-oppiaineet/:lang', list('tuva-oppiaineet'))
  router.get('/tuva-tavoitteet/:ids/:lang', children('tuva-tavoitteet'))

  /** @deprecated Our frontend does not call this. Check the prod access logs before removing. */
  router.get('/asiasanat/:key/:lang', row('asiasanat'))

  /** @deprecated Our frontend does not call this. Check the prod access logs before removing. */
  router.get('/organisaatiot/:key/:lang', row('organisaatiot'))

  /** @deprecated Our frontend does not call this. Check the prod access logs before removing. */
  router.get('/oppimateriaalityypit/:key/:lang', row('oppimateriaalityypit'))

  /** @deprecated Our frontend does not call this. Check the prod access logs before removing. */
  router.get('/koulutusasteet/:key/:lang', row('koulutusasteet'))

  /** @deprecated Our frontend does not call this. Check the prod access logs before removing. */
  router.get('/kohderyhmat/:key/:lang', row('kohderyhmat'))

  /** @deprecated Our frontend does not call this. Check the prod access logs before removing. */
  router.get('/kayttokohteet/:key/:lang', row('kayttokohteet'))

  /** @deprecated Our frontend does not call this. Check the prod access logs before removing. */
  router.get('/saavutettavuudentukitoiminnot/:key/:lang', row('saavutettavuudentukitoiminnot'))

  /** @deprecated Our frontend does not call this. Check the prod access logs before removing. */
  router.get('/saavutettavuudenesteet/:key/:lang', row('saavutettavuudenesteet'))

  /** @deprecated Our frontend does not call this. Check the prod access logs before removing. */
  router.get('/kielet/:key/:lang', row('kielet'))

  /** @deprecated Our frontend does not call this. Check the prod access logs before removing. */
  router.get('/lisenssit/:key/:lang', row('lisenssit'))

  /** @deprecated Our frontend does not call this. Check the prod access logs before removing. */
  router.get('/lukionkurssit/:lang', list('lukionkurssit'))

  /** @deprecated Our frontend does not call this. Check the prod access logs before removing. */
  router.get(
    '/lukionkurssit/:key/:lang',
    route(rowParams, async ({ lang, key }) => {
      const courses = await getReferenceData('lukionkurssit', lang)
      return courses?.find((course) => course.key.toString().toLowerCase() === key.toLowerCase())
    })
  )
}
