import { EducationalMaterial } from '../../models/demo/educational-material';

/**
 * Educational Materials mock
 */
export const EDUCATIONALMATERIALS: EducationalMaterial[] = [
  // Digipedagogiikka 1
  {
    id: 1,
    specialId: 1,
    img: 'assets/img/1-digipedagogiikka.png',
    download: 'https://aoe.fi/files/fi-1-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-1-digipedagogiikka.m4a',
          originalFilename: 'A Podcast Digipedagogiikka.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-1b-digipedagogiikka.pdf',
          originalFilename: 'b Podcast Digipedagogiikka - teksti.pdf',
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
    description: 'Digitaalinen pedagogiikka on tieto- ja viestintteknisten vlineiden ja sovellusten, verkko-oppimisympristjen ja sosiaalisen median mielekst kytt opetuksessa, ohjauksessa, oppimisessa ja opiskelussa. Digitaalisessa pedagogiikassa on sopivassa suhteessa niin tekniikkaa kuin pedagogiikkaa. Verkkopedagoginen osaaminen, omat kokemukset, opiskelijoiden taidot ja laitteet sek kytettviss oleva tekniikka vaikuttavat siihen millaista digitaalista pedagogiikkaa opettaja omassa tyssn toteuttaa.',
    keywords: [
      { value: 'digipedagogiikka' },
      { value: 'pedagogiikka' },
      { value: 'TVT' },
      { value: 'tieto- ja viestinttekniikka' },
    ],
    learningResourceType: [
      'audio',
      'text',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'omaehtoinen osaamisen kehittminen' },
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
      { value: 'tydennyskouluttautuja' },
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
      { value: 'ksikirjoitus' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
  },
  {
    id: 2,
    specialId: 1,
    img: 'assets/img/1-digipedagogiikka.png',
    download: 'https://aoe.fi/files/en-1-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/en-1-digipedagogiikka.m4a',
          originalFilename: 'A Podcast Digital Pedagogy.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-1b-digipedagogiikka.pdf',
          originalFilename: 'b Podcast Digital pedagogy - text.pdf',
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
    description: 'Digital pedagogy is the meaningful use of information and communication technology and applications, web-based learning environments and social media in teaching, guiding, learning and studying. Digital pedagogy contains a relevant proportion of both technology and pedagogy. Web-based knowhow, our experiences, the students skills and equipment and the available technology all impact on the kind of digital pedagogy a teacher will implement in his/her own work.',
    keywords: [
      { value: 'digital pedagogy' },
      { value: 'pedagogy' },
      { value: 'ICT' },
      { value: 'information and communications technology' },
    ],
    learningResourceType: [
      'audio',
      'text',
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
    specialId: 1,
    img: 'assets/img/1-digipedagogiikka.png',
    download: 'https://aoe.fi/files/sv-1-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-1-digipedagogiikka.m4a',
          originalFilename: 'A Podcast Digipedagogik.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-1b-digipedagogiikka.m4a',
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
    description: 'Digital pedagogik innefattar anvndningen av informations- och kommunikationstekniska verktyg och applikationer, ntbaserade lrandemiljer och sociala medier i undervisning, handledning och studier. Digital pedagogik har en god balans mellan teknik och pedagogik. Hur lraren anvnder digital pedagogik i det egna arbetet beror p ntpedagogisk kompetens, egna erfarenheter, studerandenas frdigheter och apparater, och tillgnglig teknik.',
    keywords: [
      { value: 'digipedagogik' },
      { value: 'pedagogik' },
      { value: 'ICT' },
      { value: 'informations- och kommunikationsteknik' },
    ],
    learningResourceType: [
      'audio',
      'text',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'sjlvstndig utveckling av kompetens' },
      { value: 'gymnasietutbildning' },
      { value: 'yrkesutbilfning' },
      { value: 'hgskol' },
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
      { value: 'lrare' },
      { value: 'expert' },
      { value: 'handledare' },
      { value: 'adminstratr' },
    ],
    educationalUse: [
      { value: 'professionell std' },
      { value: 'oberoende studie' },
    ],
    interactivityType: [
      { value: 'rdgivning' },
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
    specialId: 2,
    img: 'assets/img/video.png',
    download: 'https://aoe.fi/files/fi-2-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-2-digipedagogiikka.mp4',
          originalFilename: 'A Video Digitaalisuus ja teknologia kouluissa.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-2b-digipedagogiikka.pdf',
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
    description: 'Digitaalisuus ja teknologia kouluissa tarkoittaa mobiilia Interneti, sosiaalista mediaa, pilvipalveluita, dataa ja datan kytt. Se tarkoittaa mys jrjestelmi, tietokoneita, ohjelmia, sovelluksia, vlineit sek oppimisalustoja sek opetustilojen varustamista. Koulussa pohditaan mit digitaalisuus tarkoittaa ja mit silt halutaan.',
    keywords: [
      { value: 'digipedagogiikka' },
      { value: 'digitaalisuus' },
      { value: 'TVT' },
      { value: 'tieto- ja viestinttekniikka' },
      { value: 'teknologia' },
    ],
    learningResourceType: [
      'video',
      'text',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'tydennyskoulutus' },
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
      { value: 'tydennyskouluttautuja' },
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
      { value: 'ksikirjoitus' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
  },
  {
    id: 5,
    specialId: 2,
    img: 'assets/img/video.png',
    download: 'https://aoe.fi/files/en-2-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/en-2-digipedagogiikka.mp4',
          originalFilename: 'A Video Digitalization and technology in schools.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-2b-digipedagogiikka.pdf',
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
      'video',
      'text',
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
    specialId: 2,
    img: 'assets/img/video.png',
    download: 'https://aoe.fi/files/sv-2-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-2-digipedagogiikka.mp4',
          originalFilename: 'A Video Digitalisering och teknologi i skolor.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-2b-digipedagogiikka.pdf',
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
    description: 'Digitalisering och teknologi i skolan betyder mobila internet, sociala medier, molntjnster, data och ut njutning av data. Det betyder olika system, datamaskiner, program, applikationer, verktyg och lr plattformar. I skolan diskuteras vad digitaliseringen betyder och vad vill man av det.',
    keywords: [
      { value: 'digipedagogik' },
      { value: 'digital' },
      { value: 'ICT' },
      { value: 'informations- och kommunikationsteknik' },
      { value: 'teknik' },
    ],
    learningResourceType: [
      'video',
      'text',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'fortbildning' },
      { value: 'gymnasietutbildning' },
      { value: 'yrkesutbilfning' },
      { value: 'hgskol' },
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
      { value: 'lrare' },
      { value: 'expert' },
      { value: 'handledare' },
      { value: 'adminstratr' },
    ],
    educationalUse: [
      { value: 'professionell std' },
      { value: 'oberoende studie' },
    ],
    interactivityType: [
      { value: 'rdgivning' },
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
    specialId: 3,
    img: 'assets/img/video.png',
    download: 'https://aoe.fi/files/fi-3-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-3-digipedagogiikka.mp4',
          originalFilename: 'A Video Opetuksen ja oppimisen suunnittelu.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-3b-digipedagogiikka.pdf',
          originalFilename: 'b Video Opetuksen ja oppimisen suunnittelu - teksti.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-3c-digipedagogiikka.pdf',
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
    description: 'Learning Design  opetuksen ja oppimisen suunnittelu tarkoittaa sek opettajan opetuksen suunnittelua ja valmistelua ett opiskelijan tavoitteellisen oppimisen suunnittelua. Tm sislt oppimisprosessin, oppimistilanteiden, oppimisaktiviteettien mm. oppimistehtvien sek tyskentelyohjeiden, ja ohjauksen suunnittelua. Se on mys oppimisympristjen, digitaalisten oppimisen vlineiden ja menetelmien valintaa.',
    keywords: [
      { value: 'oppiminen' },
      { value: 'opetus' },
      { value: 'oppimisprosessi' },
      { value: 'oppimistehtv' },
      { value: 'oppimisaktiviteetti' },
      { value: 'ohjaus' },
      { value: 'pedagogiikka' },
      { value: 'digipedagogiikka' },
      { value: 'aktivointi' },
      { value: 'oppimisymprist' },
    ],
    learningResourceType: [
      'video',
      'text',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'tydennyskoulutus' },
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
      { value: 'tydennyskouluttautuja' },
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
      { value: 'ksikirjoitus' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
  },
  {
    id: 8,
    specialId: 3,
    img: 'assets/img/video.png',
    download: 'https://aoe.fi/files/en-3-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/en-3-digipedagogiikka.mp4',
          originalFilename: 'A Video Learning design.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-3b-digipedagogiikka.pdf',
          originalFilename: 'b Video Learning design text script.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-3c-digipedagogiikka.pdf',
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
    description: 'Learning Design means planning teaching and students goal-oriented learning. This includes designing the learning process, learning situations, learning activities for example learning assignments and instructions, and guidance. It includes also choices of learning environments and digital learning tools and means.',
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
      'video',
      'text',
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
    specialId: 3,
    img: 'assets/img/video.png',
    download: 'https://aoe.fi/files/sv-3-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-3-digipedagogiikka.mp4',
          originalFilename: 'A Video Planering av undervisning och larande.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-3b-digipedagogiikka.pdf',
          originalFilename: 'b Video Planering av undervisning och larande text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-3c-digipedagogiikka.pdf',
          originalFilename: 'c Infograf Planering av undervisning och larande.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Planering av undevisning och lrande',
    slug: 'planering-av-undevisning-och-larande',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Learning Design  planering av undervisning och lrande betyder bde att lraren planerar sin egen undervisning och studerandes mlinriktat lrande. Detta innehller planering av lrprocessen, lrsituationer, lraktiviteter mm. lruppgifter och anvisningar, och planering av handledning. Det innehller ocks val av lrmiljer, digitala verktyg och metoder fr lrande.',
    keywords: [
      { value: 'inlrningsprocess' },
      { value: 'inlrningsmilj' },
      { value: 'handledning' },
      { value: 'pedagogik' },
      { value: 'digipedagogik' },
      { value: 'aktivering' },
      { value: 'inlrning' },
      { value: 'undervisning' },
    ],
    learningResourceType: [
      'video',
      'text',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'fortbildning' },
      { value: 'gymnasietutbildning' },
      { value: 'yrkesutbilfning' },
      { value: 'hgskol' },
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
      { value: 'lrare' },
      { value: 'expert' },
      { value: 'handledare' },
      { value: 'adminstratr' },
    ],
    educationalUse: [
      { value: 'professionell std' },
      { value: 'oberoende studie' },
    ],
    interactivityType: [
      { value: 'rdgivning' },
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
    specialId: 4,
    img: 'assets/img/video.png',
    download: 'https://aoe.fi/files/fi-4-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-4-digipedagogiikka.mp4',
          originalFilename: 'A Video Oppimisprosessin suunnittelu.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-4b-digipedagogiikka.pdf',
          originalFilename: 'b Video Oppimisprosessin suunnittelu - teksti.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-4c-digipedagogiikka.m4a',
          originalFilename: 'c Podcast Oppimisprosessin nakyvaksi tekeminen ammatilliselle opiskelijalle.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-4d-digipedagogiikka.pdf',
          originalFilename: 'd Podcast Oppimisprosessin nakyvaksi tekeminen ammatilliselle opiskelijalle - teksti.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-4e-digipedagogiikka.m4a',
          originalFilename: 'e Podcast Oppimisprosessin ohjaus verkossa.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-4f-digipedagogiikka.pdf',
          originalFilename: 'f Podcast Oppimisprosessin ohjaus verkossa teksti.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-4g-digipedagogiikka.pdf',
          originalFilename: 'g Infotaulu Oppimisprosessin ja oppimistilanteiden suunnittelu.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-4h-digipedagogiikka.pdf',
          originalFilename: 'h Infotaulu Yksilollinen oppimisprosessiI.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-4i-digipedagogiikka.pdf',
          originalFilename: 'i Infotaulu Monialainen oppimisprosessi.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-4j-digipedagogiikka.pdf',
          originalFilename: 'j Infotaulu Ilmiopohjaisen oppimisen suunnittelu.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-4k-digipedagogiikka.pdf',
          originalFilename: 'k Infotaulu Avoin ilmiopohjainen oppimisprosessi.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-4l-digipedagogiikka.pdf',
          originalFilename: 'l Infotaulu Casepohjainen oppiminen.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-4m-digipedagogiikka.pdf',
          originalFilename: 'm Infotaulu Kaanteinen luokkahuoneopetus.pdf',
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
    description: 'Oppimisprosessilla tarkoitetaan ajallisesti ja askelittain etenev, ennalta suunniteltua ja tavoitteellista oppimista. Oppimisprosessi on pidempikestoinen, useammasta oppimistilanteesta muodostuva tavoitteellinen opetuskokonaisuus. Oppimisprosessi on helpompi ksitt, kun sit mietitn matkana, polkuna, eri etappien muodostamana kokonaisuutena, tien, seikkailuna, pelin.',
    keywords: [
      { value: 'oppiminen' },
      { value: 'opetus' },
      { value: 'oppimisprosessi' },
      { value: 'pedagoginen malli' },
      { value: 'casepohjainen oppiminen' },
      { value: 'ilmipohjainen oppiminen' },
      { value: 'pedagogiikka' },
      { value: 'digipedagogiikka' },
      { value: 'yksilllinen oppiminen' },
      { value: 'monialainen oppiminen' },
      { value: 'knteinen luokkahuoneopetus' },
    ],
    learningResourceType: [
      'video',
      'audio',
      'exercise',
      'text',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'tydennyskoulutus' },
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
      { value: 'tydennyskouluttautuja' },
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
      { value: 'ksikirjoitus' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
  },
  {
    id: 11,
    specialId: 4,
    img: 'assets/img/video.png',
    download: 'https://aoe.fi/files/en-4-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/en-4-digipedagogiikka.mp4',
          originalFilename: 'A Video Planning the learning process.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-4b-digipedagogiikka.pdf',
          originalFilename: 'b Video Planning the learning process - text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-4c-digipedagogiikka.m4a',
          originalFilename: 'c Podcast Making the learning process visible for a vocational student.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-4d-digipedagogiikka.pdf',
          originalFilename: 'd Podcast Making the learning process visible - vocational education text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-4e-digipedagogiikka.m4a',
          originalFilename: 'e Podcast Guiding the learning process on the web.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-4f-digipedagogiikka.pdf',
          originalFilename: 'f Podcast Guiding the learning process on the web text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-4g-digipedagogiikka.pdf',
          originalFilename: 'g Infograf Planning learning process and situations.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-4h-digipedagogiikka.pdf',
          originalFilename: 'h Infograf Individual learning process.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-4i-digipedagogiikka.pdf',
          originalFilename: 'i Infograf Multidisciplinary learning process.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-4j-digipedagogiikka.pdf',
          originalFilename: 'j Infograf Planning phenomen-based learning.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-4k-digipedagogiikka.pdf',
          originalFilename: 'k Infograf Open phenomenon-based learning process.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-4l-digipedagogiikka.pdf',
          originalFilename: 'l Infograf Case-based learning.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-4m-digipedagogiikka.pdf',
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
      'video',
      'audio',
      'exercise',
      'text',
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
    specialId: 4,
    img: 'assets/img/video.png',
    download: 'https://aoe.fi/files/sv-4-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-4-digipedagogiikka.mp4',
          originalFilename: 'A Video Planering av en larprocess.mp4',
          mimeType: 'video/mp4',
          format: 'video',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-4b-digipedagogiikka.pdf',
          originalFilename: 'b Video Planeringen av en larprocess text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-4c-digipedagogiikka.m4a',
          originalFilename: 'c Podcast Att synliggora larprocessen for studerande inom yrkesutbildning.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-4d-digipedagogiikka.pdf',
          originalFilename: 'd Podcast Att synliggora larprocessen for studerande inom yrkesutbildning text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-4e-digipedagogiikka.m4a',
          originalFilename: 'e Podcast Handledning av larprocessen i natet.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-4f-digipedagogiikka.pdf',
          originalFilename: 'f Podcast Handledning av larprocessen i natet - text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-4g-digipedagogiikka.pdf',
          originalFilename: 'g Infograf Planning av en larprocess och larsituationer.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-4h-digipedagogiikka.pdf',
          originalFilename: 'h Infograf Individuell larprocess.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-4i-digipedagogiikka.pdf',
          originalFilename: 'i Infograf Mangvetenskaplig larprocess.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-4j-digipedagogiikka.pdf',
          originalFilename: 'j Infograf Planering av fenomenbaserat larande.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-4k-digipedagogiikka.pdf',
          originalFilename: 'k Infograf En oppen fenomenbaserad larprocess.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-4l-digipedagogiikka.pdf',
          originalFilename: 'l Infograf Case-baserat larande.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-4m-digipedagogiikka.pdf',
          originalFilename: 'm Infograf Omvant klassrum.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Planering av undevisning och lrande',
    slug: 'planering-av-undevisning-och-larande',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
      { firstName: 'Leena', lastName: 'Vainio' },
    ],
    // tslint:disable-next-line
    description: 'En lrandeprocess betecknar p frhand planerat och mlinriktat lrande som framskrider tidsbundet och stegvis. Lrandeprocessen r en mer lngvarig undervisningshelhet som bestr av flera lrandesituationer. Det r lttare att begripa lrandeprocessen d den frsts som en resa, en stig, en helhet bestende av flera etapper, en vg, ett ventyr, ett spel.',
    keywords: [
      { value: 'inlrningsprocess' },
      { value: 'pedagogik' },
      { value: 'digipedagogik' },
      { value: 'aktivering' },
      { value: 'inlrning' },
      { value: 'undervisning' },
      { value: 'flippat klassrum' },
      { value: 'tvrvetenskapliga inlrning' },
      { value: 'pedagogiska metoder' },
      { value: 'casemetodik' },
    ],
    learningResourceType: [
      'video',
      'audio',
      'exercise',
      'text',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'fortbildning' },
      { value: 'gymnasietutbildning' },
      { value: 'yrkesutbilfning' },
      { value: 'hgskol' },
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
      { value: 'lrare' },
      { value: 'expert' },
      { value: 'handledare' },
      { value: 'adminstratr' },
    ],
    educationalUse: [
      { value: 'professionell std' },
      { value: 'oberoende studie' },
    ],
    interactivityType: [
      { value: 'rdgivning' },
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
    specialId: 5,
    img: 'assets/img/5-digipedagogiikka.png',
    download: 'https://aoe.fi/files/fi-5-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-5-digipedagogiikka.m4a',
          originalFilename: 'A Podcast Oppimistehtava.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-5b-digipedagogiikka.pdf',
          originalFilename: 'b Podcast Oppimistehtava - teksti.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-5c-digipedagogiikka.pdf',
          originalFilename: 'c Oppimistehtavaideoita oppimisprosessin eri vaiheisiin.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-5d-digipedagogiikka.pdf',
          originalFilename: 'd Oppimistehtavan suunnittelu.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Oppimistehtvien suunnittelu',
    slug: 'oppimistehtavien-suunnittelu',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Oppimistehtv on nimens mukaan tehtv, johon sisn rakennetaan uuden oppimista ohjaavaa ja mahdollistavaa toimintaa. Oppimistehtv on opettajan merkittv keino tai menetelm saada oppija pedagogisesti mielekksti ja mietitysti oppimaan uusia asioita. Oppimistehtvt jsentvt verkko-oppimisprosessia samalla tavalla kuin lhiopetuksen tunnit tai luennot. Verkko-oppimisymprist on tyhj tila ilman toimijoita - aktivoinnilla siihen luodaan toimintaa. Digitaalisella aktivoinnilla ja osallistamisella pyritn saamaan opiskelijat (osallistujat) aktiivisiksi toimijoiksi verkko-oppimisympristiss.',
    keywords: [
      { value: 'oppiminen' },
      { value: 'verkko-opetus' },
      { value: 'pedagogiikka' },
      { value: 'digipedagogiikka' },
      { value: 'oppimistehtv' },
      { value: 'aktiviteetti' },
    ],
    learningResourceType: [
      'audio',
      'text',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'tydennyskoulutus' },
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
      { value: 'tydennyskouluttautuja' },
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
      { value: 'ksikirjoitus' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
  },
  {
    id: 14,
    specialId: 5,
    img: 'assets/img/5-digipedagogiikka.png',
    download: 'https://aoe.fi/files/en-5-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/en-5-digipedagogiikka.m4a',
          originalFilename: 'A Podcast Learning assignments.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-5b-digipedagogiikka.pdf',
          originalFilename: 'b Podcast Learning assignments text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-5c-digipedagogiikka.pdf',
          originalFilename: 'c Infograf Learning assignment ideas.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-5d-digipedagogiikka.pdf',
          originalFilename: 'd Planning learning assignments.pdf',
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
      'audio',
      'text',
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
    specialId: 5,
    img: 'assets/img/5-digipedagogiikka.png',
    download: 'https://aoe.fi/files/sv-5-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-5-digipedagogiikka.m4a',
          originalFilename: 'A Podcast Laruppgifter.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-5b-digipedagogiikka.pdf',
          originalFilename: 'b Podcast Laruppgifter text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-5c-digipedagogiikka.pdf',
          originalFilename: 'c Ideer for laruppgifter.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-5d-digipedagogiikka.pdf',
          originalFilename: 'd Planeringsblankett laruppgifter.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Plannering av lrupgifter',
    slug: 'plannering-av-larupgifter',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Lrandeuppgiften r, som namnet antyder, en uppgift som innehller aktiviteter som handleder och mjliggr lrandet av ngot nytt. Lrandeuppgifter r betydelsefulla metoder fr lraren att f den studerande att lra sig nya saker p pedagogiskt behagliga och eftertnkta stt. Lrandeuppgifter strukturerar ntbaserade lrprocesser p samma stt som lektioner och frelsningar i nrundervisning. En ntbaserad lrandemilj r ett tomt utrymme utan aktrer. Mlinriktad verksamhet skapas genom lrandeaktiviteter. Att aktivera och engagera digitalt syftar till att gra studerande (deltagarna) till aktiva aktrer i ntbaserade lrandemiljer.',
    keywords: [
      { value: 'inlrningsprocess' },
      { value: 'pedagogik' },
      { value: 'digipedagogik' },
      { value: 'aktivitet' },
      { value: 'inlrning' },
      { value: 'undervisning' },
      { value: 'ntundervisning' },
      { value: 'lrupgift' },
    ],
    learningResourceType: [
      'audio',
      'text',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'fortbildning' },
      { value: 'gymnasietutbildning' },
      { value: 'yrkesutbilfning' },
      { value: 'hgskol' },
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
      { value: 'lrare' },
      { value: 'expert' },
      { value: 'handledare' },
      { value: 'adminstratr' },
    ],
    educationalUse: [
      { value: 'professionell std' },
      { value: 'oberoende studie' },
    ],
    interactivityType: [
      { value: 'rdgivning' },
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
  // Digipedagogiikka 6
  {
    id: 16,
    specialId: 6,
    img: 'assets/img/6-digipedagogiikka.jpg',
    download: 'https://aoe.fi/files/fi-6-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6-digipedagogiikka.m4a',
          originalFilename: 'A Podcast Verkko-oppimisympariston rakentaminen on kayttajakokemuksen suunnittelua.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6b-digipedagogiikka.pdf',
          originalFilename: 'b Podcast Verkko-oppimisympristn rakentaminen on kyttjkokemuksen suunnittelua teksti.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6c-digipedagogiikka.pdf',
          originalFilename: 'c Verkkokurssin kyttjkokemuksen arviointi.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6d-digipedagogiikka.m4a',
          originalFilename: 'd Podcast Viestint verkossa.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6e-digipedagogiikka.pdf',
          originalFilename: 'e Podcast Viestint verkossa teksti.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6f-digipedagogiikka.m4a',
          originalFilename: 'f Podcast Koulutukselliset videot.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6g-digipedagogiikka.pdf',
          originalFilename: 'g Podcast Koulutukselliset videot teksti.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6h-digipedagogiikka.pdf',
          originalFilename: 'h Koulutuksellisten videoiden arviointi.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6i-digipedagogiikka.m4a',
          originalFilename: 'i Podcast Microlearning.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6j-digipedagogiikka.pdf',
          originalFilename: 'j Podcast Microlearning teksti.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6k-digipedagogiikka.pdf',
          originalFilename: 'k Infotaulu Microlearning .pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6l-digipedagogiikka.pdf',
          originalFilename: 'l Infotaulu Webinaarin suunnittelu.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6m-digipedagogiikka.pdf',
          originalFilename: 'm Webinaari tykirja.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6n-digipedagogiikka.pdf',
          originalFilename: 'n Infotaulu MOOC.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Verkko-opetus',
    slug: 'verkko-opetus',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Verkko-opetus tarkoittaa opetuksen jarjestamista verkkoon erilaisin digitaalisin valinein siten, etta se on kaytettavissa eri laitteilla selainpohjaisesti tai mobiili sovelluksena. Se voi olla online -kursseja, MOOCeja ja itseopiskelukursseja, webinaareja, verkostoja seka niiden fasilitointia ja ohjausta. Verkko-opetus voidaan suunnitella joko samanaikaiseen tai eriaikaiseen opiskeluun. Oppimateriaalipaketit ovat myos verkko-opetusta. Oppimisprosessin kuvaus verkkoalustalla on myos verkko-opetusta. Verkon tyokaluja voidaan kayttaa oppimisprosessin nakyvaksi tekemisessa, vaikka itse opiskelu ei tapahdukaan verkkoymparistossa.',
    keywords: [
      { value: 'oppiminen' },
      { value: 'verkko-opetus' },
      { value: 'pedagogiikka' },
      { value: 'digipedagogiikka' },
      { value: 'eLearning' },
      { value: 'verkko-opiskelu' },
      { value: 'opetus' },
    ],
    learningResourceType: [
      'audio',
      'text',
      'exercise',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'tydennyskoulutus' },
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
      { value: 'tydennyskouluttautuja' },
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
      { value: 'ksikirjoitus' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
  },
  {
    id: 17,
    specialId: 6,
    img: 'assets/img/6-digipedagogiikka.jpg',
    download: 'https://aoe.fi/files/en-6-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6-digipedagogiikka.m4a',
          originalFilename: 'A Podcast Building a web-learning environment is planning a user experience.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6b-digipedagogiikka.pdf',
          originalFilename: 'b Podcast Building a web-learning environment is planning user experience text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6c-digipedagogiikka.pdf',
          originalFilename: 'c Evaluation of the user experience of a web-based course.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6d-digipedagogiikka.m4a',
          originalFilename: 'd Podcast Communication on the web.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6e-digipedagogiikka.pdf',
          originalFilename: 'e Podcast Communication on the web text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6f-digipedagogiikka.m4a',
          originalFilename: 'f Podcast Educational videos.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6g-digipedagogiikka.pdf',
          originalFilename: 'g Podcast Educational videos text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6h-digipedagogiikka.pdf',
          originalFilename: 'h Educational videos evaluation.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6i-digipedagogiikka.m4a',
          originalFilename: 'i Podcast Microlearning.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6j-digipedagogiikka.pdf',
          originalFilename: 'j Podcast Microlearning text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6k-digipedagogiikka.pdf',
          originalFilename: 'k Infograf Microlearning.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6l-digipedagogiikka.pdf',
          originalFilename: 'l Infograf Planning a webinar.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6m-digipedagogiikka.pdf',
          originalFilename: 'm Webinar workbook.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6n-digipedagogiikka.pdf',
          originalFilename: 'n Infograf MOOC.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Web-based teaching',
    slug: 'web-based-teaching',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Web-based teaching means that teaching is organized and built into the web through different digital means so that it can be used through various devices, browsers or mobile applications These might be online courses, MOOCs and self-study courses, or they might be webinars or networks and facilitation and guiding. Web-based teaching can be used for simultaneous studying or for studying at different times. Learning materials and descriptions of the learning process are also part of web-based teaching. The tools of the web can be used to make the learning process visible even if the studying doesnt take place in a web-environment.',
    keywords: [
      { value: 'learning' },
      { value: 'teaching' },
      { value: 'eLearning' },
      { value: 'pedagogy' },
      { value: 'online study' },
      { value: 'digital pedagogy' },
    ],
    learningResourceType: [
      'audio',
      'text',
      'exercise',
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
    id: 18,
    specialId: 6,
    img: 'assets/img/6-digipedagogiikka.jpg',
    download: 'https://aoe.fi/files/sv-6-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6-digipedagogiikka.m4a',
          originalFilename: 'A Podcast En webbaserad larmiljo skapas genom att planera anvandarerfarenhet.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6b-digipedagogiikka.pdf',
          originalFilename: 'b Podcast En webbaserad larmiljo skapas genom att planera anvandarerfarenhet text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6c-digipedagogiikka.pdf',
          originalFilename: 'c Anvandarerfarenhet utvarderingssablon.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6d-digipedagogiikka.m4a',
          originalFilename: 'd Podcast Kommunikation pa natet.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6e-digipedagogiikka.pdf',
          originalFilename: 'e Podcast Kommunikation pa natet - text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6f-digipedagogiikka.m4a',
          originalFilename: 'f Podcast Utbildningsmassiga videor.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6g-digipedagogiikka.pdf',
          originalFilename: 'g Podcast Utbildningsmassiga videor - text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6h-digipedagogiikka.pdf',
          originalFilename: 'h Utvardering av video.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6i-digipedagogiikka.m4a',
          originalFilename: 'i Podcast Microlearning.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6j-digipedagogiikka.pdf',
          originalFilename: 'j Podcast Microlearning - text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6k-digipedagogiikka.pdf',
          originalFilename: 'k Infograf Microlearning.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6l-digipedagogiikka.pdf',
          originalFilename: 'l Infograf Hur planera en webinar.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6m-digipedagogiikka.pdf',
          originalFilename: 'm Webinar arbetsbok.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6n-digipedagogiikka.pdf',
          originalFilename: 'n Infograf MOOC.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Web-baserat lrande',
    slug: 'web-baserat-larande',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Hanne', lastName: 'Koli' },
    ],
    // tslint:disable-next-line
    description: 'Natbaserad undervisning betyder att undervisningen arrangeras och byggas upp pa natet med hjalp av olika digitala verktyg, sa att den ar tillganglig bade pa dator och via en mobilapplikation. Det kan handla om online-kurser, MOOCs och sjalvstudiekurser, webinarier, natverk samt facilitering och handledning av dessa. Natbaserad undervisning kan planeras s att den genomforas samtidigt eller vid olika tidpunkter. Ocksa laromedelspaketen ar natbaserad undervisning. Beskrivningen av larprocessen pa larplattformen ar ocksa natbaserad undervisning. Verktyg pa natet kan anvandas till att synliggora larprocessen, ocksa da sjalva studierna inte genomfors i natmiljo.',
    keywords: [
      { value: 'Ntundervisning' },
      { value: 'pedagogik' },
      { value: 'digipedagogik' },
      { value: 'inlrning' },
      { value: 'undervisning' },
      { value: 'ntstudier' },
      { value: 'eLearning' },
    ],
    learningResourceType: [
      'audio',
      'text',
      'exercise',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'fortbildning' },
      { value: 'gymnasietutbildning' },
      { value: 'yrkesutbilfning' },
      { value: 'hgskol' },
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
      { value: 'lrare' },
      { value: 'expert' },
      { value: 'handledare' },
      { value: 'adminstratr' },
    ],
    educationalUse: [
      { value: 'professionell std' },
      { value: 'oberoende studie' },
    ],
    interactivityType: [
      { value: 'rdgivning' },
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
  // Digipedagogiikka 7
  {
    id: 19,
    specialId: 7,
    img: 'assets/img/7-digipedagogiikka.png',
    download: 'https://aoe.fi/files/fi-7-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-7-digipedagogiikka.pdf',
          originalFilename: 'A Infotaulu Opetuksen digitaaliset valineet.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-7b-digipedagogiikka.pdf',
          originalFilename: 'b Infotaulu Opiskelun digivlineet.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Digitaaliset tyvlineet opetuksessa ja oppimisessa',
    slug: 'digitaaliset-tyovalineet-opetuksessa-ja-oppimisessa',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Leena', lastName: 'Vainio' },
    ],
    // tslint:disable-next-line
    description: 'Opetusteknologia kattaa kaiken teknologian, mill tuetaan oppimista perinteisess luokkaopetuksessa, sulautuvassa opetuksessa ja verkko-opetuksessa. Teknologia sislt vlineet, laitteet, ohjelmistot ja erilaiset sovellukset. Opetusteknologiaa ovat esimerkiksi toimisto-ohjelmat, oppimisalustat, arviointia tukevat tykalut, tykirjatyyppiset tykalut, digitaaliset oppimateriaalit, sosiaalinen media, tyvlineohjelmat, tiedonhaun vlineet, teknologiaan pohjautuvat kognitiiviset tykalut, informaation visualisoinnin tykalut sek simulaatiot, opetusohjelmat ja -pelit, 3D-mallinnukset, robotit jne.',
    keywords: [
      { value: 'TVT' },
      { value: 'tieto- ja viestinttekniikka' },
      { value: 'digitaaliset taidot' },
      { value: 'digipedagogiikka' },
    ],
    learningResourceType: [
      'text',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'tydennyskoulutus' },
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
      { value: 'tydennyskouluttautuja' },
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
      { value: 'ksikirjoitus' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
  },
  {
    id: 20,
    specialId: 7,
    img: 'assets/img/7-digipedagogiikka.png',
    download: 'https://aoe.fi/files/en-7-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/en-7-digipedagogiikka.pdf',
          originalFilename: 'A Infograf Digital tools for teaching.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-7b-digipedagogiikka.pdf',
          originalFilename: 'b Infograf Digital tools for studying.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Digital teaching and studying tools',
    slug: 'digital-teaching-and-studying-tools',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Leena', lastName: 'Vainio' },
    ],
    // tslint:disable-next-line
    description: 'Teaching technology covers all technology that is used to support learning in traditional classroom teaching, in blended teaching and in web-based teaching. Technology covers devices, tools, programs and different applications. Teaching technologies include for instance services for group work and communication, workbooks, digital learning material, social media, tool programs, tools for evaluation, information search tools, cognitive tools based on technology, tools for visualising information as well as simulations, educational programs, educational games, 3D models, robots and so on.',
    keywords: [
      { value: 'ICT' },
      { value: 'information and communications technology' },
      { value: 'digital pedagogy' },
    ],
    learningResourceType: [
      'text',
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
    id: 21,
    specialId: 7,
    img: 'assets/img/7-digipedagogiikka.png',
    download: 'https://aoe.fi/files/sv-7-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-7-digipedagogiikka.pdf',
          originalFilename: 'A Infograf Digitala verktyg for undervisningen.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-7b-digipedagogiikka.pdf',
          originalFilename: 'b Infograf Digitala verktyg for studier.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Digitaliska verktyg',
    slug: 'digitaliska-verktyg',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Leena', lastName: 'Vainio' },
    ],
    // tslint:disable-next-line
    description: 'Undervisningsteknologi innefattar all sdan teknologi som stder lrandet i traditionell klassrumsundervisning, blandade lrmiljer och nt-undervisning. Teknologi innefattar alla verktyg, apparater, program och olika applikationer. Lrandeteknologi r exempelvis kontorsprogram, lrandeplattformer, verktyg som stder bedmning, verktyg som liknar arbetsbcker, digitala lrandematerial, sociala medier, arbetsverktygsprogram, verktyg fr informationsskning, teknologibaserade kognitiva verktyg, verktyg som visualiserar information, simulationer, undervisningsprogram- och spel, 3D-modeller, roboter, osv.',
    keywords: [
      { value: 'ICT' },
      { value: 'pedagogik' },
      { value: 'digipedagogik' },
      { value: 'informations- och kommunikationsteknik' },
    ],
    learningResourceType: [
      'text',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'fortbildning' },
      { value: 'gymnasietutbildning' },
      { value: 'yrkesutbilfning' },
      { value: 'hgskol' },
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
      { value: 'lrare' },
      { value: 'expert' },
      { value: 'handledare' },
      { value: 'adminstratr' },
    ],
    educationalUse: [
      { value: 'professionell std' },
      { value: 'oberoende studie' },
    ],
    interactivityType: [
      { value: 'rdgivning' },
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
  // Digipedagogiikka 8
  {
    id: 22,
    specialId: 8,
    img: 'assets/img/8-digipedagogiikka.jpg',
    download: 'https://aoe.fi/files/fi-8-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-8-digipedagogiikka.m4a',
          originalFilename: 'A Podcast Digitaaliset oppimateriaalit.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-8b-digipedagogiikka.pdf',
          originalFilename: 'b Podcast Digitaaliset oppimateriaalit ja niiden kytt opiskelussa ja opetuksessa - teksti.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-8c-digipedagogiikka.pdf',
          originalFilename: 'c Infotaulu Digitaaliset aineistot opiskelussa ja opetuksessa.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-8d-digipedagogiikka.pdf',
          originalFilename: 'd Infotaulu Digitaaliset oppimateriaalit ja niiden kytt opiskelussa ja opetuksessa -luokittelua.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Digitaaliset oppimateriaalit',
    slug: 'digitaaliset-oppimateriaalit',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Leena', lastName: 'Vainio' },
    ],
    // tslint:disable-next-line
    description: 'Digitaalisilla oppimateriaaleilla tarkoitetaan eri shkisiss mediamuodoissa olevaa aineistoa mm. kuvia, tekstej, videoita, karttoja, kirjoja, nitiedostoja, infotauluja, kaavioita, elokuvia. Niit voi tuottaa itse tai voi kytt muiden tuottamia aineistoja, mikli niit on oikeus kytt opetuksessa ja opiskelussa. Digitaalisia sisltj voidaan jakaa verkon kautta oppimisympristiss tai erilaisten jakopalvelujen kautta.',
    keywords: [
      { value: 'TVT' },
      { value: 'tieto- ja viestinttekniikka' },
      { value: 'digitaaliset taidot' },
      { value: 'digipedagogiikka' },
      { value: 'digitaalinen oppimateriaali' },
      { value: 'media' },
    ],
    learningResourceType: [
      'text',
      'audio',
      'exercise',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'tydennyskoulutus' },
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
      { value: 'tydennyskouluttautuja' },
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
      { value: 'ksikirjoitus' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
  },
  {
    id: 23,
    specialId: 8,
    img: 'assets/img/8-digipedagogiikka.jpg',
    download: 'https://aoe.fi/files/en-8-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/en-8-digipedagogiikka.m4a',
          originalFilename: 'A Podcast Digital learning material and its use in studying and teaching.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-8b-digipedagogiikka.pdf',
          originalFilename: 'b Podcast  Digital learning materials and their use in studying and  teaching text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-8c-digipedagogiikka.pdf',
          originalFilename: 'c Infograf Digital learning materials in studing and teaching.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-8d-digipedagogiikka.pdf',
          originalFilename: 'd Digital materials and content in studying and teaching - classification.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Digital learning materials',
    slug: 'digital-learning-materials',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Leena', lastName: 'Vainio' },
    ],
    // tslint:disable-next-line
    description: 'Digital learning material refer to content of varying media in an electronic form including images, text, videos, maps, books, sound recordings, infografs, graphs or film. These can be made, or you can use material made by others as long as you have a right to use them in education. Digital content can be shared through the web in learning environments or various sharing platforms.',
    keywords: [
      { value: 'ICT' },
      { value: 'information and communications technology' },
      { value: 'digital pedagogy' },
      { value: 'technology' },
      { value: 'digital learning resource' },
      { value: 'media' },
      { value: 'digital skills' },
    ],
    learningResourceType: [
      'text',
      'audio',
      'exercise',
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
    id: 24,
    specialId: 8,
    img: 'assets/img/8-digipedagogiikka.jpg',
    download: 'https://aoe.fi/files/sv-8-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-8-digipedagogiikka.m4a',
          originalFilename: 'A Podcast Digitala laromedel och anvandning av dem i undervisningen.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-8b-digipedagogiikka.pdf',
          originalFilename: 'b Podcast Digitala lromedel och anvndningen av dem i undervisningen text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-8c-digipedagogiikka.pdf',
          originalFilename: 'c Digimaterial i undervisning och studier.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-8d-digipedagogiikka.pdf',
          originalFilename: 'd Digitalt material och -innehll i studier och i undervisning -klassificering.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Digitaliska lromedel',
    slug: 'digitaliska-laromedel',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Leena', lastName: 'Vainio' },
    ],
    // tslint:disable-next-line
    description: 'Digitala lrmaterial r elektroniska material i olika format, t.ex. bilder, texter, videor, kartor, bcker, ljudfiler, infografer, diagram, filmer. Man kan producera dem sjlv eller anvnda material som producerats av andra, s lnge man har rtt att anvnda dem i undervisning och studier. Digitala innehll kan delas via ntet genom lrandemiljer eller olika delningstjnster.',
    keywords: [
      { value: 'ICT' },
      { value: 'media' },
      { value: 'digipedagogik' },
      { value: 'informations- och kommunikationsteknik' },
      { value: 'digitalkompetens' },
      { value: 'digital lrmedel' },
    ],
    learningResourceType: [
      'text',
      'audio',
      'exercise',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'fortbildning' },
      { value: 'gymnasietutbildning' },
      { value: 'yrkesutbilfning' },
      { value: 'hgskol' },
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
      { value: 'lrare' },
      { value: 'expert' },
      { value: 'handledare' },
      { value: 'adminstratr' },
    ],
    educationalUse: [
      { value: 'professionell std' },
      { value: 'oberoende studie' },
    ],
    interactivityType: [
      { value: 'rdgivning' },
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
  // Digipedagogiikka 9
  {
    id: 25,
    specialId: 9,
    img: 'assets/img/9-digipedagogiikka.jpg',
    download: 'https://aoe.fi/files/fi-9-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-9-digipedagogiikka.m4a',
          originalFilename: 'A Podcast Opettajan tvt taidot.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-9b-digipedagogiikka.pdf',
          originalFilename: 'b Podcast Opettajan TVT-taidot - teksti.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-9c-digipedagogiikka.pdf',
          originalFilename: 'c Infotaulu Opettajan TVT-taidot.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-9d-digipedagogiikka.pdf',
          originalFilename: 'd Infotaulu Opiskelijan TVT-taidot.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Tieto- ja viestinttekniikan taidot',
    slug: 'tieto-ja-viestintatekniikan-taidot',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Leena', lastName: 'Vainio' },
    ],
    // tslint:disable-next-line
    description: 'Tieto- ja viestinttekniikan taidot kouluissa voidaan jakaa kolmeen pkategoriaan: yleiset digikansalaisen taidot, opetukseen liittyvt tietotekniset taidot ja opiskeluun liittyvt tietotekniset taidot. Teknisten taitojen lisksi on osattava valita oikeat vlineet ja tyskentelytavat, mitk tukevat oppimista ja opetusta.',
    keywords: [
      { value: 'TVT' },
      { value: 'tieto- ja viestinttekniikka' },
      { value: 'digitaaliset taidot' },
      { value: 'digipedagogiikka' },
    ],
    learningResourceType: [
      'text',
      'audio',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'tydennyskoulutus' },
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
      { value: 'tydennyskouluttautuja' },
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
      { value: 'ksikirjoitus' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
  },
  {
    id: 26,
    specialId: 9,
    img: 'assets/img/9-digipedagogiikka.jpg',
    download: 'https://aoe.fi/files/en-9-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/en-9-digipedagogiikka.m4a',
          originalFilename: 'A Podcast What ICT skills does a teacher need.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-9b-digipedagogiikka.pdf',
          originalFilename: 'b Podcast Teachers ICT skills text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-9c-digipedagogiikka.pdf',
          originalFilename: 'c Infograf The teachers information and communication technology skills.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-9d-digipedagogiikka.pdf',
          originalFilename: 'd Infograf Students information and communication technology skills.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Information and communication skills',
    slug: 'information-and-communication-skills',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Leena', lastName: 'Vainio' },
    ],
    // tslint:disable-next-line
    description: 'Information and communication technology skills in schools can be divided into three main categories: general skills of digital citizen, ICT skills needed in teaching and guiding, and ICT skills needed in studying. Teachers and students should know how to choose the best tools, applications and working methods which support studying, teaching and learning.',
    keywords: [
      { value: 'ICT' },
      { value: 'information and communications technology' },
      { value: 'digital pedagogy' },
      { value: 'digital skills' },
    ],
    learningResourceType: [
      'text',
      'audio',
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
    id: 27,
    specialId: 9,
    img: 'assets/img/9-digipedagogiikka.jpg',
    download: 'https://aoe.fi/files/sv-9-digipedagogiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-9-digipedagogiikka.m4a',
          originalFilename: 'A Podcast Hurdana IKT-fardigheter behover lararen.m4a',
          mimeType: 'audio/mp4',
          format: 'audio',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-9b-digipedagogiikka.pdf',
          originalFilename: 'b Podcast Hurdana IKT-frdigheter behver lraren text.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-9c-digipedagogiikka.pdf',
          originalFilename: 'c Infograf Lrarens IKT frdigheter.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-9d-digipedagogiikka.pdf',
          originalFilename: 'd Infograf Den studenrandes IKT frdigheter.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Informations- och kommunikations tekniska frdigheter',
    slug: 'informations-och-kommunikations-tekniska-fardigheter',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Leena', lastName: 'Vainio' },
    ],
    // tslint:disable-next-line
    description: 'Informations- och kommunikationsfrdigheter i skolor kan delas i tre huvudkategorier: de allmnna digimedborgarens frdigheterna , tekniska frdigheter som man behver i undervisningen och tekniska frdigheter som man behver i studier. Man behver ocks kunna vlja de rtta verktyg och arbetsmetoder, vilka stder lrandet och undervisningen.',
    keywords: [
      { value: 'ICT' },
      { value: 'pedagogik' },
      { value: 'digipedagogik' },
      { value: 'informations- och kommunikationsteknik' },
      { value: 'digitalkompetens' },
    ],
    learningResourceType: [
      'text',
      'audio',
    ],
    timeRequired: { value: '0 h' },
    educationalLevel: [
      { value: 'fortbildning' },
      { value: 'gymnasietutbildning' },
      { value: 'yrkesutbilfning' },
      { value: 'hgskol' },
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
      { value: 'lrare' },
      { value: 'expert' },
      { value: 'handledare' },
      { value: 'adminstratr' },
    ],
    educationalUse: [
      { value: 'professionell std' },
      { value: 'oberoende studie' },
    ],
    interactivityType: [
      { value: 'rdgivning' },
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
  // Python
  {
    id: 28,
    specialId: 10,
    img: 'assets/img/kurssi.png',
    download: 'https://aoe.fi/files/fi-python.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/iframes/fi-python/index.html',
          originalFilename: 'index.html',
          mimeType: 'text/html',
          format: 'html',
        }
      }
    ],
    name: 'Python from Scratch',
    slug: 'python-from-scratch',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Tero', lastName: 'Toivanen' },
    ],
    // tslint:disable-next-line
    description: 'Ohjelmoinnin oppimispaketti Python-ympristss',
    keywords: [
      { value: 'ohjelmointi' },
      { value: 'ohjelmointikielet' },
      { value: 'Python' },
      { value: 'opiskelu' },
      { value: 'itseopiskelu' },
      { value: 'perusopetus' },
    ],
    learningResourceType: [
      'course',
      'guide',
      'exercise',
      'video',
      'dataset',
    ],
    timeRequired: { value: '8 h' },
    educationalLevel: [
      { value: 'tydennyskoulutus' },
      { value: 'lukiokoulutus' },
      { value: 'ammatillinen koulutus' },
      { value: 'korkeakoulutus' },
      { value: 'peruskoulutus' },
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
      { value: 'oppilas' },
      { value: 'opettaja' },
    ],
    interactivityType: [
      { value: 'monimuotoinen' },
    ],
    inLanguage: {
      id: 'FI',
      value: 'suomi',
    },
    accessibilityFeatures: [
      { value: 'sisllysluettelo' },
      { value: 'navigointi rakenteen avulla' },
    ],
    accessibilityHazard: [
      { value: 'ei vlhtelyhaittaa' },
      { value: 'ei nihaittaa' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
  },
  {
    id: 29,
    specialId: 10,
    img: 'assets/img/kurssi.png',
    download: 'https://aoe.fi/files/en-python.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/iframes/en-python/index.html',
          originalFilename: 'index.html',
          mimeType: 'text/html',
          format: 'html',
        }
      }
    ],
    name: 'Python from Scratch',
    slug: 'python-from-scratch',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Tero', lastName: 'Toivanen' },
    ],
    // tslint:disable-next-line
    description: 'Learning material on programming with Python',
    keywords: [
      { value: 'programming' },
      { value: 'programming languages' },
      { value: 'Python' },
      { value: 'study' },
      { value: 'independent study' },
      { value: 'basic education' },
    ],
    learningResourceType: [
      'course',
      'guide',
      'exercise',
      'video',
      'dataset',
    ],
    timeRequired: { value: '8 h' },
    educationalLevel: [
      { value: 'Continuing Education' },
      { value: 'Self-motivated Competence Development' },
      { value: 'upper Secondary School' },
      { value: 'Vocational Education' },
      { value: 'Higher Education' },
      { value: 'Basic Education' },
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
      { value: 'student' },
    ],
    interactivityType: [
      { value: 'mixed' },
    ],
    inLanguage: {
      id: 'EN',
      value: 'English',
    },
    accessibilityFeatures: [
      { value: 'table of contents' },
      { value: 'structural navigation' },
    ],
    accessibilityHazard: [
      { value: 'no flashing hazard' },
      { value: 'no sound hazard' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.en',
    },
  },
  {
    id: 30,
    specialId: 10,
    img: 'assets/img/kurssi.png',
    download: 'https://aoe.fi/files/sv-python.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/iframes/sv-python/index.html',
          originalFilename: 'index.html',
          mimeType: 'text/html',
          format: 'html',
        }
      }
    ],
    name: 'Python from Scratch',
    slug: 'python-from-scratch',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Tero', lastName: 'Toivanen' },
    ],
    // tslint:disable-next-line
    description: 'Lrmaterial om programmering med Python',
    keywords: [
      { value: 'programmering' },
      { value: 'programmeringssprk' },
      { value: 'Python' },
      { value: 'studera' },
      { value: 'sjlvstudier' },
    ],
    learningResourceType: [
      'course',
      'guide',
      'exercise',
      'video',
      'dataset',
    ],
    timeRequired: { value: '8 h' },
    educationalLevel: [
      { value: 'Fortbildning' },
      { value: 'Gymnasietutbildning' },
      { value: 'Yrkesutbilfning' },
      { value: 'Hgskol' },
      { value: 'Grundlggande utbildning' },
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
      { value: 'lrare' },
      { value: 'elev' },
    ],
    interactivityType: [
      { value: 'blandad' },
    ],
    inLanguage: {
      id: 'SV',
      value: 'svenska',
    },
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.sv',
    },
  },
  // Scratch
  {
    id: 31,
    specialId: 11,
    img: 'assets/img/kurssi.png',
    download: 'https://aoe.fi/files/fi-scratch.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/iframes/fi-scratch/index.html',
          originalFilename: 'index.html',
          mimeType: 'text/html',
          format: 'html',
        }
      }
    ],
    name: 'Scratch to Python',
    slug: 'scratch-to-python',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Tero', lastName: 'Toivanen' },
    ],
    // tslint:disable-next-line
    description: 'Ohjelmoinnin oppimispaketti Python-ympristss',
    keywords: [
      { value: 'ohjelmointi' },
      { value: 'ohjelmointikielet' },
      { value: 'Scratch' },
      { value: 'opiskelu' },
      { value: 'itseopiskelu' },
    ],
    learningResourceType: [
      'course',
      'guide',
      'exercise',
      'video',
      'dataset',
    ],
    timeRequired: { value: '8 h' },
    educationalLevel: [
      { value: 'tydennyskoulutus' },
      { value: 'lukiokoulutus' },
      { value: 'ammatillinen koulutus' },
      { value: 'korkeakoulutus' },
      { value: 'peruskoulutus' },
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
      { value: 'oppilas' },
      { value: 'opettaja' },
    ],
    interactivityType: [
      { value: 'monimuotoinen' },
    ],
    inLanguage: {
      id: 'FI',
      value: 'suomi',
    },
    accessibilityFeatures: [
      { value: 'sisllysluettelo' },
      { value: 'navigointi rakenteen avulla' },
    ],
    accessibilityHazard: [
      { value: 'ei vlhtelyhaittaa' },
      { value: 'ei nihaittaa' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
  },
  {
    id: 32,
    specialId: 11,
    img: 'assets/img/kurssi.png',
    download: 'https://aoe.fi/files/en-scratch.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/iframes/en-scratch/index.html',
          originalFilename: 'index.html',
          mimeType: 'text/html',
          format: 'html',
        }
      }
    ],
    name: 'Scratch to Python',
    slug: 'scratch-to-python',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Tero', lastName: 'Toivanen' },
    ],
    // tslint:disable-next-line
    description: 'Learning material on programming with Scratch',
    keywords: [
      { value: 'programming' },
      { value: 'programming languages' },
      { value: 'Scratch' },
      { value: 'study' },
      { value: 'independent study' },
      { value: 'basic education' },
    ],
    learningResourceType: [
      'course',
      'guide',
      'exercise',
      'video',
      'dataset',
    ],
    timeRequired: { value: '8 h' },
    educationalLevel: [
      { value: 'Continuing Education' },
      { value: 'Self-motivated Competence Development' },
      { value: 'upper Secondary School' },
      { value: 'Vocational Education' },
      { value: 'Higher Education' },
      { value: 'Basic Education' },
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
      { value: 'student' },
    ],
    interactivityType: [
      { value: 'mixed' },
    ],
    inLanguage: {
      id: 'EN',
      value: 'English',
    },
    accessibilityFeatures: [
      { value: 'table of contents' },
      { value: 'structural navigation' },
    ],
    accessibilityHazard: [
      { value: 'no flashing hazard' },
      { value: 'no sound hazard' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.en',
    },
  },
  {
    id: 33,
    specialId: 11,
    img: 'assets/img/kurssi.png',
    download: 'https://aoe.fi/files/sv-scratch.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/iframes/sv-scratch/index.html',
          originalFilename: 'index.html',
          mimeType: 'text/html',
          format: 'html',
        }
      }
    ],
    name: 'Scratch to Python',
    slug: 'scratch-to-python',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Tero', lastName: 'Toivanen' },
    ],
    // tslint:disable-next-line
    description: 'Lrmaterial om programmering med Scratch',
    keywords: [
      { value: 'programmering' },
      { value: 'programmeringssprk' },
      { value: 'Scratch' },
      { value: 'studera' },
      { value: 'sjlvstudier' },
    ],
    learningResourceType: [
      'course',
      'guide',
      'exercise',
      'video',
      'dataset',
    ],
    timeRequired: { value: '8 h' },
    educationalLevel: [
      { value: 'Fortbildning' },
      { value: 'Gymnasietutbildning' },
      { value: 'Yrkesutbilfning' },
      { value: 'Hgskol' },
      { value: 'Grundlggande utbildning' },
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
      { value: 'lrare' },
      { value: 'elev' },
    ],
    interactivityType: [
      { value: 'blandad' },
    ],
    inLanguage: {
      id: 'SV',
      value: 'svenska',
    },
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.sv',
    },
  },
  // Robotics
  {
    id: 34,
    specialId: 12,
    img: 'assets/img/robotiikka.jpg',
    download: 'https://aoe.fi/files/fi-robotiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-0-robotiikka.pdf',
          originalFilename: '0. Sisllys.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-1-robotiikka.pdf',
          originalFilename: '1. Yleiskatsaus automaatioon ja robotiikkaan.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-2-robotiikka.pdf',
          originalFilename: '2. Robotiikka yhteiskunnassa.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-3-robotiikka.pdf',
          originalFilename: '3.1 Opetukseen ja opiskeluun soveltuvat laitteet.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-4-robotiikka.pdf',
          originalFilename: '3.2 Robotiikan oppimista tukeva opetus.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-5-robotiikka.pdf',
          originalFilename: '4. Harjoituksia - Pelit ja simulaatiot - etusivu.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-6-robotiikka.pdf',
          originalFilename: '4.1 EV3_n ohjelmointi simulaattorissa.pptx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-7-robotiikka.pdf',
          originalFilename: '4.2 Micro_bitin ohjelmointi MakeCode_ssa.pptx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-8-robotiikka.pdf',
          originalFilename: '4.3. Robotiikka-aiheisia pelej.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-9-robotiikka.png',
          originalFilename: 'Liite 1 - Robotiikan oppimisen polku.png',
          mimeType: 'image/png',
          format: 'image',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-10-robotiikka.pdf',
          originalFilename: 'Liite 2_ Micro_bit KPS.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Johdatus robotiikan opetukseen',
    slug: 'johdatus-robotiikan-opetukseen',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Suomen', lastName: 'Koodikoulu' },
    ],
    // tslint:disable-next-line
    description: 'Oppimateriaalissa esitelln robotiikan ja automaation ksitteist, ksitelln t arjen ja teollisuuden robotiikkaa nyt ja tulevaisuudessa',
    keywords: [
      { value: 'robotiikka' },
      { value: 'automaatio' },
      { value: 'sulautetut jrjestelmt' },
      { value: 'ohjelmointi' },
      { value: 'oppiminen' },
      { value: 'opetus' },
    ],
    learningResourceType: [
      'text',
      'exercise',
      'simulation',
      'project',
    ],
    timeRequired: { value: '54 h' },
    educationalLevel: [
      { value: 'tydennyskoulutus' },
      { value: 'lukiokoulutus' },
      { value: 'ammatillinen koulutus' },
      { value: 'korkeakoulutus' },
    ],
    typicalAgeRange: '18-',
    educationalRole: [
      { value: 'opettaja' },
      { value: 'tydennyskouluttaja' },
    ],
    interactivityType: [
      { value: 'monimuotoinen' },
    ],
    inLanguage: {
      id: 'FI',
      value: 'suomi',
    },
    accessibilityFeatures: [
      { value: 'sisllysluettelo' },
      { value: 'yhteninen sivunumerointi' },
      { value: 'kuvaus visuaalisesta sisllst' },
    ],
    accessibilityHazard: [
      { value: 'ei vlhtelyhaittaa' },
      { value: 'ei nihaittaa' },
      { value: 'ei liikkeensimulointihaittaa' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
  },
  {
    id: 35,
    specialId: 12,
    img: 'assets/img/robotiikka.jpg',
    download: 'https://aoe.fi/files/en-robotiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/en-1-robotiikka.pdf',
          originalFilename: '1. Overview of automation and robotics.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-2-robotiikka.pdf',
          originalFilename: '2. Robotics and the society.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-3-robotiikka.pdf',
          originalFilename: '3.1 Devices and programming environments suited for educational use.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-4-robotiikka.pdf',
          originalFilename: '3.2 Teaching as support for learning robotics.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-5-robotiikka.pdf',
          originalFilename: '4. Robotics exercises without robotics devices, front page.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-6-robotiikka.pdf',
          originalFilename: '4.1 EV3 programming in a simulator.pptx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-7-robotiikka.pdf',
          originalFilename: '4.2 Micro_bit programming in MakeCode.pptx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-8-robotiikka.pdf',
          originalFilename: '4.3. Robotics games.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-9-robotiikka.jpg',
          originalFilename: 'Appendix 1 Robotics learning pathway.jpg',
          mimeType: 'image/jpeg',
          format: 'image',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/en-10-robotiikka.pdf',
          originalFilename: 'Appendix 2 Micro_bit Rock Paper Scissors.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Introduction to teaching robotics',
    slug: 'introduction-to-teaching-robotics',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Suomen', lastName: 'Koodikoulu' },
    ],
    // tslint:disable-next-line
    description: 'This learning material provides an introduction to the essential terms and concepts of robotics and automation, and covers the role of robotics in manufacturing and our everyday life both now and in the future',
    keywords: [
      { value: 'robotics' },
      { value: 'automation' },
      { value: 'programming' },
      { value: 'learning' },
      { value: 'teaching' },
    ],
    learningResourceType: [
      'text',
      'exercise',
      'simulation',
      'project',
    ],
    timeRequired: { value: '54 h' },
    educationalLevel: [
      { value: 'Continuing Education' },
      { value: 'upper Secondary School' },
      { value: 'Vocational Education' },
      { value: 'Higher Education' },
    ],
    typicalAgeRange: '18-',
    educationalRole: [
      { value: 'teacher' },
      { value: 'professional' },
    ],
    interactivityType: [
      { value: 'mixed' },
    ],
    inLanguage: {
      id: 'EN',
      value: 'English',
    },
    accessibilityFeatures: [
      { value: 'Table of Contents' },
      { value: 'Print Page Numbers' },
      { value: 'Long Description' },
    ],
    accessibilityHazard: [
      { value: 'No Flashing Hazard' },
      { value: 'No Motion Simulation Hazard' },
      { value: 'No Sound Hazard' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.en',
    },
  },
  {
    id: 36,
    specialId: 12,
    img: 'assets/img/robotiikka.jpg',
    download: 'https://aoe.fi/files/sv-robotiikka.zip',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-0-robotiikka.pdf',
          originalFilename: '0. Sisllys.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-1-robotiikka.pdf',
          originalFilename: '1. Yleiskatsaus automaatioon ja robotiikkaan.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-2-robotiikka.pdf',
          originalFilename: '2. Robotiikka yhteiskunnassa.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-3-robotiikka.pdf',
          originalFilename: '3.1 Opetukseen ja opiskeluun soveltuvat laitteet.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-4-robotiikka.pdf',
          originalFilename: '3.2 Robotiikan oppimista tukeva opetus.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-5-robotiikka.pdf',
          originalFilename: '4. Harjoituksia - Pelit ja simulaatiot - etusivu.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-6-robotiikka.pdf',
          originalFilename: '4.1 EV3_n ohjelmointi simulaattorissa.pptx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-7-robotiikka.pdf',
          originalFilename: '4.2 Micro_bitin ohjelmointi MakeCode_ssa.pptx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-8-robotiikka.pdf',
          originalFilename: '4.3. Robotiikka-aiheisia pelej.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-9-robotiikka.pdf',
          originalFilename: 'Liite 1 - Robotiikan oppimisen polku.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-10-robotiikka.pdf',
          originalFilename: 'Liite 2_ Micro_bit KPS.docx',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Introduktion till undervisningen i robotik',
    slug: 'introduktion-till-undervisningen-i-robotik',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Suomen', lastName: 'Koodikoulu' },
    ],
    // tslint:disable-next-line
    description: 'I studiematerialet presenteras begrepp inom robotik och automation och behandlas robotiken vardagen och i industrin nu och i framtiden.',
    keywords: [
      { value: 'Robotteknik' },
      { value: 'automation' },
      { value: 'programmering' },
      { value: 'inlring' },
      { value: 'undervisning' },
    ],
    learningResourceType: [
      'text',
      'exercise',
      'simulation',
      'project',
    ],
    timeRequired: { value: '54 h' },
    educationalLevel: [
      { value: 'Fortbildning' },
      { value: 'Gymnasietutbildning' },
      { value: 'Yrkesutbilfning' },
      { value: 'Hgskol' },
    ],
    typicalAgeRange: '18-',
    educationalRole: [
      { value: 'lrare' },
      { value: 'expert' },
    ],
    interactivityType: [
      { value: 'blandad' },
    ],
    inLanguage: {
      id: 'SV',
      value: 'svenska',
    },
    accessibilityFeatures: [
      { value: 'Table of Contents' },
      { value: 'Print Page Numbers' },
      { value: 'Long Description' },
    ],
    accessibilityHazard: [
      { value: 'No Flashing Hazard' },
      { value: 'No Motion Simulation Hazard' },
      { value: 'No Sound Hazard' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.sv',
    },
  },
  // AI
  {
    id: 37,
    specialId: 13,
    img: 'assets/img/tekoaly.jpg',
    download: 'https://aoe.fi/files/fi-tekoaly.pdf',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/fi-tekoaly.pdf',
          originalFilename: 'fi-tekoaly.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        },
      },
    ],
    name: 'Johdatus tekolyyn',
    slug: 'johdatus-tekoalyyn',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Suomen', lastName: 'Koodikoulu' },
    ],
    // tslint:disable-next-line
    description: 'Oppimateriaalissa tutustuaan aluksi tekolytutkimuksen ja siihen liittyvien lhitieteiden historiaan. Tmn jlkeen aloitetaan tekolyn tarkempi tutkiminen miettimll tutumpaa lykkyyden lajia eli ihmisen lykkyytt. Mit on ihmisen lykkyys ja miten sit pitisi kuvata, jotta sit voisi jljitell eli mallintaa koneellisesti? Samalla verrataan ihmis- ja tekoly ja ksitelln niiden vlist vuorovaikutusta. Seuraavaksi tutustutaan tietokoneiden toimintaan ja siihen, miten mallintaminen tapahtuu koneellisesti. Koneoppimista ksittelevst kappaleesta selvi, ett kaikkia malleja ei tarvitse antaa tietokoneelle valmiina, vaan kone voi muodostaa mys itse omia mallejaan. Toisin sanoen tietokoneet voivat oppia uutta. Koneoppimista ksittelev kappale on keskeinen, koska tietokoneiden kyky oppia on yksi trkeimpi kehitysaskeleita tekolyn suhteen. Koneoppiminen tarvitsee opetusmateriaalia samaan tapaan kuin opiskelija tarvitsee oppikirjoja. Koneoppimisen tarpeisiin tt materiaalia lytyy tietokannoista ja tmn vuoksi niit ksitelln omassa kappaleessaan. Tmn jlkeen tutustutaan erilaisiin tekolyn osa-alueisiin ja sovelluskohteisiin konenk, kielen ksittely ja robotiikkaa ksitteleviss kappaleissa. Robotiikkaan tutustumisen yhteydess mietitn lyhyesti mys tekolyyn liittyvi eettisi kysymyksi.',
    keywords: [
      { value: 'Tekoly' },
      { value: 'koneoppiminen' },
      { value: 'neuroverkot' },
      { value: 'logiikka' },
      { value: 'kognitiotiede' },
      { value: 'kieliteknologia' },
      { value: 'robotiikka' },
      { value: 'tekolyn filosofia' },
      { value: 'konenk' },
      { value: 'luonnollisen kielen ksittely' },
    ],
    learningResourceType: [
      'text',
      'exercise',
      'glossary',
    ],
    timeRequired: { value: '27 h' },
    educationalLevel: [
      { value: 'tydennyskoulutus' },
      { value: 'lukiokoulutus' },
      { value: 'ammatillinen koulutus' },
      { value: 'korkeakoulutus' },
    ],
    typicalAgeRange: '18-',
    educationalRole: [
      { value: 'opettaja' },
      { value: 'tydennyskouluttaja' },
    ],
    interactivityType: [
      { value: 'monimuotoinen' },
    ],
    inLanguage: {
      id: 'FI',
      value: 'suomi',
    },
    accessibilityFeatures: [
      { value: 'sisllysluettelo' },
      { value: 'yhteninen sivunumerointi' },
      { value: 'kuvaus visuaalisesta sisllst' },
    ],
    accessibilityHazard: [
      { value: 'ei vlhtelyhaittaa' },
      { value: 'ei nihaittaa' },
      { value: 'ei liikkeensimulointihaittaa' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fi',
    },
  },
  {
    id: 38,
    specialId: 13,
    img: 'assets/img/tekoaly.jpg',
    download: 'https://aoe.fi/files/en-tekoaly.pdf',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/en-tekoaly.pdf',
          originalFilename: 'en-tekoaly.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        }
      },
    ],
    name: 'Introduction to artificial intelligence',
    slug: 'introduction-to-artificial-intelligence',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Suomen', lastName: 'Koodikoulu' },
    ],
    // tslint:disable-next-line
    description: 'This learning material begins with an overview of the history of AI research and other closely related fields. After that, we dig deeper into a form of intelligence were already more familiar with  the human intelligence. What is it, and how should we portray it in order to simulate it in machines? In this context, we also compare artificial and human intelligences, and talk about their interaction. Next, we take a closer look into the way computers operate, and what it takes to simulate intelligence in machines. The chapter on machine learning will provide more information on how all models dont have to be given to computers, as they are able to form their own models as well. In other words, computers can learn new things. This chapter is essential for understanding AI, as machine learning is one of the most important milestones AI has reached. Machine learning requires learning material just like learners need their textbooks. Suitable material for machines can be found in databases, and therefore they are covered in their own chapter. After that, we introduce different aspects and applications of artificial intelligence in chapters dedicated to machine vision, natural language processing and robotics. In the robotics context, we also discuss the ethical issues concerning artificial intelligence.',
    keywords: [
      { value: 'philosophy' },
      { value: 'machine learning' },
      { value: 'neural network' },
      { value: 'logic' },
      { value: 'cognitive science' },
      { value: 'language technology' },
      { value: 'robotics' },
      { value: 'computer vision' },
    ],
    learningResourceType: [
      'text',
      'exercise',
      'glossary',
    ],
    timeRequired: { value: '27 h' },
    educationalLevel: [
      { value: 'Continuing Education' },
      { value: 'upper Secondary School' },
      { value: 'Vocational Education' },
      { value: 'Higher Education' },
    ],
    typicalAgeRange: '18-',
    educationalRole: [
      { value: 'teacher' },
      { value: 'professional' },
    ],
    interactivityType: [
      { value: 'mixed' },
    ],
    inLanguage: {
      id: 'EN',
      value: 'English',
    },
    accessibilityFeatures: [
      { value: 'Table of Contents' },
      { value: 'Print Page Numbers' },
      { value: 'Long Description' },
    ],
    accessibilityHazard: [
      { value: 'No Flashing Hazard' },
      { value: 'No Motion Simulation Hazard' },
      { value: 'No Sound Hazard' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.en',
    },
  },
  {
    id: 39,
    specialId: 13,
    img: 'assets/img/tekoaly.jpg',
    download: 'https://aoe.fi/files/sv-tekoaly.pdf',
    materials: [
      {
        file: {
          filePath: 'https://aoe.fi/files/sv-tekoaly.pdf',
          originalFilename: 'sv-tekoaly.pdf',
          mimeType: 'application/pdf',
          format: 'pdf',
        }
      },
    ],
    name: 'Introduktion till artificiell intelligens',
    slug: 'introduktion-till-artificiell-intelligens',
    dateCreated: new Date(),
    datePublished: new Date(2019, 3, 1),
    author: [
      { firstName: 'Suomen', lastName: 'Koodikoulu' },
    ],
    // tslint:disable-next-line
    description: 'I studiematerialet ges en historisk versikt ver forskningen i artificiell intelligens och nrliggande vetenskapsomrden. Drefter inleds mera ingende studier i artificiell intelligens genom att betrakta en mera vlbekant form av intelligens, nmligen den mnskliga. Vad r den mnskliga intelligensen och hur ska den beskrivas fr att den ska kunna imiteras med en maskin? Samtidigt jmfrs mnsklig och artificiell intelligens, och interaktionen mellan dem behandlas. Sedan bekantar vi oss med hur datorer fungerar och tar en titt p hur en modell av intelligensen stts upp med hjlp av en maskin. Av avsnittet om maskininlrning framgr det att alla modeller inte behver vara frdiga nr de matas in i datorn, utan datorn kan ocks skapa egna modeller. Med andra ord kan datorer lra sig nya saker. Avsnittet om maskininlrning r centralt, eftersom datorers frmga att lra sig r ett av de viktigaste stegen i utvecklingen av artificiell intelligens. Fr maskininlrning behvs lromaterial p samma stt som en studerande behver lrobcker. Sdant material fr maskininlrning finns i databaser, och drfr behandlas dessa i ett eget kapitel. Drefter bekantar vi oss med olika delomrden inom artificiell intelligens och deras tillmpningar i avsnitt som behandlar maskinseende, sprkhantering och robotik. I anslutning till robotiken funderar vi ven ett slag p etiska frgor som sammanhnger med artificiell intelligens.',
    keywords: [
      { value: 'filosofi' },
      { value: 'maskininlrning' },
      { value: 'neuronnt' },
      { value: 'logik' },
      { value: 'kognitionsvetenskap' },
      { value: 'sprkteknologi' },
      { value: 'robotteknik' },
      { value: 'optisk lsning' },
    ],
    learningResourceType: [
      'text',
      'exercise',
      'glossary',
    ],
    timeRequired: { value: '27 h' },
    educationalLevel: [
      { value: 'Fortbildning' },
      { value: 'Gymnasietutbildning' },
      { value: 'Yrkesutbilfning' },
      { value: 'Hgskol' },
    ],
    typicalAgeRange: '18-',
    educationalRole: [
      { value: 'lrare' },
      { value: 'expert' },
    ],
    interactivityType: [
      { value: 'blandad' },
    ],
    inLanguage: {
      id: 'SV',
      value: 'svenska',
    },
    accessibilityFeatures: [
      { value: 'Table of Contents' },
      { value: 'Print Page Numbers' },
      { value: 'Long Description' },
    ],
    accessibilityHazard: [
      { value: 'No Flashing Hazard' },
      { value: 'No Motion Simulation Hazard' },
      { value: 'No Sound Hazard' },
    ],
    licenseInformation: {
      licenseType: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.sv',
    },
  },
];
