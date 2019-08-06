import { Faq } from '../../models/faq';

// tslint:disable:max-line-length

/**
 * Frequently Asked Questions mock
 */
export const FAQGeneral: Faq[] = [
  {
    id: 1,
    question: 'Mikä on avointen oppimateriaalien palvelu? Miksi ja mihin tarpeeseen avointen oppimateriaalien palvelua kehitetään?',
    answer: [
      'Avointen oppimateriaalien palvelu on opetus- ja kulttuuriministeriön ja Opetushallituksen palvelu, joka kokoaa avoimia oppimateriaaleja yhteen kaikkien koulutusasteiden yhteiseen näkymään. Palvelusta voi etsiä ja käyttää avoimia oppimateriaaleja ja sinne voi tallentaa omia avoimia oppimateriaaleja ja niiden tietoja.',
      'Avointen oppimateriaalien palvelu pyrkii edistämään avointen oppimateriaalien käyttöä mahdollistaen eri hankkeissa tuotetuille ja yksittäisten ihmisten tuottamille materiaaleille pitkäikäisyyttä sekä näkyvyyttä. Tallentamalla oppimateriaalin palveluun ei tarvitse huolehtia siitä kuka vastaa että oppimateriaalia voi käyttää vielä pitkään hankkeen päättyymisen jälkeenkin niin omassa oppilaitoksessa kuin myös muissa oppilaitoksissa ja niiden ulkopuolella.',
    ]
  },
  {
    id: 2,
    question: 'Mitä ovat avoimet oppimateriaalit?',
    answer: [
      'Avoimet oppimateriaalit (OER) ovat eri muotoisia digitaalisia tai muita opetukseen, kasvatukseen tai oppimiseen kohdennettuja materiaaleja, jotka on vapautettu public domainiin tai jotka on lisensoitu avoimella lisenssillä, joka antaa muille oikeuden maksuttomaan pääsyyn, käyttöön, muokkaukseen ja uudelleen jakamiseen olemattomin tai vähin rajoituksin.',
      'Avointen oppimateriaalien palvelussa yksi avoin oppimateriaali on pedagogisesti järkevä kokonaisuus, joka on lisensoitu käyttäen Creative Commons -lisenssiä.',
    ]
  },
  {
    id: 3,
    question: 'Kenelle avointen oppimateriaalien palvelu on tarkoitettu?',
    answer: [
      'Avointen oppimateriaalien palvelu on suunnattu kaikille koulutusasteille ja jatkuvaan oppimiseen. Se palvelee niin opettajia, oppijoita kuin oppimisen tukijoita näiden etsiessä avoimia oppimateriaaleja oman opetuksen ja osaamisenkehittämisen tarpeisiin.',
    ]
  },
  {
    id: 4,
    question: 'Vaatiiko palvelu tunnistautumista?',
    answer: [
      'Oppimateriaalien käyttäminen ja niiden hakeminen on kaikille mahdollista ilman sisäänkirjautumista.',
      'Oppimateriaalien tallentaminen ja kommenttien jättäminen vaatii kirjautumisen. Tämä on mahdollista MPASSid:llä ja Hakalla sekä Suomi.fi-tunnistautumisella.',
    ]
  },
  {
    id: 5,
    question: 'Mitä avointen oppimateriaalien palveluun tallennettavalta oppimateriaalilta vaaditaan?',
    answer: [
      'Avointen oppimateriaalien palveluun lisättävä oppimateriaali on oltava avoimesti lisensoitu. Palvelussa käytetään Creative Commons -lisenssejä, joista lisätietoa täältä: https://creativecommons.org/choose/?lang=fi sekä tässä FAQ:ssa. Lisenssi merkitään oppimateriaalin yhteyteen sen kuvailutietoihin, mutta on suositeltavaa merkitä se myös oppimateriaalin sisälle.',
      'Jokaiseen lisättävään oppimateriaaliin on myös täydennettävä kuvailutietoa, jotka helpottavat oppimateriaalien löytämistä ja arviointia. Kuvailutiedot kertovat mm. kuka oppimateriaalin on tehnyt ja miten se on suhteessa opetussuunnitelmiin. On myös hyvä huomioida materiaalin saavutettavuus. Lisätietoja: www.saavutettavasti.fi',
    ]
  },
  {
    id: 6,
    question: 'Mitä ovat Creative Commons -lisenssit?',
    answer: [
      'Creative Commons -lisenssit kertovat millaisia käyttöoikeuksia annat muille ihmisille: Voivatko he tehdä oman oppimateriaalin sinun materiaalisi pohjalta? Saavatko he käyttää oppimateriaalisi osaa omassa materiaalissaan? Saako materiaaliasi päivittää tai kääntää eri kielelle tai muuttaa pistekirjoitukseksi? Saako oppimateriaaliasi käyttää kaupallisessa koulutuksessa?',
      'Avointen oppimateriaalien palvelu suosittelee valitsemaan Creative Commons Nimeä 4.0 tai Creative Commons Nimeä-JaaSamoin -lisenssin. Kummatkin näistä takaavat että sinut mainitaan oppimateriaalin tekijänä ja että muut käyttäjät saavat vapaasti käyttää oppimateriaaliasi osana oppimis-, opetus- ja koulutustarpeitaan. Ne mahdollistavat myös sen että muut ihmiset voivat luoda omia muokkauksia oppimateriaalisi pohjalta, taaten näin sen että oppimateriaalisi voi jatkaa päivittymistä ja eloaan senkin jälkeen kun et itse enää ole kiinnostunut pitämään sitä ajan tasalla. Creative Commons Nimeä-JaaSamoin takaa myös sen että kaikki muokkaukset ja uudelleentyöstöt, jotka materiaalisi pohjalta tehdään, jaetaan samalla avoimella lisenssillä.',
      'Creative Commons EiMuutoksia -lisenssiehtoa ei suositella käytettäväksi avoimissa oppimateriaaleissa. Lisenssi estää oppimateriaalin kaikenlaisen päivittämisen ja johdannaismateriaalien tekemisen. Oppimateriaalia ei voi myöskään esimerkiksi kääntää tai muuttaa pistekirjoitukseksi. Pyydämme myös harkitsemaan Creative Commons EiKaupallinen -lisenssien käyttöä, sillä se estää materiaalin käytön esimerkiksi oppilaitosten järjestämissä maksullisissa kursseissa ja koulutuksissa. Lisätietoa https://creativecommons.fi/lisenssit/',
      'Mikäli oppimateriaalilla on useita tekijöitä tai omistajia, tulee avoimesta lisenssistä sopia kaikkien osapuolten kesken. Tämän voi tehdä esimerkiksi hyödyntämällä oheisia sopimuspohjia: https://www.opettajantekijanoikeus.fi/aineisto/sopimusmallit-avoimeen-sisallontuotantoon/',
      'Huomioithan myös, että mikäli käytät muiden tekijöiden kuvia tms materiaaleja osana oppimateriaaliasi, tulee näidenkin olla avoimesti lisensoituja tai sinulla oikeus käyttää niitä avoimesti lisensoidussa oppimateriaalissa. Tekijänoikeuksista ja avoimesta lisensoinnista on myös opettajille suunnattu oppimateriaali Tekijänoikeudet opetuksessa: https://aoe.fi/#/demo/materiaali/14/tekijanoikeudet-opetuksessa',
    ]
  },
  {
    id: 7,
    question: 'Miten avointen oppimateriaalien palvelua kehitetään?',
    answer: [
      'Avointen oppimateriaalien palvelun infosivu avattiin maaliskuussa 2019. Avointen oppimateriaalien ja niiden tietojen tallentaminen palveluun tehdään mahdolliseksi syyskuussa 2019. Seuraava etappi palvelulle on vuoden vaihteessa jolloin oppimateriaaleja voi etsiä ja käyttää palvelusta käsin. Vuonna 2020 palveluun lisätään ominaisuus kokoelmien tekoon ja kehitetään tekoälyavusteista kuvailua. Samalla parannetaan palvelua palautteen perusteella sekä kehitetään analytiikkaa oppimateriaalien tekijöiden avuksi. Vuonna 2020 avoimet oppimateriaalit tulevat käytettäväksi myös Finna.fi:n kautta. Palvelun jatkokehitystarpeita arvioidaan palautteen ja käytön perusteella jatkuvasti.',
    ]
  },
];
