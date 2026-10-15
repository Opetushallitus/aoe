import striptags from 'striptags'

import { config } from '@/config'
import {
  type AlignmentObject,
  basicEducationSubject,
  basicEducationSubjectList,
  type ChildAlignment,
  type EPerusteetDegree,
  ePerusteetPeruste,
  ePerusteetResultPage,
  type Lang,
  langSchema,
  type LocalizedText,
  oldUpperSecondarySubjects,
  preparatoryEducation,
  type ReferenceData,
  type ReferenceDataCategory,
  type TransversalCompetence,
  transversalCompetences,
  upperSecondaryCourse,
  upperSecondaryModuleDetails,
  upperSecondarySubject,
  upperSecondarySubjectList
} from '@/models/referenceData'
import {
  getReferenceData,
  type ReferenceDataEntry,
  saveReferenceData
} from '@query/referenceDataQueries'
import {
  fetchAllEPerusteetPages,
  getUnique,
  label,
  sortByTargetName
} from '@/helpers/referenceData'
import { fetchJson } from '@resource/httpClient'
import { ensureNotSmallerThanStored, opintopolkuHeaders } from '@services/referenceDataService'
import { z } from 'zod'

type EPerusteetLang = 'fi' | 'sv'

const ePerusteetLangs: EPerusteetLang[] = ['fi', 'sv']

const emptyLists = <T>(): Record<EPerusteetLang, T[]> => ({ fi: [], sv: [] })

const finnishAsEnglish = <C extends ReferenceDataCategory>(
  category: C,
  lists: Record<EPerusteetLang, ReferenceData<C>>
): ReferenceDataEntry<C>[] => [
  { category, lang: 'fi', value: lists.fi },
  { category, lang: 'sv', value: lists.sv },
  { category, lang: 'en', value: lists.fi }
]

const getPeruste = <T>(params: string, schema: z.ZodType<T>): Promise<T> =>
  fetchJson(
    `${config.EXTERNAL_API.ePerusteet}/external/peruste/${params}`,
    schema,
    opintopolkuHeaders
  )

const upcomingSuffix: Record<Lang, string> = {
  fi: ' (Tuleva)',
  sv: ' (På kommande)',
  en: ' (In progress)'
}

const transitionSuffix: Record<Lang, string> = {
  fi: ' (Siirtymäajalla)',
  sv: ' (Övergångstid)',
  en: ' (On transition time)'
}

const degreeName = (degree: EPerusteetDegree, lang: Lang, now: number): string =>
  `${label(degree.nimi, lang)}${degree.voimassaoloAlkaa > now ? upcomingSuffix[lang] : ''}${
    degree.siirtymaPaattyy ? transitionSuffix[lang] : ''
  }`

const setVocationalDegrees = async (
  category:
    | 'ammattikoulu-perustutkinnot'
    | 'ammattikoulu-ammattitutkinnot'
    | 'ammattikoulu-erikoisammattitutkinnot',
  koulutustyyppi: string,
  source: string
): Promise<void> => {
  const degrees = await fetchAllEPerusteetPages((pageNumber) =>
    fetchJson(
      `${config.EXTERNAL_API.ePerusteet}/external/perusteet/?sivu=${pageNumber}&tulevat=true&siirtyma=true&voimassa=true&poistuneet=false&koulutustyyppi=${koulutustyyppi}`,
      ePerusteetResultPage,
      opintopolkuHeaders
    )
  )

  const now = Date.now()

  await saveReferenceData(
    langSchema.options.map((lang) => {
      const items = degrees
        .map(
          (degree): AlignmentObject => ({
            key: degree.id,
            source,
            alignmentType: 'educationalSubject',
            targetName: degreeName(degree, lang, now),
            targetUrl: `${config.EXTERNAL_API.ePerusteet}/external/peruste/${degree.id}`
          })
        )
        .sort(sortByTargetName)

      return { category, lang, value: getUnique(items, 'targetName') }
    })
  )
}

export const setAmmattikoulunPerustutkinnot = (): Promise<void> =>
  setVocationalDegrees('ammattikoulu-perustutkinnot', 'koulutustyyppi_1', 'vocationalDegrees')

export const setAmmattikoulunAmmattitutkinnot = (): Promise<void> =>
  setVocationalDegrees(
    'ammattikoulu-ammattitutkinnot',
    'koulutustyyppi_11',
    'furtherVocationalQualifications'
  )

