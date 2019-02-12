import { EducationalMaterial } from '../../models/demo/educational-material';

export const EDUCATIONALMATERIALS: EducationalMaterial[] = [
  /*{
    id: 201,
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
    id: 201,
    materials: [],
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
