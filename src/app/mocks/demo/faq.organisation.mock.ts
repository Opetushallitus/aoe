import { Faq } from '../../models/faq';

// tslint:disable:max-line-length

/**
 * Frequently Asked Questions mock
 */
export const FAQOrganisation: Faq[] = [
  {
    id: 1,
    question: 'Minulla tai organisaatiollani on useita kymmeniä avoimia oppimateriaaleja, miten saamme ne näkyviin avointen oppimateriaalien palveluun?',
    answer: [
      'Oppimateriaalien metatietoja voi tuoda isoina massoina avointen oppimateriaalien palveluun kahdella eri tavalla. Ensimmäinen tapa on harvestointi. Harvestointia varten organisaatiollanne pitää olla käytössä tai sitä varten on tehtävä oai pmh -provideri/rajapinta, jonka lisäksi palvelun metatietomallin on oltava yhteensopiva avointen oppimateriaalien palvelun metatietomallin kanssa. Autamme organsiaatioita metatietomallien yhteensovittamisessa, mutta pääsäntöisesti palvelusta on löydyttävä metatietomallissamme määritellyt pakolliset tiedot jossain muodossa. Metatietomallista lisätietoa täältä.',
      'Mikäli harvestointi ei ole mahdollista, on vaihtoehtona oppimateriaalien metatietojen tuonti excel-pohjalla. Exceliin täytetään tai kopioidaan oppimateriaalien tiedot niin että yhdellä rivillä on yhden oppimateriaalin tiedot. Jokaisesta oppimateriaalista on täydennettävä vähintään pakolliset metatiedot. Metatietomallista lisätietoa täältä. Excel säästää aikaa erityisesti tilanteissa joissa oppimateriaaleille on joitain yhteisiä nimittäjiä esimerkiksi suurin osa on kohdennettu samalle kohderyhmälle ja koulutusasteelle. Tällöin päällekkäiset tiedot voi kopioida jokaiselle riville eikä tietojen syöttämiseen kulu merkittävästi aikaa.',
      'Oppimateriaalit on mahdollista syöttää myös syöttökäyttöliittymän kautta. Tämä toimii erityisesti mikäli materiaaleja ei ole useaa kymmentä.',
      'Kaikkien avointen oppimateriaalien palveluun tallennettavien oppimateriaalien tulee olla avoimesti Creative Commons -lisenssillä lisensoituja.',
      'Mikäli sinä tai organisaatiosi olette kiinnostuneita näistä vaihtoehdoista, otattehan yhteyttä oppimateriaalivaranto@csc.fi niin voimme sopia harvestoinnin tai excel-yhteistyön toteuttamisesta.',
    ]
  },
  {
    id: 2,
    question: 'Millaisia oppimateriaaleja voi tuoda avointen oppimateriaalien palveluun?',
    answer: [
      'Avointen oppimateriaalien palvelu on tarkoitettu julkisin varoin tuotetuille avoimille oppimateriaaleille. Jotta oppimateriaalin tiedot voi tuoda palveluun on a) materiaalin oltava Creative Commons -lisenssillä lisensoitu, b) on sen oltava julkisin varoin tuotettu tai sen oltava saanut julkista rahoitusta, c) on tuojalla oltava oikeus siirtää materiaali, sen tiedot ja niihin liittyvät henkilötiedot avointen oppimateriaalien palveluun sekä d) organisaation on sitouduttava palvelun tietosuojaselosteeseen ja käyttöehtoihin. Mikäli sinä tai organisaatiosi olette kiinnostuneita, otattehan yhteyttä oppimateriaalivaranto@csc.fi niin voimme sopia yhteistyön toteuttamisesta.',
    ]
  },
  {
    id: 3,
    question: 'Millainen metatietomalli avointen oppimateriaalien palvelussa on?',
    answer: [
      'Avointen oppimateriaalien palvelu käyttää kansainvälisesti yhteensopivaa LRMI-pohjaista metatietomallia, joka on tarkoitettu oppimateriaalien laadukkaan löytämisen edistämiseen. Hankkeen aikana metatietomalli profiloitiin Suomen koulutuskentän tarpeisiin yhdessä sidosryhmien kanssa. Metatietomallia kehitetään edelleen ja sen viimeisin dokumentaatio löytyy täältä: https://wiki.eduuni.fi/x/_RxLBg Metatitietomalli ja sen hyödyntämät sanastot ovat avoimesti käytettäviä.',
    ]
  },
];