export const setAmmattikoulunErikoisammattitutkinnot = (): Promise<void> =>
  setVocationalDegrees(
    'ammattikoulu-erikoisammattitutkinnot',
    'koulutustyyppi_12',
    'specialistVocationalQualifications'
  )

export async function setAmmattikoulunTutkinnonOsat(): Promise<void> {
  const basicDegrees = await getReferenceData('ammattikoulu-perustutkinnot', 'fi')
  const furtherQualifications = await getReferenceData('ammattikoulu-ammattitutkinnot', 'fi')
  const specialistQualifications = await getReferenceData(
    'ammattikoulu-erikoisammattitutkinnot',
    'fi'
  )

  if (!basicDegrees || !furtherQualifications || !specialistQualifications) {
    throw new Error('No stored vocational degrees to read the units from')
  }

  const units: Record<Lang, ChildAlignment[]> = { fi: [], sv: [], en: [] }
  const requirements = emptyLists<ChildAlignment>()

  for (const degree of [...basicDegrees, ...furtherQualifications, ...specialistQualifications]) {
    const peruste = await getPeruste(`${degree.key}`, ePerusteetPeruste)

    for (const unit of peruste.tutkinnonOsat) {
      for (const lang of langSchema.options) {
        units[lang].push({
          key: unit.id,
          parent: { key: peruste.id, value: label(peruste.nimi, lang) },
          source: 'vocationalUnits',
          alignmentType: 'educationalSubject',
          targetName: label(unit.nimi, lang)
        })
      }

      for (const target of unit.ammattitaitovaatimukset2019?.kohdealueet ?? []) {
        for (const requirement of target.vaatimukset) {
          for (const lang of ePerusteetLangs) {
            requirements[lang].push({
              key: requirement.koodi.arvo,
              parent: {
                key: unit.id,
                value: target.kuvaus ? label(target.kuvaus, lang) : undefined
              },
              source: 'vocationalRequirements',
              alignmentType: 'teaches',
              targetName: label(requirement.vaatimus, lang)
            })
          }
        }
      }
    }
  }

  if (units.fi.length < 1) {
    throw new Error('No vocational units from ePerusteet')
  }

  await saveReferenceData([
    ...langSchema.options.map(
      (lang): ReferenceDataEntry => ({
        category: 'ammattikoulu-tutkinnonosat',
        lang,
        value: units[lang]
      })
    ),
    ...finnishAsEnglish('ammattikoulu-vaatimukset', requirements)
  ])
}

export async function setAmmattikoulunYTOaineet(): Promise<void> {
  const peruste = await getPeruste('yto', ePerusteetPeruste)

  await saveReferenceData(
    langSchema.options.map((lang) => {
      const commonUnits = peruste.tutkinnonOsat
        .map((degree): AlignmentObject => {
          const targetName = label(degree.nimi, lang)

          return {
            key: degree.id,
            source: 'commonUnit',
            alignmentType: 'educationalSubject',
            targetName,
            children: [
              {
                key: degree.id,
                source: 'commonUnit',
                alignmentType: 'educationalSubject',
                targetName
              },
              ...degree.osaAlueet.map(
                (unit): AlignmentObject => ({
                  key: unit.id,
                  source: 'subjectOfCommonUnit',
                  alignmentType: 'educationalSubject',
                  targetName: label(unit.nimi, lang)
                })
              )
            ]
          }
        })
        .sort(sortByTargetName)

      return {
        category: 'ammattikoulun-yto-aineet',
        lang,
        value: getUnique(commonUnits, 'targetName')
      }
    })
  )
}

const upperSecondaryParams = '6828810/lops2019/oppiaineet'

