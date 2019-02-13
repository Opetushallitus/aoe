import { EducationalMaterial } from '../../models/demo/educational-material';

/**
 * Educational Materials mock
 */
export const EDUCATIONALMATERIALS: EducationalMaterial[] = [
  // Digipedagogiikka 1
  {
    id: 1,
    materials: [
      {
        file: {
          originalFilename: 'A Podcast Digipedagogiikka.m4a',
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        file: {
          originalFilename: 'b Podcast  Digipedagogiikka - teksti.pdf',
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
      { value: 'digipedagogiikka' },
      { value: 'pedagogiikka' },
      { value: 'TVT' },
      { value: 'tieto- ja viestintätekniikka' },
    ],
    learningResourceType: [
      { value: 'audio' },
      { value: 'teksti' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'omaehtoinen osaamisen kehittäminen' },
      { value: 'lukiokoulutus' },
      { value: 'ammatillinen koulutus' },
      { value: 'korkeakoulutus' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'esimerkki',
          educationalSubject: [
            { value: 'kasvatustieteet' }
          ],
        },
        educationalFramework: 'esimerkki',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'opettaja' },
      { value: 'täydennyskouluttautuja' },
      { value: 'mentori' },
      { value: 'hallinnoija' },
    ],
    educationalUse: [
      { value: 'ammatillinen tuki' },
      { value: 'itseopiskelu' },
    ],
    interactivityType: [
      { value: 'ohjeistava' },
    ],
    inLanguage: {
      id: 'FI',
      value: 'suomi',
    },
    accessibilityFeatures: [
      { value: 'käsikirjoitus' },
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
        file: {
          originalFilename: 'A Podcast Digital Pedagogy.m4a',
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        file: {
          originalFilename: 'b Podcast Digital pedagogy - text  .pdf',
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
      { value: 'digital pedagogy' },
      { value: 'pedagogy' },
      { value: 'ICT' },
      { value: 'information and communications technology' },
    ],
    learningResourceType: [
      { value: 'audio' },
      { value: 'text' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'self-motivated competence development' },
      { value: 'upper secondary school' },
      { value: 'vocational education' },
      { value: 'higher education' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'example',
          educationalSubject: [
            { value: 'educational sciences' }
          ],
        },
        educationalFramework: 'example',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'teacher' },
      { value: 'professional' },
      { value: 'mentor' },
      { value: 'administrator' },
    ],
    educationalUse: [
      { value: 'professional support' },
      { value: 'independet study' },
    ],
    interactivityType: [
      { value: 'expositive' },
    ],
    inLanguage: {
      id: 'EN',
      value: 'English',
    },
    accessibilityFeatures: [
      { value: 'transcript' },
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
        file: {
          originalFilename: 'A Podcast Digipedagogik.m4a',
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        file: {
          originalFilename: 'b Podcast Digipedagogik text.pdf',
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
      { value: 'digipedagogik' },
      { value: 'pedagogik' },
      { value: 'ICT' },
      { value: 'informations- och kommunikationsteknik' },
    ],
    learningResourceType: [
      { value: 'audio' },
      { value: 'text' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'självständig utveckling av kompetens' },
      { value: 'gymnasietutbildning' },
      { value: 'yrkesutbilfning' },
      { value: 'högskol' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'example',
          educationalSubject: [
            { value: 'pedagogik' }
          ],
        },
        educationalFramework: 'example',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'lärare' },
      { value: 'expert' },
      { value: 'handledare' },
      { value: 'adminstratör' },
    ],
    educationalUse: [
      { value: 'professionell stöd' },
      { value: 'oberoende studie' },
    ],
    interactivityType: [
      { value: 'rådgivning' },
    ],
    inLanguage: {
      id: 'SV',
      value: 'Svenska',
    },
    accessibilityFeatures: [
      { value: 'transcript' },
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
        file: {
          originalFilename: 'A Video Digitaalisuus ja teknologia kouluissa.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          originalFilename: 'b Video Digitaalisuus ja teknologia kouluissa - teksti.pdf',
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
      { value: 'digipedagogiikka' },
      { value: 'digitaalisuus' },
      { value: 'TVT' },
      { value: 'tieto- ja viestintätekniikka' },
      { value: 'teknologia' },
    ],
    learningResourceType: [
      { value: 'video' },
      { value: 'teksti' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'täydennyskoulutus' },
      { value: 'lukiokoulutus' },
      { value: 'ammatillinen koulutus' },
      { value: 'korkeakoulutus' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'esimerkki',
          educationalSubject: [
            { value: 'kasvatustieteet' }
          ],
        },
        educationalFramework: 'esimerkki',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'opettaja' },
      { value: 'täydennyskouluttautuja' },
      { value: 'mentori' },
      { value: 'hallinnoija' },
    ],
    educationalUse: [
      { value: 'ammatillinen tuki' },
      { value: 'itseopiskelu' },
    ],
    interactivityType: [
      { value: 'ohjeistava' },
    ],
    inLanguage: {
      id: 'FI',
      value: 'suomi',
    },
    accessibilityFeatures: [
      { value: 'käsikirjoitus' },
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
        file: {
          originalFilename: 'A Video Digitalization and technology in schools.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          originalFilename: 'b Video Digitalization and technology in schools - text.pdf',
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
      { value: 'digital pedagogy' },
      { value: 'digital' },
      { value: 'ICT' },
      { value: 'information and communications technology' },
      { value: 'technology' },
    ],
    learningResourceType: [
      { value: 'video' },
      { value: 'text' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'continuing education' },
      { value: 'upper secondary school' },
      { value: 'vocational education' },
      { value: 'higher education' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'example',
          educationalSubject: [
            { value: 'educational sciences' }
          ],
        },
        educationalFramework: 'example',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'teacher' },
      { value: 'professional' },
      { value: 'mentor' },
      { value: 'administrator' },
    ],
    educationalUse: [
      { value: 'professional support' },
      { value: 'independet study' },
    ],
    interactivityType: [
      { value: 'expositive' },
    ],
    inLanguage: {
      id: 'EN',
      value: 'English',
    },
    accessibilityFeatures: [
      { value: 'transcript' },
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
        file: {
          originalFilename: 'A Video Digitalisering och teknologi i skolor.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          originalFilename: 'b Video Digitalisering och teknologi i skolor text.pdf',
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
      { value: 'digipedagogik' },
      { value: 'digital' },
      { value: 'ICT' },
      { value: 'informations- och kommunikationsteknik' },
      { value: 'teknik' },
    ],
    learningResourceType: [
      { value: 'video' },
      { value: 'text' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'fortbildning' },
      { value: 'gymnasietutbildning' },
      { value: 'yrkesutbilfning' },
      { value: 'högskol' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'example',
          educationalSubject: [
            { value: 'pedagogik' }
          ],
        },
        educationalFramework: 'example',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'lärare' },
      { value: 'expert' },
      { value: 'handledare' },
      { value: 'adminstratör' },
    ],
    educationalUse: [
      { value: 'professionell stöd' },
      { value: 'oberoende studie' },
    ],
    interactivityType: [
      { value: 'rådgivning' },
    ],
    inLanguage: {
      id: 'SV',
      value: 'Svenska',
    },
    accessibilityFeatures: [
      { value: 'transcript' },
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
        file: {
          originalFilename: 'A Video Opetuksen ja oppimisen suunnittelu.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          originalFilename: 'b Video Opetuksen ja oppimisen suunnittelu - teksti  .pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'c Infotaulu Opetuksen ja oppimisen suunnittelu.pdf',
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
      { value: 'oppiminen' },
      { value: 'opetus' },
      { value: 'oppimisprosessi' },
      { value: 'oppimistehtävä' },
      { value: 'oppimisaktiviteetti' },
      { value: 'ohjaus' },
      { value: 'pedagogiikka' },
      { value: 'digipedagogiikka' },
      { value: 'aktivointi' },
      { value: 'oppimisympäristö' },
    ],
    learningResourceType: [
      { value: 'video' },
      { value: 'teksti' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'täydennyskoulutus' },
      { value: 'lukiokoulutus' },
      { value: 'ammatillinen koulutus' },
      { value: 'korkeakoulutus' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'esimerkki',
          educationalSubject: [
            { value: 'kasvatustieteet' }
          ],
        },
        educationalFramework: 'esimerkki',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'opettaja' },
      { value: 'täydennyskouluttautuja' },
      { value: 'mentori' },
      { value: 'hallinnoija' },
    ],
    educationalUse: [
      { value: 'ammatillinen tuki' },
      { value: 'itseopiskelu' },
    ],
    interactivityType: [
      { value: 'ohjeistava' },
    ],
    inLanguage: {
      id: 'FI',
      value: 'suomi',
    },
    accessibilityFeatures: [
      { value: 'käsikirjoitus' },
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
        file: {
          originalFilename: 'A Video Learning design.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          originalFilename: 'b Video Learning design text script.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'c Infograf Learning Design.pdf',
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
      { value: 'learning' },
      { value: 'teaching' },
      { value: 'learning process' },
      { value: 'learning environment' },
      { value: 'guidance' },
      { value: 'pedagogy' },
      { value: 'digital pedagogy' },
      { value: 'activation' },
    ],
    learningResourceType: [
      { value: 'video' },
      { value: 'text' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'continuing education' },
      { value: 'upper secondary school' },
      { value: 'vocational education' },
      { value: 'higher education' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'example',
          educationalSubject: [
            { value: 'educational sciences' }
          ],
        },
        educationalFramework: 'example',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'teacher' },
      { value: 'professional' },
      { value: 'mentor' },
      { value: 'administrator' },
    ],
    educationalUse: [
      { value: 'professional support' },
      { value: 'independet study' },
    ],
    interactivityType: [
      { value: 'expositive' },
    ],
    inLanguage: {
      id: 'EN',
      value: 'English',
    },
    accessibilityFeatures: [
      { value: 'transcript' },
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
        file: {
          originalFilename: 'A Video Digitalisering och teknologi i skolor.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          originalFilename: 'b Video Digitalisering och teknologi i skolor text.pdf',
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
      { value: 'inlärningsprocess' },
      { value: 'inlärningsmiljö' },
      { value: 'handledning' },
      { value: 'pedagogik' },
      { value: 'digipedagogik' },
      { value: 'aktivering' },
      { value: 'inlärning' },
      { value: 'undervisning' },
    ],
    learningResourceType: [
      { value: 'video' },
      { value: 'text' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'fortbildning' },
      { value: 'gymnasietutbildning' },
      { value: 'yrkesutbilfning' },
      { value: 'högskol' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'example',
          educationalSubject: [
            { value: 'pedagogik' }
          ],
        },
        educationalFramework: 'example',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'lärare' },
      { value: 'expert' },
      { value: 'handledare' },
      { value: 'adminstratör' },
    ],
    educationalUse: [
      { value: 'professionell stöd' },
      { value: 'oberoende studie' },
    ],
    interactivityType: [
      { value: 'rådgivning' },
    ],
    inLanguage: {
      id: 'SV',
      value: 'Svenska',
    },
    accessibilityFeatures: [
      { value: 'transcript' },
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
        file: {
          originalFilename: 'A Video Oppimisprosessin suunnittelu.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          originalFilename: 'b Video Oppimisprosessin suunnittelu  - teksti.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'c Podcast Oppimisprosessin näkyväksi tekeminen ammatilliselle opiskelijalle.m4a',
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        file: {
          originalFilename: 'd Podcast Oppimisprosessin näkyväksi tekeminen ammatilliselle opiskelijalle - teksti   .pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'e Podcast Oppimisprosessin ohjaus verkossa.m4a',
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        file: {
          originalFilename: 'f Podcast Oppimisprosessin ohjaus verkossa teksti .pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'g Infotaulu Oppimisprosessin ja oppimistilanteiden suunnittelu.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'h Infotaulu Yksilöllinen oppimisprosessiI.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'i Infotaulu Monialainen oppimisprosessi.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'j Infotaulu Ilmiöpohjaisen oppimisen suunnittelu.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'k Infotaulu Avoin ilmiöpohjainen oppimisprosessi.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'l Infotaulu Casepohjainen oppiminen.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'm Infotaulu Käänteinen luokkahuoneopetus .pdf',
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
      { value: 'oppiminen' },
      { value: 'opetus' },
      { value: 'oppimisprosessi' },
      { value: 'pedagoginen malli' },
      { value: 'casepohjainen oppiminen' },
      { value: 'ilmiöpohjainen oppiminen' },
      { value: 'pedagogiikka' },
      { value: 'digipedagogiikka' },
      { value: 'yksilöllinen oppiminen' },
      { value: 'monialainen oppiminen' },
      { value: 'käänteinen luokkahuoneopetus' },
    ],
    learningResourceType: [
      { value: 'video' },
      { value: 'teksti' },
      { value: 'audio' },
      { value: 'harjoitus' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'täydennyskoulutus' },
      { value: 'lukiokoulutus' },
      { value: 'ammatillinen koulutus' },
      { value: 'korkeakoulutus' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'esimerkki',
          educationalSubject: [
            { value: 'kasvatustieteet' }
          ],
        },
        educationalFramework: 'esimerkki',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'opettaja' },
      { value: 'täydennyskouluttautuja' },
      { value: 'mentori' },
      { value: 'hallinnoija' },
    ],
    educationalUse: [
      { value: 'ammatillinen tuki' },
      { value: 'itseopiskelu' },
    ],
    interactivityType: [
      { value: 'ohjeistava' },
    ],
    inLanguage: {
      id: 'FI',
      value: 'suomi',
    },
    accessibilityFeatures: [
      { value: 'käsikirjoitus' },
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
        file: {
          originalFilename: 'A Video Planning the learning process .mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          originalFilename: 'b Video Planning the learning process - text .pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'c Podcast Making the learning process visible for a vocational student.m4a',
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        file: {
          originalFilename: 'd Podcast Making the learning process visible - vocational education text .pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'e Podcast Guiding the learning process on the web.m4a',
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        file: {
          originalFilename: 'f Podcast Guiding the learning process on the web text   .pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'g Infograf Planning learning process and situations.pdf',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          originalFilename: 'h Infograf Individual learning process .pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'i Infograf Multidisciplinary learning process.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'j Infograf Planning phenomen-based learning.pdf',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          originalFilename: 'k Infograf Open phenomenon-based learning process.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'l Infograf Case-based learning.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'm Infograf Flipped classroom.pdf',
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
      { value: 'learning' },
      { value: 'teaching' },
      { value: 'learning methods' },
      { value: 'case method' },
      { value: 'learning process pedagogy' },
      { value: 'flipped classroom' },
      { value: 'digital pedagogy' },
      { value: 'phenomenon-based learning' },
      { value: 'multidiscplinary learning' },
    ],
    learningResourceType: [
      { value: 'video' },
      { value: 'text' },
      { value: 'audio' },
      { value: 'exercise' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'continuing education' },
      { value: 'upper secondary school' },
      { value: 'vocational education' },
      { value: 'higher education' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'example',
          educationalSubject: [
            { value: 'educational sciences' }
          ],
        },
        educationalFramework: 'example',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'teacher' },
      { value: 'professional' },
      { value: 'mentor' },
      { value: 'administrator' },
    ],
    educationalUse: [
      { value: 'professional support' },
      { value: 'independet study' },
    ],
    interactivityType: [
      { value: 'expositive' },
    ],
    inLanguage: {
      id: 'EN',
      value: 'English',
    },
    accessibilityFeatures: [
      { value: 'transcript' },
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
        file: {
          originalFilename: 'A Video Planering av en lärprocess.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          originalFilename: 'b Video Planeringen av en lärprocess text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'c Podcast Att synliggöra lärprocessen för studerande inom yrkesutbildning.m4a',
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        file: {
          originalFilename: 'd Podcast Att synliggöra lärprocessen för studerande inom yrkesutbildning tex.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'e Podcast Handledning av lärprocessen i nätet.m4a',
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        file: {
          originalFilename: 'f Podcast Handledning av lärprocessen i nätet - text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'g Infograf Planning av en lärprocess och lärsituationer.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'h Infograf Individuell lärprocess .pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'i Infograf Mångvetenskaplig lärprocess.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'j Infograf Planering av fenomenbaserat lärande.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'k Infograf En öppen fenomenbaserad lärprocess .pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'l Infograf Case-baserat lärande.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'm Infograf Omvänt klassrum.pdf',
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
    description: 'En lärandeprocess betecknar på förhand planerat och målinriktat lärande som framskrider tidsbundet och stegvis. Lärandeprocessen är en mer långvarig undervisningshelhet som består av flera lärandesituationer. Det är lättare att begripa lärandeprocessen då den förstås som en resa, en stig, en helhet bestående av flera etapper, en väg, ett äventyr, ett spel.',
    keywords: [
      { value: 'inlärningsprocess' },
      { value: 'pedagogik' },
      { value: 'digipedagogik' },
      { value: 'aktivering' },
      { value: 'inlärning' },
      { value: 'undervisning' },
      { value: 'flippat klassrum' },
      { value: 'tvärvetenskapliga inlärning' },
      { value: 'pedagogiska metoder' },
      { value: 'casemetodik' },
    ],
    learningResourceType: [
      { value: 'video' },
      { value: 'text' },
      { value: 'audio' },
      { value: 'övning' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'fortbildning' },
      { value: 'gymnasietutbildning' },
      { value: 'yrkesutbilfning' },
      { value: 'högskol' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'example',
          educationalSubject: [
            { value: 'pedagogik' }
          ],
        },
        educationalFramework: 'example',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'lärare' },
      { value: 'expert' },
      { value: 'handledare' },
      { value: 'adminstratör' },
    ],
    educationalUse: [
      { value: 'professionell stöd' },
      { value: 'oberoende studie' },
    ],
    interactivityType: [
      { value: 'rådgivning' },
    ],
    inLanguage: {
      id: 'SV',
      value: 'Svenska',
    },
    accessibilityFeatures: [
      { value: 'transcript' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.sv',
    },
  },
  // Digipedagogiikka 5
  {
    id: 13,
    materials: [
      {
        file: {
          originalFilename: 'A Podcast Oppimistehtävä.m4a',
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        file: {
          originalFilename: 'b Podcast Oppimistehtävä - teksti  .pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'c Oppimistehtäväideoita oppimisprosessin eri vaiheisiin.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'd Oppimistehtävän suunnittelu.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Oppimistehtävien suunnittelu',
    slug: 'oppimistehtavien-suunnittelu',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Oppimistehtävä on nimensä mukaan tehtävä, johon sisään rakennetaan uuden oppimista ohjaavaa ja mahdollistavaa toimintaa. Oppimistehtävä on opettajan merkittävä keino tai menetelmä saada oppija pedagogisesti mielekkäästi ja mietitysti oppimaan uusia asioita. Oppimistehtävät jäsentävät verkko-oppimisprosessia samalla tavalla kuin lähiopetuksen tunnit tai luennot. Verkko-oppimisympäristö on tyhjä tila ilman toimijoita - aktivoinnilla siihen luodaan toimintaa. Digitaalisella aktivoinnilla ja osallistamisella pyritään saamaan opiskelijat (osallistujat) aktiivisiksi toimijoiksi verkko-oppimisympäristöissä.',
    keywords: [
      { value: 'oppiminen' },
      { value: 'verkko-opetus' },
      { value: 'pedagogiikka' },
      { value: 'digipedagogiikka' },
      { value: 'oppimistehtävä' },
      { value: 'aktiviteetti' },
    ],
    learningResourceType: [
      { value: 'teksti' },
      { value: 'audio' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'täydennyskoulutus' },
      { value: 'lukiokoulutus' },
      { value: 'ammatillinen koulutus' },
      { value: 'korkeakoulutus' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'esimerkki',
          educationalSubject: [
            { value: 'kasvatustieteet' }
          ],
        },
        educationalFramework: 'esimerkki',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'opettaja' },
      { value: 'täydennyskouluttautuja' },
      { value: 'mentori' },
      { value: 'hallinnoija' },
    ],
    educationalUse: [
      { value: 'ammatillinen tuki' },
      { value: 'itseopiskelu' },
    ],
    interactivityType: [
      { value: 'ohjeistava' },
    ],
    inLanguage: {
      id: 'FI',
      value: 'suomi',
    },
    accessibilityFeatures: [
      { value: 'käsikirjoitus' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
  },
  {
    id: 14,
    materials: [
      {
        file: {
          originalFilename: 'A Podcast Learning assignments.m4a',
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        file: {
          originalFilename: 'b Podcast Learning assignments text .pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'c Infograf Learning assignment ideas.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'd Planning learning assignments .pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Designing learning assignments',
    slug: 'designing-learning-assignments',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'A learning assignment is, as the name implies, an assignment which includes activities to guide and facilitate the learning of new things. A learning assignment is a significant means or method for the teacher to get the student to learn new things in a meaningful and thoughtful way. Learning assignments structures the web-learning process in the same was as lessons or lectures do. Without actors, the learning environment of the web is an empty space. Learning activities bring goal-oriented activities. Digital activation and participation aim at making the students (participants) active agents in the web-based learning environment.',
    keywords: [
      { value: 'learning' },
      { value: 'teaching' },
      { value: 'learning process' },
      { value: 'pedagogy' },
      { value: 'activity' },
      { value: 'online teaching' },
      { value: 'digital pedagogy' },
      { value: 'learning assignment' },
    ],
    learningResourceType: [
      { value: 'text' },
      { value: 'audio' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'continuing education' },
      { value: 'upper secondary school' },
      { value: 'vocational education' },
      { value: 'higher education' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'example',
          educationalSubject: [
            { value: 'educational sciences' }
          ],
        },
        educationalFramework: 'example',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'teacher' },
      { value: 'professional' },
      { value: 'mentor' },
      { value: 'administrator' },
    ],
    educationalUse: [
      { value: 'professional support' },
      { value: 'independet study' },
    ],
    interactivityType: [
      { value: 'expositive' },
    ],
    inLanguage: {
      id: 'EN',
      value: 'English',
    },
    accessibilityFeatures: [
      { value: 'transcript' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.en',
    },
  },
  {
    id: 15,
    materials: [
      {
        file: {
          originalFilename: 'A Podcast Läruppgifter.m4a',
          mimeType: 'audio/m4a',
          format: 'audio',
        },
      },
      {
        file: {
          originalFilename: 'b Podcast Läruppgifter text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'c Ideer för läruppgifter.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          originalFilename: 'd Planeringsblankett läruppgifter.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Plannering av lärupgifter',
    slug: 'plannering-av-larupgifter',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Lärandeuppgiften är, som namnet antyder, en uppgift som innehåller aktiviteter som handleder och möjliggör lärandet av något nytt. Lärandeuppgifter är betydelsefulla metoder för läraren att få den studerande att lära sig nya saker på pedagogiskt behagliga och eftertänkta sätt. Lärandeuppgifter strukturerar nätbaserade lärprocesser på samma sätt som lektioner och föreläsningar i närundervisning. En nätbaserad lärandemiljö är ett tomt utrymme utan aktörer. Målinriktad verksamhet skapas genom lärandeaktiviteter. Att aktivera och engagera digitalt syftar till att göra studerande (deltagarna) till aktiva aktörer i nätbaserade lärandemiljöer.',
    keywords: [
      { value: 'inlärningsprocess' },
      { value: 'pedagogik' },
      { value: 'digipedagogik' },
      { value: 'aktivitet' },
      { value: 'inlärning' },
      { value: 'undervisning' },
      { value: 'nätundervisning' },
      { value: 'lärupgift' },
    ],
    learningResourceType: [
      { value: 'text' },
      { value: 'audio' },
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'fortbildning' },
      { value: 'gymnasietutbildning' },
      { value: 'yrkesutbilfning' },
      { value: 'högskol' },
    ],
    typicalAgeRange: '18-',
    educationalAlignment: [
      {
        alignmentType: {
          value: 'example',
          educationalSubject: [
            { value: 'pedagogik' }
          ],
        },
        educationalFramework: 'example',
        teaches: [],
        complexity: '',
      },
    ],
    educationalRole: [
      { value: 'lärare' },
      { value: 'expert' },
      { value: 'handledare' },
      { value: 'adminstratör' },
    ],
    educationalUse: [
      { value: 'professionell stöd' },
      { value: 'oberoende studie' },
    ],
    interactivityType: [
      { value: 'rådgivning' },
    ],
    inLanguage: {
      id: 'SV',
      value: 'Svenska',
    },
    accessibilityFeatures: [
      { value: 'transcript' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.sv',
    },
  },
];
