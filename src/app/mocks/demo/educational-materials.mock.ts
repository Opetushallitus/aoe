import { EducationalMaterial } from '../../models/demo/educational-material';

export const EDUCATIONALMATERIALS: EducationalMaterial[] = [
  /*{
    id: 1,
    materials: [],
    name: '',
    slug: '',
    dateCreated: new Date(),
    dateUpdated: undefined,
    datePublished: undefined,
    author: [],
    organization: undefined,
    publisher: undefined,
    // tslint:disable-next-line
    description: '',
    keywords: [],
    learningResourceType: [],
    timeRequired: {
      id: '',
      value: '',
    },
    educationalLevel: [],
    typicalAgeRange: '',
    educationalAlignment: [],
    educationalRole: [],
    educationalUse: [],
    interactivityType: [],
    inLanguage: {
      id: '',
      value: '',
    },
    accessibilityFeatures: undefined,
    accessibilityHazard: undefined,
    accessibilityAPI: undefined,
    accessibilityControl: undefined,
    licenseInformation: {
      licenseType: '',
      licenseUrl: '',
      prohibitions: undefined,
      requirements: undefined,
      permissions: undefined,
    },
    isBasedOn: undefined
  }*/
  {
    id: 1,
    materials: [
      {
        id: 1,
        name: 'Digipedagogiikka audio',
        file: {
          filePath: '/some/location/A Podcast Digipedagogiikka.m4a',
          originalFilename: 'A Podcast Digipedagogiikka.m4a',
          fileSize: 999,
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        id: 2,
        name: 'Digipedagogiikka teksti',
        file: {
          filePath: '/some/location/b Podcast  Digipedagogiikka - teksti.pdf',
          originalFilename: 'b Podcast  Digipedagogiikka - teksti.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Digipedagogiikka',
    slug: 'digipedagogiikka',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Digitaalinen pedagogiikka on tieto- ja viestintäteknisten välineiden ja sovellusten, verkko-oppimisympäristöjen ja sosiaalisen median mielekästä käyttöä opetuksessa, ohjauksessa, oppimisessa ja opiskelussa. Digitaalisessa pedagogiikassa on sopivassa suhteessa niin tekniikkaa kuin pedagogiikkaa. Verkkopedagoginen osaaminen, omat kokemukset, opiskelijoiden taidot ja laitteet sekä käytettävissä oleva tekniikka vaikuttavat siihen millaista digitaalista pedagogiikkaa opettaja omassa työssään toteuttaa.',
    keywords: [
      { id: 1, value: 'digipedagogiikka' },
      { id: 2, value: 'pedagogiikka' },
      { id: 3, value: 'TVT' },
      { id: 4, value: 'tieto- ja viestintätekniikka' },
    ],
    learningResourceType: [
      { id: 1, value: 'audio' },
      { id: 2, value: 'teksti' },
    ],
    timeRequired: {
      id: '0h',
      value: '0 h',
    },
    educationalLevel: [
      { id: 1, value: 'omaehtoinen osaamisen kehittäminen' },
      { id: 2, value: 'lukiokoulutus' },
      { id: 3, value: 'ammatillinen koulutus' },
      { id: 4, value: 'korkeakoulutus' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          id: 1,
          value: 'esimerkki',
          educationalSubject: [
            { id: 1, value: 'kasvatustieteet' }
          ],
        },
        educationalFramework: 'esimerkki',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { id: 1, value: 'opettaja' },
      { id: 2, value: 'täydennyskouluttautuja' },
      { id: 3, value: 'mentori' },
      { id: 4, value: 'hallinnoija' },
    ],
    educationalUse: [
      { id: 1, value: 'ammatillinen tuki' },
      { id: 2, value: 'itseopiskelu' },
    ],
    interactivityType: [
      { id: 1, value: 'ohjeistava' },
    ],
    inLanguage: {
      id: 'FI',
      value: 'suomi',
    },
    accessibilityFeatures: [
      { id: 1, value: 'käsikirjoitus' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
    isBasedOn: undefined
  },
  {
    id: 2,
    materials: [
      {
        id: 1,
        name: 'Digital pedagogy audio',
        file: {
          filePath: '/some/location/A Podcast Digital Pedagogy.m4a',
          originalFilename: 'A Podcast Digital Pedagogy.m4a',
          fileSize: 999,
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        id: 2,
        name: 'Digital pedagogy text',
        file: {
          filePath: '/some/location/b Podcast Digital pedagogy - text  .pdf',
          originalFilename: 'b Podcast Digital pedagogy - text  .pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Digital pedagogy',
    slug: 'digital-pedagogy',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Digital pedagogy is the meaningful use of information and communication technology and applications, web-based learning environments and social media in teaching, guiding, learning and studying. Digital pedagogy contains a relevant proportion of both technology and pedagogy. Web-based knowhow, our experiences, the students ‘skills and equipment and the available technology all impact on the kind of digital pedagogy a teacher will implement in his/her own work.',
    keywords: [
      { id: 1, value: 'digital pedagogy' },
      { id: 2, value: 'pedagogy' },
      { id: 3, value: 'ICT' },
      { id: 4, value: 'information and communications technology' },
    ],
    learningResourceType: [
      { id: 1, value: 'audio' },
      { id: 2, value: 'text' },
    ],
    timeRequired: {
      id: '0h',
      value: '0 h',
    },
    educationalLevel: [
      { id: 1, value: 'self-motivated competence development' },
      { id: 2, value: 'upper secondary school' },
      { id: 3, value: 'vocational education' },
      { id: 4, value: 'higher education' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          id: 1,
          value: 'example',
          educationalSubject: [
            { id: 1, value: 'educational sciences' }
          ],
        },
        educationalFramework: 'example',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { id: 1, value: 'teacher' },
      { id: 2, value: 'professional' },
      { id: 3, value: 'mentor' },
      { id: 4, value: 'administrator' },
    ],
    educationalUse: [
      { id: 1, value: 'professional support' },
      { id: 2, value: 'independet study' },
    ],
    interactivityType: [
      { id: 1, value: 'expositive' },
    ],
    inLanguage: {
      id: 'EN',
      value: 'English',
    },
    accessibilityFeatures: [
      { id: 1, value: 'transcript' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.en',
    },
    isBasedOn: undefined
  },
  {
    id: 3,
    materials: [
      {
        id: 1,
        name: 'Digipedagogik audio',
        file: {
          filePath: '/some/location/A Podcast Digipedagogik.m4a',
          originalFilename: 'A Podcast Digipedagogik.m4a',
          fileSize: 999,
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        id: 2,
        name: 'Digipedagogik text',
        file: {
          filePath: '/some/location/b Podcast Digipedagogik text.pdf',
          originalFilename: 'b Podcast Digipedagogik text.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Digipedagogik',
    slug: 'digipedagogik',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Digital pedagogik innefattar användningen av informations- och kommunikationstekniska verktyg och applikationer, nätbaserade lärandemiljöer och sociala medier i undervisning, handledning och studier. Digital pedagogik har en god balans mellan teknik och pedagogik. Hur läraren använder digital pedagogik i det egna arbetet beror på nätpedagogisk kompetens, egna erfarenheter, studerandenas färdigheter och apparater, och tillgänglig teknik.',
    keywords: [
      { id: 1, value: 'digipedagogik' },
      { id: 2, value: 'pedagogik' },
      { id: 3, value: 'ICT' },
      { id: 4, value: 'informations- och kommunikationsteknik' },
    ],
    learningResourceType: [
      { id: 1, value: 'audio' },
      { id: 2, value: 'text' },
    ],
    timeRequired: {
      id: '0h',
      value: '0 h',
    },
    educationalLevel: [
      { id: 1, value: 'självständig utveckling av kompetens' },
      { id: 2, value: 'gymnasietutbildning' },
      { id: 3, value: 'yrkesutbilfning' },
      { id: 4, value: 'högskol' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          id: 1,
          value: 'example',
          educationalSubject: [
            { id: 1, value: 'pedagogik' }
          ],
        },
        educationalFramework: 'example',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { id: 1, value: 'lärare' },
      { id: 2, value: 'expert' },
      { id: 3, value: 'handledare' },
      { id: 4, value: 'adminstratör' },
    ],
    educationalUse: [
      { id: 1, value: 'professionell stöd' },
      { id: 2, value: 'oberoende studie' },
    ],
    interactivityType: [
      { id: 1, value: 'rådgivning' },
    ],
    inLanguage: {
      id: 'SV',
      value: 'Svenska',
    },
    accessibilityFeatures: [
      { id: 1, value: 'transcript' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.en',
    },
    isBasedOn: undefined
  }
];