export async function setLukionOppiaineetModuulit(): Promise<void> {
  const subjectList = await getPeruste(upperSecondaryParams, upperSecondarySubjectList)
  const subjects = emptyLists<AlignmentObject>()
  const modules = emptyLists<ChildAlignment>()

  for (const row of subjectList) {
    const subject = await getPeruste(`${upperSecondaryParams}/${row.id}`, upperSecondarySubject)
    const subjectUrl = `${config.EXTERNAL_API.ePerusteet}/external/peruste/${upperSecondaryParams}/${subject.id}`

    if (subject.moduulit?.length > 0) {
      for (const lang of ePerusteetLangs) {
        subjects[lang].push({
          key: subject.id,
          source: 'upperSecondarySchoolSubjectsNew',
          alignmentType: 'educationalSubject',
          targetName: label(subject.nimi, lang),
          targetUrl: subjectUrl
        })

        for (const module of subject.moduulit) {
          modules[lang].push({
            key: module.id,
            parent: { key: subject.id, value: label(subject.nimi, lang) },
            source: 'upperSecondarySchoolModulesNew',
            alignmentType: 'educationalSubject',
            targetName: label(module.nimi, lang),
            targetUrl: `${subjectUrl}/moduulit/${module.id}`
          })
        }
      }
    }

    for (const row of subject.oppimaarat ?? []) {
      const course = await getPeruste(
        `${upperSecondaryParams}/${subject.id}/oppimaarat/${row.id}`,
        upperSecondaryCourse
      )
      const courseUrl = `${subjectUrl}/oppimaarat/${course.id}`

      for (const lang of ePerusteetLangs) {
        subjects[lang].push({
          key: course.id,
          parent: { key: subject.id, value: label(subject.nimi, lang) },
          source: 'upperSecondarySchoolSubjectsNew',
          alignmentType: 'educationalSubject',
          targetName: label(course.nimi, lang),
          targetUrl: courseUrl
        })

        for (const module of course.moduulit) {
          modules[lang].push({
            key: module.id,
            parent: { key: course.id, value: label(course.nimi, lang) },
            source: 'upperSecondarySchoolModulesNew',
            alignmentType: 'educationalSubject',
            targetName: label(module.nimi, lang),
            targetUrl: `${courseUrl}/moduulit/${module.id}`
          })
        }
      }
    }
  }

  await ensureNotSmallerThanStored('lukio-uusi-oppiaineet', subjects)
  await ensureNotSmallerThanStored('lukio-uusi-moduulit', modules)

  subjects.fi.sort(sortByTargetName)
  subjects.sv.sort(sortByTargetName)

  await saveReferenceData([
    ...finnishAsEnglish('lukio-uusi-oppiaineet', subjects),
    ...finnishAsEnglish('lukio-uusi-moduulit', modules)
  ])
}

export async function setLukionTavoitteetSisallot(): Promise<void> {
  const storedSubjects = await getReferenceData('lukio-uusi-oppiaineet', 'fi')
  const storedModules = await getReferenceData('lukio-uusi-moduulit', 'fi')

  if (!storedSubjects || !storedModules) {
    throw new Error('No stored upper secondary subjects or modules to read the objectives from')
  }

  // Only an oppimäärä carries a parent in the stored subjects, and its modules are
  // served under the full parent path in ePerusteet.
  const parentBySubjectId = new Map(
    storedSubjects.flatMap((subject): [AlignmentObject['key'], AlignmentObject['key']][] =>
      subject.parent ? [[subject.key, subject.parent.key]] : []
    )
  )

  const objectives = emptyLists<ChildAlignment>()
  const contents = emptyLists<ChildAlignment>()

  for (const module of storedModules) {
    const subjectId = module.parent.key
    const parentSubjectId = parentBySubjectId.get(subjectId)
    const subjectParams = parentSubjectId
      ? `${upperSecondaryParams}/${parentSubjectId}/oppimaarat/${subjectId}`
      : `${upperSecondaryParams}/${subjectId}`

    const details = await getPeruste(
      `${subjectParams}/moduulit/${module.key}`,
      upperSecondaryModuleDetails
    )

    for (const lang of ePerusteetLangs) {
      const parent = { key: details.id, value: label(details.nimi, lang) }

      for (const objective of details.tavoitteet?.tavoitteet ?? []) {
        objectives[lang].push({
          key: objective._id,
          parent,
          source: 'upperSecondarySchoolObjectivesNew',
          alignmentType: 'teaches',
          targetName: label(objective, lang)
        })
      }

      for (const contentObject of details.sisallot ?? []) {
        for (const content of contentObject.sisallot) {
          contents[lang].push({
            key: content._id,
            parent,
            source: 'upperSecondarySchoolContentsNew',
            alignmentType: 'teaches',
            targetName: label(content, lang)
          })
        }
      }
    }
  }

  await saveReferenceData([
    ...finnishAsEnglish('lukio-uusi-tavoitteet', objectives),
    ...finnishAsEnglish('lukio-uusi-sisallot', contents)
  ])
}

