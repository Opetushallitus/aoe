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
  // Digipedagogiikka 1
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
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.sv',
    },
  },
  // Digipedagogiikka 2
  {
    id: 4,
    materials: [
      {
        id: 1,
        name: 'Digitaalisuus ja teknologia kouluissa video',
        file: {
          filePath: '/some/location/A Video Digitaalisuus ja teknologia kouluissa.mp4',
          originalFilename: 'A Video Digitaalisuus ja teknologia kouluissa.mp4',
          fileSize: 999,
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        id: 2,
        name: 'Digitaalisuus ja teknologia kouluissa teksti',
        file: {
          filePath: '/some/location/b Video Digitaalisuus ja teknologia kouluissa - teksti.pdf',
          originalFilename: 'b Video Digitaalisuus ja teknologia kouluissa - teksti.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Digitaalisuus ja teknologia kouluissa',
    slug: 'digitaalisuus-ja-teknologia-kouluissa',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Digitaalisuus ja teknologia kouluissa tarkoittaa mobiilia Internetiä, sosiaalista mediaa, pilvipalveluita, dataa ja datan käyttöä. Se tarkoittaa myös järjestelmiä, tietokoneita, ohjelmia, sovelluksia, välineitä sekä oppimisalustoja sekä opetustilojen varustamista. Koulussa pohditaan mitä digitaalisuus tarkoittaa ja mitä siltä halutaan.',
    keywords: [
      { id: 1, value: 'digipedagogiikka' },
      { id: 2, value: 'digitaalisuus' },
      { id: 3, value: 'TVT' },
      { id: 4, value: 'tieto- ja viestintätekniikka' },
      { id: 5, value: 'teknologia' },
    ],
    learningResourceType: [
      { id: 1, value: 'video' },
      { id: 2, value: 'teksti' },
    ],
    timeRequired: {
      id: '0h',
      value: '0 h',
    },
    educationalLevel: [
      { id: 1, value: 'täydennyskoulutus' },
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
  },
  {
    id: 5,
    materials: [
      {
        id: 1,
        name: 'Digitalization and technology in schools video',
        file: {
          filePath: '/some/location/A Video Digitalization and technology in schools.mp4',
          originalFilename: 'A Video Digitalization and technology in schools.mp4',
          fileSize: 999,
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        id: 2,
        name: 'Digitalization and technology in schools text',
        file: {
          filePath: '/some/location/b Video Digitalization and technology in schools - text.pdf',
          originalFilename: 'b Video Digitalization and technology in schools - text.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Digitalization and technology in schools',
    slug: 'digitalization-and-technology-in-schools',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Digitalization and technology in schools means mobile internet, social media, cloud services, data and how to use it. It means different systems, computers, devices, programs, applications and learning platforms and how classrooms should be equipped. In schools is good to discuss what digitalization means and what we want of it.',
    keywords: [
      { id: 1, value: 'digital pedagogy' },
      { id: 2, value: 'digital' },
      { id: 3, value: 'ICT' },
      { id: 4, value: 'information and communications technology' },
      { id: 5, value: 'technology' },
    ],
    learningResourceType: [
      { id: 1, value: 'video' },
      { id: 2, value: 'text' },
    ],
    timeRequired: {
      id: '0h',
      value: '0 h',
    },
    educationalLevel: [
      { id: 1, value: 'continuing education' },
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
  },
  {
    id: 6,
    materials: [
      {
        id: 1,
        name: 'Digitalisering och teknologi video',
        file: {
          filePath: '/some/location/A Video Digitalisering och teknologi i skolor.mp4',
          originalFilename: 'A Video Digitalisering och teknologi i skolor.mp4',
          fileSize: 999,
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        id: 2,
        name: 'Digitalisering och teknologi text',
        file: {
          filePath: '/some/location/b Video Digitalisering och teknologi i skolor text.pdf',
          originalFilename: 'b Video Digitalisering och teknologi i skolor text.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Digitalisering och teknologi',
    slug: 'digitalisering-och-teknologi',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Digitalisering och teknologi i skolan betyder mobila internet, sociala medier, molntjänster, data och ut njutning av data. Det betyder olika system, datamaskiner, program, applikationer, verktyg och lär plattformar. I skolan diskuteras vad digitaliseringen betyder och vad vill man av det.',
    keywords: [
      { id: 1, value: 'digipedagogik' },
      { id: 2, value: 'digital' },
      { id: 3, value: 'ICT' },
      { id: 4, value: 'informations- och kommunikationsteknik' },
      { id: 5, value: 'teknik' },
    ],
    learningResourceType: [
      { id: 1, value: 'video' },
      { id: 2, value: 'text' },
    ],
    timeRequired: {
      id: '0h',
      value: '0 h',
    },
    educationalLevel: [
      { id: 1, value: 'fortbildning' },
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
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.sv',
    },
  },
  // Digipedagogiikka 3
  {
    id: 7,
    materials: [
      {
        id: 1,
        name: 'Opetuksen ja oppimisen suunnittelu, Learning Design video',
        file: {
          filePath: '/some/location/A Video Opetuksen ja oppimisen suunnittelu.mp4',
          originalFilename: 'A Video Opetuksen ja oppimisen suunnittelu.mp4',
          fileSize: 999,
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        id: 2,
        name: 'Opetuksen ja oppimisen suunnittelu, Learning Design teksti',
        file: {
          filePath: '/some/location/b Video Opetuksen ja oppimisen suunnittelu - teksti  .pdf',
          originalFilename: 'b Video Opetuksen ja oppimisen suunnittelu - teksti  .pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 3,
        name: 'Opetuksen ja oppimisen suunnittelu, Learning Design teksti',
        file: {
          filePath: '/some/location/c Infotaulu Opetuksen ja oppimisen suunnittelu.pdf',
          originalFilename: 'c Infotaulu Opetuksen ja oppimisen suunnittelu.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Opetuksen ja oppimisen suunnittelu, Learning Design',
    slug: 'opetuksen-ja-oppimisen-suunnittelu-learning-design',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Learning Design – opetuksen ja oppimisen suunnittelu tarkoittaa sekä opettajan opetuksen suunnittelua ja valmistelua että opiskelijan tavoitteellisen oppimisen suunnittelua. Tämä sisältää oppimisprosessin, oppimistilanteiden, oppimisaktiviteettien mm. oppimistehtävien sekä työskentelyohjeiden, ja ohjauksen suunnittelua. Se on myös oppimisympäristöjen, digitaalisten oppimisen välineiden ja menetelmien valintaa.',
    keywords: [
      { id: 1, value: 'oppiminen' },
      { id: 2, value: 'opetus' },
      { id: 3, value: 'oppimisprosessi' },
      { id: 4, value: 'oppimistehtävä' },
      { id: 5, value: 'oppimisaktiviteetti' },
      { id: 6, value: 'ohjaus' },
      { id: 7, value: 'pedagogiikka' },
      { id: 8, value: 'digipedagogiikka' },
      { id: 9, value: 'aktivointi' },
      { id: 10, value: 'oppimisympäristö' },
    ],
    learningResourceType: [
      { id: 1, value: 'video' },
      { id: 2, value: 'teksti' },
    ],
    timeRequired: {
      id: '0h',
      value: '0 h',
    },
    educationalLevel: [
      { id: 1, value: 'täydennyskoulutus' },
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
  },
  {
    id: 8,
    materials: [
      {
        id: 1,
        name: 'Designing Learning Processes video',
        file: {
          filePath: '/some/location/A Video Learning design.mp4',
          originalFilename: 'A Video Learning design.mp4',
          fileSize: 999,
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        id: 2,
        name: 'Designing Learning Processes text',
        file: {
          filePath: '/some/location/b Video Learning design text script.pdf',
          originalFilename: 'b Video Learning design text script.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 3,
        name: 'Designing Learning Processes text',
        file: {
          filePath: '/some/location/c Infograf Learning Design.pdf',
          originalFilename: 'c Infograf Learning Design.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Learning design',
    slug: 'learning-design',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Learning Design means planning teaching and student’s goal-oriented learning. This includes designing the learning process, learning situations, learning activities for example learning assignments and instructions, and guidance. It includes also choices of learning environments and digital learning tools and means.',
    keywords: [
      { id: 1, value: 'learning' },
      { id: 2, value: 'teaching' },
      { id: 3, value: 'learning process' },
      { id: 4, value: 'learning environment' },
      { id: 5, value: 'guidance' },
      { id: 6, value: 'pedagogy' },
      { id: 7, value: 'digital pedagogy' },
      { id: 8, value: 'activation' },
    ],
    learningResourceType: [
      { id: 1, value: 'video' },
      { id: 2, value: 'text' },
    ],
    timeRequired: {
      id: '0h',
      value: '0 h',
    },
    educationalLevel: [
      { id: 1, value: 'continuing education' },
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
  },
  {
    id: 9,
    materials: [
      {
        id: 1,
        name: 'Planering av undevisning och lärande video',
        file: {
          filePath: '/some/location/A Video Digitalisering och teknologi i skolor.mp4',
          originalFilename: 'A Video Digitalisering och teknologi i skolor.mp4',
          fileSize: 999,
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        id: 2,
        name: 'Planering av undevisning och lärande text',
        file: {
          filePath: '/some/location/b Video Digitalisering och teknologi i skolor text.pdf',
          originalFilename: 'b Video Digitalisering och teknologi i skolor text.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Planering av undevisning och lärande',
    slug: 'planering-av-undevisning-och-larande',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Learning Design – planering av undervisning och lärande betyder både att läraren planerar sin egen undervisning och studerandes målinriktat lärande. Detta innehåller planering av lärprocessen, lärsituationer, läraktiviteter mm. läruppgifter och anvisningar, och planering av handledning. Det innehåller också val av lärmiljöer, digitala verktyg och metoder för lärande.',
    keywords: [
      { id: 1, value: 'inlärningsprocess' },
      { id: 2, value: 'inlärningsmiljö' },
      { id: 3, value: 'handledning' },
      { id: 4, value: 'pedagogik' },
      { id: 5, value: 'digipedagogik' },
      { id: 6, value: 'aktivering' },
      { id: 7, value: 'inlärning' },
      { id: 8, value: 'undervisning' },
    ],
    learningResourceType: [
      { id: 1, value: 'video' },
      { id: 2, value: 'text' },
    ],
    timeRequired: {
      id: '0h',
      value: '0 h',
    },
    educationalLevel: [
      { id: 1, value: 'fortbildning' },
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
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.sv',
    },
  },
  // Digipedagogiikka 4
  {
    id: 10,
    materials: [
      {
        id: 1,
        name: '',
        file: {
          filePath: '/some/location/A Video Oppimisprosessin suunnittelu.mp4',
          originalFilename: 'A Video Oppimisprosessin suunnittelu.mp4',
          fileSize: 999,
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        id: 2,
        name: '',
        file: {
          filePath: '/some/location/b Video Oppimisprosessin suunnittelu  - teksti.pdf',
          originalFilename: 'b Video Oppimisprosessin suunnittelu  - teksti.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 3,
        name: '',
        file: {
          filePath: '/some/location/c Podcast Oppimisprosessin näkyväksi tekeminen ammatilliselle opiskelijalle.m4a',
          originalFilename: 'c Podcast Oppimisprosessin näkyväksi tekeminen ammatilliselle opiskelijalle.m4a',
          fileSize: 999,
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        id: 4,
        name: '',
        file: {
          filePath: '/some/location/d Podcast Oppimisprosessin näkyväksi tekeminen ammatilliselle opiskelijalle - teksti   .pdf',
          originalFilename: 'd Podcast Oppimisprosessin näkyväksi tekeminen ammatilliselle opiskelijalle - teksti   .pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 5,
        name: '',
        file: {
          filePath: '/some/location/e Podcast Oppimisprosessin ohjaus verkossa.m4a',
          originalFilename: 'e Podcast Oppimisprosessin ohjaus verkossa.m4a',
          fileSize: 999,
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        id: 6,
        name: '',
        file: {
          filePath: '/some/location/f Podcast Oppimisprosessin ohjaus verkossa teksti .pdf',
          originalFilename: 'f Podcast Oppimisprosessin ohjaus verkossa teksti .pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 7,
        name: '',
        file: {
          filePath: '/some/location/g Infotaulu Oppimisprosessin ja oppimistilanteiden suunnittelu.pdf',
          originalFilename: 'g Infotaulu Oppimisprosessin ja oppimistilanteiden suunnittelu.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 8,
        name: '',
        file: {
          filePath: '/some/location/h Infotaulu Yksilöllinen oppimisprosessiI.pdf',
          originalFilename: 'h Infotaulu Yksilöllinen oppimisprosessiI.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 9,
        name: '',
        file: {
          filePath: '/some/location/i Infotaulu Monialainen oppimisprosessi.pdf',
          originalFilename: 'i Infotaulu Monialainen oppimisprosessi.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 10,
        name: '',
        file: {
          filePath: '/some/location/j Infotaulu Ilmiöpohjaisen oppimisen suunnittelu.pdf',
          originalFilename: 'j Infotaulu Ilmiöpohjaisen oppimisen suunnittelu.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 11,
        name: '',
        file: {
          filePath: '/some/location/k Infotaulu Avoin ilmiöpohjainen oppimisprosessi.pdf',
          originalFilename: 'k Infotaulu Avoin ilmiöpohjainen oppimisprosessi.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 12,
        name: '',
        file: {
          filePath: '/some/location/l Infotaulu Casepohjainen oppiminen.pdf',
          originalFilename: 'l Infotaulu Casepohjainen oppiminen.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 13,
        name: '',
        file: {
          filePath: '/some/location/m Infotaulu Käänteinen luokkahuoneopetus .pdf',
          originalFilename: 'm Infotaulu Käänteinen luokkahuoneopetus .pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Oppimisprosessin suunnittelu',
    slug: 'oppimisprosessin-suunnittelu',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
      { firstName: 'Leena', lastName: 'Vainio' },
    ],
    // tslint:disable-next-line
    description: 'Oppimisprosessilla tarkoitetaan ajallisesti ja askelittain etenevää, ennalta suunniteltua ja tavoitteellista oppimista. Oppimisprosessi on pidempikestoinen, useammasta oppimistilanteesta muodostuva tavoitteellinen opetuskokonaisuus. Oppimisprosessi on helpompi käsittää, kun sitä mietitään matkana, polkuna, eri etappien muodostamana kokonaisuutena, tienä, seikkailuna, pelinä.',
    keywords: [
      { id: 1, value: 'oppiminen' },
      { id: 2, value: 'opetus' },
      { id: 3, value: 'oppimisprosessi' },
      { id: 4, value: 'pedagoginen malli' },
      { id: 5, value: 'casepohjainen oppiminen' },
      { id: 6, value: 'ilmiöpohjainen oppiminen' },
      { id: 7, value: 'pedagogiikka' },
      { id: 8, value: 'digipedagogiikka' },
      { id: 9, value: 'yksilöllinen oppiminen' },
      { id: 10, value: 'monialainen oppiminen' },
      { id: 11, value: 'käänteinen luokkahuoneopetus' },
    ],
    learningResourceType: [
      { id: 1, value: 'video' },
      { id: 2, value: 'teksti' },
      { id: 3, value: 'audio' },
      { id: 4, value: 'harjoitus' },
    ],
    timeRequired: {
      id: '0h',
      value: '0 h',
    },
    educationalLevel: [
      { id: 1, value: 'täydennyskoulutus' },
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
  },
  {
    id: 11,
    materials: [
      {
        id: 1,
        name: '',
        file: {
          filePath: '/some/location/A Video Planning the learning process .mp4',
          originalFilename: 'A Video Planning the learning process .mp4',
          fileSize: 999,
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        id: 2,
        name: '',
        file: {
          filePath: '/some/location/b Video Planning the learning process - text .pdf',
          originalFilename: 'b Video Planning the learning process - text .pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 3,
        name: '',
        file: {
          filePath: '/some/location/c Podcast Making the learning process visible for a vocational student.m4a',
          originalFilename: 'c Podcast Making the learning process visible for a vocational student.m4a',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 4,
        name: '',
        file: {
          filePath: '/some/location/d Podcast Making the learning process visible - vocational education text .pdf',
          originalFilename: 'd Podcast Making the learning process visible - vocational education text .pdf',
          fileSize: 999,
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        id: 5,
        name: '',
        file: {
          filePath: '/some/location/e Podcast Guiding the learning process on the web.m4a',
          originalFilename: 'e Podcast Guiding the learning process on the web.m4a',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 6,
        name: '',
        file: {
          filePath: '/some/location/f Podcast Guiding the learning process on the web text   .pdf',
          originalFilename: 'f Podcast Guiding the learning process on the web text   .pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 7,
        name: '',
        file: {
          filePath: '/some/location/g Infograf Planning learning process and situations.pdf',
          originalFilename: 'g Infograf Planning learning process and situations.pdf',
          fileSize: 999,
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        id: 8,
        name: '',
        file: {
          filePath: '/some/location/h Infograf Individual learning process .pdf',
          originalFilename: 'h Infograf Individual learning process .pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 9,
        name: '',
        file: {
          filePath: '/some/location/i Infograf Multidisciplinary learning process.pdf',
          originalFilename: 'i Infograf Multidisciplinary learning process.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 10,
        name: '',
        file: {
          filePath: '/some/location/j Infograf Planning phenomen-based learning.pdf',
          originalFilename: 'j Infograf Planning phenomen-based learning.pdf',
          fileSize: 999,
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        id: 11,
        name: '',
        file: {
          filePath: '/some/location/k Infograf Open phenomenon-based learning process.pdf',
          originalFilename: 'k Infograf Open phenomenon-based learning process.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 12,
        name: '',
        file: {
          filePath: '/some/location/l Infograf Case-based learning.pdf',
          originalFilename: 'l Infograf Case-based learning.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        id: 13,
        name: '',
        file: {
          filePath: '/some/location/m Infograf Flipped classroom.pdf',
          originalFilename: 'm Infograf Flipped classroom.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Designing Learning Processes',
    slug: 'designing-learning-processes',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
      { firstName: 'Leena', lastName: 'Vainio' },
    ],
    // tslint:disable-next-line
    description: 'The learning process refers to a pre-planned and a goal-oriented learning that progresses in time and through steps. The learning process is a goal-oriented teaching project which lasts longer and is formed of several learning situations. It is useful to think of the learning process as a trip, a path, a whole made up of various stages, a road, an adventure, or a game.',
    keywords: [
      { id: 1, value: 'learning' },
      { id: 2, value: 'teaching' },
      { id: 3, value: 'learning methods' },
      { id: 4, value: 'case method' },
      { id: 5, value: 'learning process pedagogy' },
      { id: 6, value: 'flipped classroom' },
      { id: 7, value: 'digital pedagogy' },
      { id: 8, value: 'phenomenon-based learning' },
      { id: 9, value: 'multidiscplinary learning' },
    ],
    learningResourceType: [
      { id: 1, value: 'video' },
      { id: 2, value: 'text' },
      { id: 3, value: 'audio' },
      { id: 4, value: 'exercise' },
    ],
    timeRequired: {
      id: '0h',
      value: '0 h',
    },
    educationalLevel: [
      { id: 1, value: 'continuing education' },
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
  },
  {
    id: 12,
    materials: [
      {
        id: 1,
        name: 'Planering av undevisning och lärande video',
        file: {
          filePath: '/some/location/A Video Digitalisering och teknologi i skolor.mp4',
          originalFilename: 'A Video Digitalisering och teknologi i skolor.mp4',
          fileSize: 999,
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        id: 2,
        name: 'Planering av undevisning och lärande text',
        file: {
          filePath: '/some/location/b Video Digitalisering och teknologi i skolor text.pdf',
          originalFilename: 'b Video Digitalisering och teknologi i skolor text.pdf',
          fileSize: 999,
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Planering av undevisning och lärande',
    slug: 'planering-av-undevisning-och-larande',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
      { firstName: 'Leena', lastName: 'Vainio' },
    ],
    // tslint:disable-next-line
    description: 'Learning Design – planering av undervisning och lärande betyder både att läraren planerar sin egen undervisning och studerandes målinriktat lärande. Detta innehåller planering av lärprocessen, lärsituationer, läraktiviteter mm. läruppgifter och anvisningar, och planering av handledning. Det innehåller också val av lärmiljöer, digitala verktyg och metoder för lärande.',
    keywords: [
      { id: 1, value: 'inlärningsprocess' },
      { id: 2, value: 'inlärningsmiljö' },
      { id: 3, value: 'handledning' },
      { id: 4, value: 'pedagogik' },
      { id: 5, value: 'digipedagogik' },
      { id: 6, value: 'aktivering' },
      { id: 7, value: 'inlärning' },
      { id: 8, value: 'undervisning' },
    ],
    learningResourceType: [
      { id: 1, value: 'video' },
      { id: 2, value: 'text' },
    ],
    timeRequired: {
      id: '0h',
      value: '0 h',
    },
    educationalLevel: [
      { id: 1, value: 'fortbildning' },
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
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.sv',
    },
  },
];
