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
  }
];