export async function setLukionVanhatOppiaineetKurssit(): Promise<void> {
  const structure = await fetchJson(
    `${config.EXTERNAL_API.ePerusteet}/perusteet/1372910/lukiokoulutus/julkinen/oppiainerakenne`,
    oldUpperSecondarySubjects,
    opintopolkuHeaders
  )

  const subjects = emptyLists<AlignmentObject>()
  const courses = emptyLists<ChildAlignment>()

  const pushCourses = (
    parent: { koodiArvo: string; nimi: LocalizedText },
    parentCourses: { koodiArvo: string; nimi: LocalizedText }[]
  ): void => {
    for (const course of parentCourses) {
      for (const lang of ePerusteetLangs) {
        courses[lang].push({
          key: course.koodiArvo,
          parent: { key: parent.koodiArvo, value: label(parent.nimi, lang) },
          source: 'upperSecondarySchoolCoursesOld',
          alignmentType: 'educationalSubject',
          targetName: label(course.nimi, lang)
        })
      }
    }
  }

  for (const subject of structure.oppiaineet) {
    if (subject.oppimaarat?.length === 0) {
      for (const lang of ePerusteetLangs) {
        subjects[lang].push({
          key: subject.koodiArvo,
          source: 'upperSecondarySchoolSubjectsOld',
          alignmentType: 'educationalSubject',
          targetName: label(subject.nimi, lang)
        })
      }
    }

    pushCourses(subject, subject.kurssit ?? [])

    for (const subSubject of subject.oppimaarat ?? []) {
      for (const lang of ePerusteetLangs) {
        subjects[lang].push({
          key: subSubject.koodiArvo,
          parent: { key: subject.koodiArvo, value: label(subject.nimi, lang) },
          source: 'upperSecondarySchoolSubjectsOld',
          alignmentType: 'educationalSubject',
          targetName: label(subSubject.nimi, lang)
        })
      }

      pushCourses(subSubject, subSubject.kurssit ?? [])
    }
  }

  for (const lang of ePerusteetLangs) {
    subjects[lang].sort(sortByTargetName)
    courses[lang].sort(sortByTargetName)
  }

  await saveReferenceData([
    ...finnishAsEnglish('lukio-vanha-oppiaineet', subjects),
    ...finnishAsEnglish('lukio-vanha-kurssit', courses)
  ])
}

const preparatoryEducationId = '7534950'

export async function setTuvaOppiaineetTavoitteet(): Promise<void> {
  const education = await getPeruste(preparatoryEducationId, preparatoryEducation)
  const targetUrl = `${config.EXTERNAL_API.ePerusteet}/external/peruste/${preparatoryEducationId}`
  const subjects = emptyLists<AlignmentObject>()
  const objectives = emptyLists<ChildAlignment>()

  for (const subject of education.koulutuksenOsat) {
    for (const lang of ePerusteetLangs) {
      subjects[lang].push({
        key: subject.id,
        source: 'preparatoryEducationSubjects',
        alignmentType: 'educationalSubject',
        targetName: label(subject.nimi, lang),
        targetUrl
      })

      for (const objective of subject.tavoitteet ?? []) {
        objectives[lang].push({
          key: objective._id,
          parent: { key: subject.id, value: label(subject.nimi, lang) },
          source: 'preparatoryEducationObjectives',
          alignmentType: 'teaches',
          targetName: label(objective, lang),
          targetUrl
        })
      }
    }
  }

  subjects.fi.sort(sortByTargetName)
  subjects.sv.sort(sortByTargetName)

  await saveReferenceData([
    ...finnishAsEnglish('tuva-oppiaineet', subjects),
    ...finnishAsEnglish('tuva-tavoitteet', objectives)
  ])
}

const basicEducationParams = '419550/perusopetus/oppiaineet'
const transversalCompetenceParams = '419550/perusopetus/laajaalaisetosaamiset'
const otherSubjects = 999

const competenceGroup: Record<EPerusteetLang, string> = {
  fi: 'Laaja-alaisen osaamisen alueet',
  sv: 'Mångsidiga kompetensområden'
}

const withoutTags = (text: string | undefined): string | undefined =>
  text ? striptags(text).trim() : text

