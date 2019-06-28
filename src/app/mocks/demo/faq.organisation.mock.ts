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
];
