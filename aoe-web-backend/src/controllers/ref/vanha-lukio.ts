import { getDataFromApi } from '@util/ref/api.utils'
import { setAsync } from '@util/ref/redis.utils'
import { sortByTargetName } from '@util/ref/data.utils'
import { AlignmentObjectExtended } from '@/models/ref/alignment-object-extended'
import { Kurssi, Oppiaine, Oppiainerakenne } from '@/models/ref/oppiainerakenne'
import * as winstonLogger from '@util/winstonLogger'
import { config } from '@/config'

const endpoint = 'perusteet'
const rediskeySubjects = 'lukio-vanha-oppiaineet'
const rediskeyCourses = 'lukio-vanha-kurssit'
const params = '1372910/lukiokoulutus/julkinen/oppiainerakenne'

export async function setLukionVanhatOppiaineetKurssit(): Promise<void> {
  const finnishSubjects: AlignmentObjectExtended[] = []
  const swedishSubjects: AlignmentObjectExtended[] = []
  const finnishCourses: AlignmentObjectExtended[] = []
  const swedishCourses: AlignmentObjectExtended[] = []

  const results: Oppiainerakenne = await getDataFromApi(
    config.EXTERNAL_API.ePerusteet,
    `/${endpoint}/`,
    {
      Accept: 'application/json',
      'Caller-Id': `${config.EXTERNAL_API.oid}.${config.EXTERNAL_API.service}`
    },
    params
  )

  if (!results || !results.oppiaineet || results.oppiaineet.length < 1) {
    winstonLogger.error('No data from eperusteet in setLukionVanhatOppiaineetKurssit()')
    return
  }

  // handle results
  results.oppiaineet.forEach((subject: Oppiaine) => {
    if (!subject.koodiArvo || (!subject.nimi?.fi && !subject.nimi?.sv)) {
      throw Error(
        'Creating new sets of subjects failed in setLukionVanhatOppiaineetKurssit(): Missing required data'
      )
    }

    if (subject.oppimaarat?.length === 0) {
      finnishSubjects.push({
        key: subject.koodiArvo,
        source: 'upperSecondarySchoolSubjectsOld',
        alignmentType: 'educationalSubject',
        targetName: subject.nimi.fi || subject.nimi.sv
      })

      swedishSubjects.push({
        key: subject.koodiArvo,
        source: 'upperSecondarySchoolSubjectsOld',
        alignmentType: 'educationalSubject',
        targetName: subject.nimi.sv || subject.nimi.fi
      })
    }

    // courses
    subject.kurssit?.forEach((course: Kurssi) => {
      if (!course.koodiArvo || (!course.nimi?.fi && !course.nimi?.sv)) {
        throw Error(
          'Creating new sets of courses failed in setLukionVanhatOppiaineetKurssit(): Missing required data'
        )
      }

      finnishCourses.push({
        key: course.koodiArvo,
        parent: {
          key: subject.koodiArvo,
          value: subject.nimi.fi || subject.nimi.sv
        },
        source: 'upperSecondarySchoolCoursesOld',
        alignmentType: 'educationalSubject',
        targetName: course.nimi.fi || course.nimi.sv
      })

      swedishCourses.push({
        key: course.koodiArvo,
        parent: {
          key: subject.koodiArvo,
          value: subject.nimi.sv || subject.nimi.fi
        },
        source: 'upperSecondarySchoolCoursesOld',
        alignmentType: 'educationalSubject',
        targetName: course.nimi.sv || course.nimi.fi
      })
    })

    // sub subjects
    subject.oppimaarat?.forEach((subSubject: Oppiaine) => {
      if (!subSubject.koodiArvo || (!subSubject.nimi?.fi && !subSubject.nimi?.sv)) {
        throw Error(
          'Creating new sets of sub subjects failed in setLukionVanhatOppiaineetKurssit(): Missing required data'
        )
      }

      finnishSubjects.push({
        key: subSubject.koodiArvo,
        parent: {
          key: subject.koodiArvo,
          value: subject.nimi.fi || subject.nimi.sv
        },
        source: 'upperSecondarySchoolSubjectsOld',
        alignmentType: 'educationalSubject',
        targetName: subSubject.nimi.fi || subSubject.nimi.sv
      })

      swedishSubjects.push({
        key: subSubject.koodiArvo,
        parent: {
          key: subject.koodiArvo,
          value: subject.nimi.sv || subject.nimi.fi
        },
        source: 'upperSecondarySchoolSubjectsOld',
        alignmentType: 'educationalSubject',
        targetName: subSubject.nimi.sv || subSubject.nimi.fi
      })

      // courses
      subSubject.kurssit?.forEach((subCourse: Kurssi) => {
        if (!subCourse.koodiArvo || (!subCourse.nimi?.fi && !subCourse.nimi?.sv)) {
          throw Error(
            'Creating new sets of sub course failed in setLukionVanhatOppiaineetKurssit(): Missing required data'
          )
        }

        finnishCourses.push({
          key: subCourse.koodiArvo,
          parent: {
            key: subSubject.koodiArvo,
            value: subSubject.nimi.fi || subSubject.nimi.sv
          },
          source: 'upperSecondarySchoolCoursesOld',
          alignmentType: 'educationalSubject',
          targetName: subCourse.nimi.fi || subCourse.nimi.sv
        })

        swedishCourses.push({
          key: subCourse.koodiArvo,
          parent: {
            key: subSubject.koodiArvo,
            value: subSubject.nimi.sv || subSubject.nimi.fi
          },
          source: 'upperSecondarySchoolCoursesOld',
          alignmentType: 'educationalSubject',
          targetName: subCourse.nimi.sv || subCourse.nimi.fi
        })
      })
    })
  })

  try {
    finnishSubjects.sort(sortByTargetName)
    swedishSubjects.sort(sortByTargetName)
    finnishCourses.sort(sortByTargetName)
    swedishCourses.sort(sortByTargetName)

    await setAsync(`${rediskeySubjects}.fi`, JSON.stringify(finnishSubjects))
    await setAsync(`${rediskeySubjects}.sv`, JSON.stringify(swedishSubjects))
    await setAsync(`${rediskeySubjects}.en`, JSON.stringify(finnishSubjects))
    await setAsync(`${rediskeyCourses}.fi`, JSON.stringify(finnishCourses))
    await setAsync(`${rediskeyCourses}.sv`, JSON.stringify(swedishCourses))
    await setAsync(`${rediskeyCourses}.en`, JSON.stringify(finnishCourses))
  } catch (err) {
    throw Error(err)
  }
}
