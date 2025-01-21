import { Accessibility } from './accessibility.mock';
/* eslint-disable max-len */
import { environment } from '../../environments/environment';

/**
 * Accessibility Policy mock
 */
export const AccessibilityPolicy = {
  fi: [
    {
      heading: '',
      content: [
        'Tämä saavutettavuusseloste koskee Avointen oppimateriaalien kirjastoa (aoe.fi), jäljempänä aoe.fi-palvelu. Aoe.fi-palvelun saavutettavuuden on arvioinut ulkopuolinen asiantuntijaorganisaatio (Avaava Oy) helmikuussa 2020.',
        'Aoe.fi-palvelua koskee <a href="https://www.saavutettavuusvaatimukset.fi/digipalvelulain-vaatimukset/" target="_blank" rel="noopener noreferrer">laki digitaalisten palvelujen tarjoamisesta</a>, jossa edellytetään, että julkisten verkkopalvelujen on oltava saavutettavia. Digipalvelulaki (306/2019) pohjautuu <a href="https://eur-lex.europa.eu/FI/legal-content/summary/accessibility-of-public-sector-websites-and-mobile-apps.html" target="_blank" rel="noopener noreferrer">EU:n saavutettavuusdirektiiviin 2016/2102</a>. Lain mukaan kaikilla tulee olla tasavertaiset mahdollisuudet käyttää digitaalisia palveluita. Tämän verkkosivuston tulee noudattaa WCAG 2.1 -kriteeristön AA-tasoa. Saavutettavuus on huomioita luotaessa sivuston navigaatiota, värimaailmaa ja toiminnallisuuksia.',
      ],
    },
    {
      heading: 'Aoe.fi-palvelun saavutettavuuden tila',
      content: ['Aoe.fi-palvelu täyttää lain edellyttämät vaatimukset.'],
    },
    {
      heading: 'Ei-saavutettava sisältö',
      content: [
        'Videoiden ja äänitiedostojen hallinnassa esiintyy ongelmia osalla selaimista joidenkin ruudunlukijoiden kanssa. Ongelma koskee videoissa Firefox- ja paikoin Chrome-selaimia ja äänitiedostoissa Chrome- ja Safari-selaimia. Videoita ja äänitiedostoja pystyy käyttämään ja ne pystyy pysäyttämään, mutta hallinnantyökalut, kuten eteen- ja taaksepäin kelaaminen, saattavat ajoin kadota. Käytämme videoiden ja äänitiedostojen toistamiseen selaimen omaa kykyä lukea tiedostoja. Kaikki palvelussa olevat video- ja äänitiedostot voi ladata omalle koneelle ja käyttää sitä kautta suosimillaan ääni- ja videotiedostojen soittimilla. Samoin tekstitiedostot voi ladata omalle koneelle ja lukea niitä valitsemillaan sovelluksilla. Osa materiaaleista voi olla saavutettavampia näin.',
      ],
    },
    {
      heading: 'Oppimateriaalien saavutettavuus',
      content: [
        `Aoe.fi-palveluun tallennettujen oppimateriaalien saavutettavuudesta vastaa oppimateriaalin laatija. Lisätietoja digipalvelulain saavutettavuusvaatimuksista ja soveltamisalasta eri toimijoille voit lukea Aluehallintoviraston ylläpitämältä <a href="https://www.saavutettavuusvaatimukset.fi/digipalvelulain-vaatimukset/" target="_blank" rel="noopener noreferrer">saavutettavuusvaatimukset.fi-verkkosivustolta</a>. Aoe.fi-palvelussa on mahdollista rajata hakua tietyillä saavutettavuusominaisuuksilla. Käyttäjä voi materiaalia tallennettaessa voi lisätä tiedon, millä tavoin saavutettavuus on materiaalissa huomioitu. Lisätietoa saavutettavuuden huomioimisesta aoe.fi-palveluun tallennettavissa materiaaleissa voit lukea <a href="${environment.frontendUrl}/#/saavutettavuus" target="_blank" rel="noopener noreferrer">aoe.fi-palvelun taulukosta</a>, johon on koottu esimerkkejä ja ohjeita.`,
      ],
    },
    {
      heading: 'Anna palautetta saavutettavuudesta',
      content: [
        'Huomasitko saavutettavuuspuutteen aoe.fi-palvelussa? Kerro se meille ja teemme parhaamme puutteen korjaamiseksi. Ota yhteyttä sähköpostilla osoitteeseen <a href="mailto:aoe@oph.fi">aoe@oph.fi</a>',
      ],
    },
    {
      heading: 'Valvontaviranomainen',
      content: [
        'Jos huomaat sivustolla saavutettavuusongelmia, anna ensin palautetta meille eli sivuston ylläpitäjälle osoitteeseen <a href="mailto:aoe@oph.fi">aoe@oph.fi</a>. Vastauksessa voi mennä 14 päivää. Jos et ole tyytyväinen saamaasi vastaukseen tai et saa vastausta lainkaan kahden viikon aikana, voit tehdä ilmoituksen Etelä-Suomen aluehallintovirastoon. Etelä-Suomen aluehallintoviraston saavutettavuusvaatimukset.fi-verkkosivustolla kerrotaan tarkasti, miten ilmoituksen voi tehdä ja miten asia käsitellään.',
      ],
    },
    {
      heading: 'Valvontaviranomaisen yhteystiedot',
      content: [
        'Etelä-Suomen aluehallintovirasto<br />Saavutettavuuden valvonnan yksikkö<br /><a href="https://www.saavutettavuusvaatimukset.fi/" target="_blank" rel="noopener noreferrer">www.saavutettavuusvaatimukset.fi</a><br /><a href="mailto:saavutettavuus@avi.fi">saavutettavuus@avi.fi</a><br />puhelinnumero vaihde 0295 016 000',
      ],
    },
  ],
  en: [
    {
      heading: '',
      content: [
        'This is the accessibility statement of the Library of Open Educational Resources (aoe.fi), hereinafter referred to as the aoe.fi service. The accessibility of the aoe.fi service was assessed by an external consultant (Avaava Oy) in February 2020.',
        'Aoe.fi service is regulated under <a href="https://www.webaccessibility.fi/requirements-of-the-act-on-the-provision-of-digital-services/">the Act on the Provision of Digital Services</a>, which is based on <a href="https://eur-lex.europa.eu/en/legal-content/summary/accessibility-of-public-sector-websites-and-mobile-apps.html" target="_blank" rel="noopener noreferrer">the EU Web Accessibility Directive</a>. According to the Act, all people must have equal access to digital services. This website must conform with the AA level of the WCAG 2.1 standard. Accessibility is a consideration when creating site navigation, colour palette and functionality.',
      ],
    },
    {
      heading: 'Accessibility status of the aoe.fi service',
      content: ['The aoe.fi service meets the legal requirements.'],
    },
    {
      heading: 'Non-accessible content',
      content: [
        "Video and audio file management problems occur on some browsers with some screen readers. This problem occurs with videos on Firefox and, in some instances, Chrome browsers, and with audio files on Chrome and Safari browsers. Videos and audio files can be played and stopped, but control functions such as forwarding and rewinding may occasionally be unavailable. We use the browser's own ability to read files to play video and audio files. All of the video and audio files in the service can be downloaded to the user’s own computer and played on their favorite audio and video file players. Likewise, text files can be downloaded and read by applications of their choice, thus making some materials more accessible.",
      ],
    },
    {
      heading: 'Accessibility of learning materials',
      content: [
        `The party responsible for the accessibility of an educational resource is the creator of the educational resource. More information about the accessibility requirements and scope of the Act on the Provision of Digital Services for different operators is available on <a href="https://www.webaccessibility.fi/requirements-of-the-act-on-the-provision-of-digital-services/" target="_blank" rel="noopener noreferrer">the webaccessibility.fi website</a> maintained by the Regional State Administrative Agency. The aoe.fi service offers the option of narrowing searches based on specific accessibility features. When uploading educational resources to the service, users can add information on how accessibility has been taken into account in the resource. For more information about how to take accessibility into account in the educational resources uploaded to the aoe.fi service, please see <a href="${environment.frontendUrl}/#/saavutettavuus" target="_blank" rel="noopener noreferrer"> this table in the aoe.fi service</a>, which includes examples and instructions.`,
      ],
    },
    {
      heading: 'Provide feedback on accessibility',
      content: [
        'If you notice accessibility problems on the site, please let us know of it and we will do our best to fix the issue. Please send us your feedback by sending email to <a href="mailto:aoe@oph.fi">aoe@oph.fi</a>',
      ],
    },
    {
      heading: 'Supervisory authority',
      content: [
        'If you notice accessibility deficiencies on the website, please contact the site administrator first by sending an email to <a href="mailto:aoe@oph.fi">aoe@oph.fi</a>. The response may take up to 14 days. If you are not satisfied with the response you received, or if you do not receive a response within two weeks, you can send your feedback to the Regional State Administrative Agency of Southern Finland. The website of the Regional State Administrative Agency for Southern Finland provides detailed information on how notifications are to be made and how the matter will be handled.',
      ],
    },
    {
      heading: 'Contact details of the supervisory authority',
      content: [
        'Regional State Administrative Agency for Southern Finland<br />Supervision Unit for Accessibility<br /><a href="https://www.webaccessibility.fi" target="_blank" rel="noopener noreferrer">www.webaccessibility.fi</a><br /><a href="mailto:saavutettavuus@avi.fi">saavutettavuus@avi.fi</a><br />Tel (switchboard) +358 (0)295 016 000',
      ],
    },
  ],
  sv: [
    {
      heading: '',
      content: [
        'Detta tillgänglighetsutlåtande gäller Biblioteket för öppna lärresurser (aoe.fi), nedan aoe.fi-tjänsten. Aoe.fi-tjänstens tillgänglighet har utvärderats av en utomstående konsult (Avaava Oy) i februari 2020.',
        'Aoe.fi-tjänsten ska följa <a href="https://www.tillganglighetskrav.fi/lagar-och-standarder/" target="_blank" rel="noopener noreferrer">lagen om tillhandahållande av digitala tjänster</a> som baserar sig på <a href="https://eur-lex.europa.eu/sv/legal-content/summary/accessibility-of-public-sector-websites-and-mobile-apps.html" target="_blank" rel="noopener noreferrer">EU:s tillgänglighetsdirektiv 2016/2102</a>. Enligt lagen ska alla ha möjligheter att använda digitala tjänster på lika villkor. Den här webbplatsen ska följa AA-nivån i WCAG 2.1-kriterierna. Tillgängligheten ska beaktas då webbplatsens navigation, färgvärld och funktioner skapas.',
      ],
    },
    {
      heading: 'Status hos tillgängligheten för aoe.fi-tjänsten',
      content: ['Aoe.fi-tjänsten uppfyller kraven i lagen.'],
    },
    {
      heading: 'Icke-tillgängligt material',
      content: [
        'I hanteringen av videor och ljudfiler förekommer problem med en del av webbläsarna och deras skärmläsare. Problemet gäller webbläsarna Firefox och delvis Chrome i fråga om videor och webbläsarna Chrome och Safari i fråga om ljudfiler. Videor och ljudfiler kan användas och de kan stoppas, men hanteringsverktygen såsom fram- och bakåtspolning kan tidvis försvinna. Vi använder webbläsarens egna förmåga att läsa filer för att spela upp videor och ljudfiler. Alla video- och ljudfiler i tjänsten kan laddas ner på den egna enheten och använda med önskad ljud- och videouppspelningsprogram. Även textfilerna kan laddas ner på enheten och läsas med önskat program. En del av materialet kan vara mer tillgängligt på det här sättet.',
      ],
    },
    {
      heading: 'Läromedlens tillgänglighet',
      content: [
        `Den som har utarbetat lärresursen ansvarar för dess tillgänglighet. Mer information om tillgänglighetskraven enligt lagen om digitala tjänster och lagens tillämpningsområde för olika aktörer finns på webbplatsen <a href="https://www.tillganglighetskrav.fi/lagar-och-standarder/" target="_blank" rel="noopener noreferrer">Tillgänglighetskrav</a>, som drivs av Regionförvaltningsverket. I aoe.fi-tjänsten kan man avgränsa sökningen med vissa tillgänglighetsegenskaper. När användaren lagrar material kan den lägga till information om hur tillgängligheten har beaktats i materialet. Mer information om hur tillgängligheten har beaktats i material som lagrats i aoe.fi-tjänsten finns i <a href="${environment.frontendUrl}/#/saavutettavuus" target="_blank" rel="noopener noreferrer">en tabell i aoe.fi-tjänsten</a>, som innehåller exempel och anvisningar.`,
      ],
    },
    {
      heading: 'Ge respons om tillgängligheten',
      content: [
        'Upptäckte du en tillgänglighetsbrist i vår digitala tjänst? Meddela bristen till oss via e-post på adressen <a href="mailto:aoe@oph.fi">aoe@oph.fi</a> så gör vi vårt bästa för att avhjälpa bristen.',
      ],
    },
    {
      heading: 'Tillsynsmyndigheten',
      content: [
        'Om du upptäcker problem och brister som berör tillgängligheten på webbplatsen ska du i första hand kontakta den som upprätthåller webbplatsen. Det kan ta upp till 14 dagar innan du får svar. Om du inte är nöjd med det svar du får eller om du inte får något svar alls inom två veckor kan du göra en anmälan till regionförvaltningsverket i Södra Finland. På webbplatsen för regionförvaltningsverket i Södra Finland berättas noggrant hur anmälan görs och hur ärendet behandlas.',
      ],
    },
    {
      heading: 'Tillsynsmyndighetens kontaktuppgifter',
      content: [
        'Regionförvaltningsverket i Södra Finland<br />Enheten för tillgänglighetstillsyn<br /><a href="https://www.tillganglighetskrav.fi/" target="_blank" rel="noopener noreferrer">www.tillganglighetskrav.fi</a><br /><a href="mailto:webbtillganglighet@rfv.fi">webbtillganglighet@rfv.fi</a><br />telefonnummer växeln 0295 016 000',
      ],
    },
  ],
};
