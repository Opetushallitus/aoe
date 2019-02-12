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
    materials: [],
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
  }
];