export async function setPerusopetuksenOppiaineet(): Promise<void> {
  const subjectList = await getPeruste(basicEducationParams, basicEducationSubjectList)

  const subjectIds: { key: number; parent?: number }[] = subjectList.flatMap((result) =>
    result.oppimaarat
      ? [
          { key: result.id },
          ...result.oppimaarat.map((oppimaara) => ({ key: oppimaara.id, parent: result.id }))
        ]
      : [{ key: result.id, parent: otherSubjects }]
  )

  const subjects: { key: number; parent?: number; name: LocalizedText }[] = [
    { key: otherSubjects, name: { fi: 'Muut oppiaineet', sv: 'Muut oppiaineet' } }
  ]
  const objectives = emptyLists<ChildAlignment>()
  const contents = emptyLists<ChildAlignment>()

  for (const row of subjectIds) {
    // An oppimäärä is only served under its parent subject. The synthetic parent 999
    // groups the top level subjects that have no oppimaarat of their own.
    const subjectParams =
      row.parent && row.parent !== otherSubjects
        ? `${basicEducationParams}/${row.parent}/oppimaarat/${row.key}`
        : `${basicEducationParams}/${row.key}`

    const subject = await getPeruste(subjectParams, basicEducationSubject)

    subjects.push({ ...row, name: subject.nimi })

    const targetUrl = `${config.EXTERNAL_API.ePerusteet}/external/peruste/${subjectParams}`

    for (const gradeEntity of subject.vuosiluokkakokonaisuudet) {
      for (const objective of gradeEntity.tavoitteet ?? []) {
        const objectiveText = {
          fi: withoutTags(objective.tavoite.fi),
          sv: withoutTags(objective.tavoite.sv)
        }

        for (const lang of ePerusteetLangs) {
          objectives[lang].push({
            key: objective.id,
            parent: { key: subject.id, value: label(subject.nimi, lang) },
            gradeEntity: gradeEntity.id,
            source: 'basicStudyObjectives',
            alignmentType: 'teaches',
            targetName: label(objectiveText, lang),
            targetUrl
          })
        }
      }

      for (const content of gradeEntity.sisaltoalueet ?? []) {
        const contentName = { fi: withoutTags(content.nimi.fi), sv: withoutTags(content.nimi.sv) }

        for (const lang of ePerusteetLangs) {
          contents[lang].push({
            key: content.id,
            parent: { key: subject.id, value: label(subject.nimi, lang) },
            gradeEntity: gradeEntity.id,
            source: 'basicStudyContents',
            alignmentType: 'teaches',
            targetName: label(contentName, lang),
            targetUrl
          })
        }
      }
    }
  }

  const competenceList = await getPeruste(transversalCompetenceParams, transversalCompetences)
  const competences = emptyLists<TransversalCompetence>()
  const subjectTree = emptyLists<AlignmentObject>()

  for (const lang of ePerusteetLangs) {
    competences[lang] = competenceList
      .map(
        (competence): TransversalCompetence => ({
          key: competence.id,
          parent: competenceGroup[lang],
          source: 'basicStudyContents',
          alignmentType: 'teaches',
          targetName: label(competence.nimi, lang),
          targetUrl: `${config.EXTERNAL_API.ePerusteet}/external/peruste/${transversalCompetenceParams}/${competence.id}`
        })
      )
      .sort(sortByTargetName)

    for (const subject of subjects) {
      if (subject.parent) {
        continue
      }

      const childParams =
        subject.key === otherSubjects
          ? basicEducationParams
          : `${basicEducationParams}/${subject.key}/oppimaarat`

      subjectTree[lang].push({
        key: subject.key,
        source: 'basicStudySubjects',
        alignmentType: 'educationalSubject',
        targetName: label(subject.name, lang),
        children: subjects
          .filter((child) => child.parent === subject.key)
          .map(
            (child): AlignmentObject => ({
              key: child.key,
              source: 'basicStudySubjects',
              alignmentType: 'educationalSubject',
              targetName: label(child.name, lang),
              targetUrl: `${config.EXTERNAL_API.ePerusteet}/external/peruste/${childParams}/${child.key}`
            })
          )
          .sort(sortByTargetName)
      })
    }

    subjectTree[lang].sort(sortByTargetName)
    objectives[lang].sort(sortByTargetName).sort((a, b) => a.gradeEntity - b.gradeEntity)
    contents[lang].sort(sortByTargetName).sort((a, b) => a.gradeEntity - b.gradeEntity)
  }

  await ensureNotSmallerThanStored('laaja-alaiset-osaamiset', competences)
  await ensureNotSmallerThanStored('oppiaineet', subjectTree)
  await ensureNotSmallerThanStored('tavoitteet', objectives)
  await ensureNotSmallerThanStored('sisaltoalueet', contents)

  await saveReferenceData([
    ...finnishAsEnglish('laaja-alaiset-osaamiset', competences),
    ...finnishAsEnglish('oppiaineet', subjectTree),
    ...finnishAsEnglish('tavoitteet', objectives),
    ...finnishAsEnglish('sisaltoalueet', contents)
  ])
}
