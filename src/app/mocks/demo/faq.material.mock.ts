import { Faq } from '../../models/faq';

// tslint:disable:max-line-length

/**
 * Frequently Asked Questions mock
 */
export const FAQMaterial: Faq[] = [
  {
    id: 1,
    question: 'Mitä minun pitää ottaa huomioon alkaessani tehdä oppimateriaalia? Asettaako oppimateriaalipalvelu vaatimuksia oppimateriaalin tekemisen suhteen?',
    answer: [
      'Avointen oppimateriaalien palvelun näkökulmasta huomioitavaa on vain se, että osaat ladata/tallentaa valitsemastasi työkalusta teoksesi tiedostona koneellesi ja että sinulla on oikeus lisensoida oppimateriaalisi avoimesti. Avoimesta lisenssistä lisätietoa tällä sivulla kohdassa Mitä ovat Creative Commons -lisenssit.',
      'Myös linkittäminen on mahdollista mikäli tallentaminen ei tule kyseeseen: varmista tällöin, että materiaali on avoimesti ilman sisäänkirjautumista ja muita rajoitteita saatavilla nyt ja myös oppimateriaalin tekemisen jälkeen sillä alustalla jonne se on tehty.',
      'Kannattaa tutustua myös Opetushallituksen e-oppimateriaalien laatukiriteereihin ja miettiä mitä digitaaliselta oppimateriaalilta itse kaipaa https://www.edu.fi/verkko_oppimateriaalit/e-oppimateriaalin_laatukriteerit Myös eAmk-hankkeen laatukriteerejä on hyödyllistä käyttää soveltuvilta osin: https://www.eamk.fi/fi/campusonline/laatukriteerit/ Saavutettavuuden huomiointiin on vinkkejä tällä sivulla omassa kysymyksessään.',
    ]
  },
  {
    id: 2,
    question: 'Mitä materiaaleja voin tallentaa palveluun?',
    answer: [
      'Voit tallentaa mitä tahansa avoimia CC-lisensoituja oppimateriaaleja ladattavaksi palvelusta.',
      'Materiaaleja pystyy myös käyttämään palvelusta käsin. Aivan kaikki tiedostot eivät ole käytettäviä palvelusta käsin, mutta pyrimme kattamaan yleisimmät oppimateriaalien formaatit. Näitä ovat esimerkiksi eri videoiden, podcastien ja muiden äänitallenteiden, erimuotoisten tekstien, grafiikan, tehtävien ja esitysten sekä erilaisten sivustototeutusten tekemiseen käytetyt formaatit, muun muassa avi, mp4, mp3, pdf, docx, doc, odt, rtf, txt, markdown, h5p, ppt, pptx, odp, opt, html.',
      'Eikö suosimasi formaatti ole listattuna tai materiaalisi on ajettava (exe)? Älä huoli, nämä ovat vain esimerkkejä. Voit ottaa halutessasi meihin yhteyttä ja varmistaa tuetaanko formattia. Kuulemme mieluusti minkälaisia erilaisia oppimateriaaleja tällä hetkellä tehdäänkään!',
    ]
  },
  {
    id: 3,
    question: 'Onko parempi tallentaa materiaali vai linkittää se?',
    answer: [
      'Tallennetut materiaalit säilyvät avointen oppimateiraalien palvelussa ilman että tarvitsee huolehtia niiden avoimena pitämisestä tai olemassa olosta hankkeen päättymisen jälkeen. Tallennetut oppimateriaalit pystyy myös lataamaan palvelusta, jolloin loppukäyttäjät voivat monipuolisemmin käyttää materiaaleja, viemällä niitä esim. oppimisalustaan joka hänellä on käytössään. Materiaalin tallentaminen sopii paremmin tilanteisiin, jossa materiaalin haluaa saattaa muiden käyttöön mahdollisimman vähällä ylläpitovaivalla.',
      'Linkitys on sopiva, jos materiaalin ylläpito on taattu. Se on soveltuvin muoto myös, jos oppimateriaali on tehty alustalle, josta sitä ei voida siirtää toisaalla (et voi siis esim. tallentaa materiaaliasi omalle koneellesi). Tällöin tulee huolehtia että materiaali on avoimesti ilman kirjautumista kenen tahansa saatavilla.',
    ]
  },
  {
    id: 4,
    question: 'Voinko tehdä materiaaleja oppimateriaalipalvelussa / miten voin tehdä materiaaleja?',
    answer: [
      'Avointen oppimateriaalien palvelussa ei itsessään voi tehdä materiaaleja, sinne voi vain tallentaa tai linkittää muualla tehtyjä materiaaleja.',
      'Oppimateriaalien tekemiseen on useita soveltuvia työkaluja ja työkalu kannattaa valita sen mukaan, mikä soveltuu materiaaliin pedagogisesti ja vastaa muuhun tarpeeseen (esim. osaaminen, resurssit). Esimerkiksi erilaiset toimisto-ohjelmat, videotallennusohjelmat ja sivueditorit tarjoavat erilaisia ratkaisuja. Oppimateriaaleihin on myös niiden tekemiseen erikoistuneita palveluita kuten matematiikan GeoGebra. Työkalua valitessa kannattaa huomioida että materiaali on käytettävissä myös muualta käsin eli että se on tallennettavissa omalle koneellesi ja jaettavissa muille. Tämä takaa sen että oppimateriaalisi on käytettävissä vaikka käyttämäsi alusta ei enää olisikaan olemassa.',
    ]
  },
  {
    id: 5,
    question: 'Tein X-alustalla materiaalin, miten saan sen ladattua alustalta jotta voin tallentaa sen avointen oppimateriaalien palveluun?',
    answer: [
      'Alustan on tuettava tiedostojen lataamista jotta tämä on mahdollista. Esimerkiksi erilaisissa ohjelmistoissa on yleensä tiedosto tai asetus –valikossa tallentamiselle ja pilvipalveluissa kopion lataamiselle oma painikkeensa. Tallennettuasi tiedoston tietokoneellesi, voit sen sieltä tallentaa avointen oppimateriaalien palveluun.',
      'Joitain case-esimerkkejä:',
      '- H5P vaatii että ylläpito on mahdollistanut latauksen. Latauspainike on yleensä h5p-tehtävän vasemmassa alalaidassa (Reuse tai Dowload). Mikäli et löydä lataus-painiketta, ota yhteys alustan ylläpitäjään. Lisätietoja: https://h5p.org/documentation/for-authors/import-and-export Ladattuasi tiedoston voit tallentaa ja käyttää sitä avointen oppimateriaalien palvelussa.',
      '- Google Classroom ja Classcraftissa luotuja luokkia (class) ei voi ladata sellaisenaan palvelusta. Sen sijaan sinne tallennetut materiaalit kuten dokumentit, taulukot ja esitykset (Docs, Sheets, Slides, lataamasi tiedostot) ovat ladattavissa file ja download as –valikon kautta. Class ja Classcraft -kurssit samoin kuin Google forms -tehtävät on mahdollista linkittää avoiten oppimateriaalein palveluun mikäli ne ovat kaikille avoimesti saatavilla.',
      '- Oppimisalustoille kuten moodle tai itslearning tehdyt kurssit voi tuoda usealla eri tavalla palveluun. Mikäli oppimisalusta sallii kurssitiedoston lataamisen, voi tämän tallentaa avointen oppimateriaalien palveluun, joskaan sitä ei voi käyttää vaan palvelusta voi vain ladata kurssitiedoston. Vaihtoehtona on tuoda oppimisalustaan tallennetut oppimateriaalit (esim. tehtävät, esitys ja ohjeistusmateriaalit) omina tiedostoinaan avointen oppimateriaalien palveluun. Tällöin kurssin oppimateriaaleja voi käyttää palvelusta käsin ja niiden käyttöönotto eri oppimisalustoissa on suoraviivaisempaa. Mikäli oppimisalustalla oleva kurssi on pitkäaikaisesti avoin ilman kirjautumista kaikille, voi kurssin myös linkittää avointen oppimateriaalien palveluun. Suositelluinta on siirtää kurssin oppimateriaalit omina tiedostoinaan. Avointen oppimateriaalien palvelussa yhdessä oppimateriaalissa voi olla usea tiedosto.',
      '- Blogger ja Wordpress –palvelusta sivut ovat varmuuskopioitavissa settings-valikon kautta xml-muodossa. Selvitämme tällä hetkellä xml-muuntamista, mutta emme nykyisellään tue sen näyttämistä. Wordpressille on myös saatavissa lisäosa sivun lataamiseksi html-muodossa. Html:n (ja siihen liittyvät tiedostot) voi tallentaa zip-tiedostona ja sitä voi käyttää sivuston tavoin avointen oppimateriaalien palvelusta. Sekä Blogger että Wordpress –sivut voi linkittää avointen oppimateriaalien palveluun mikäli ne ovat kaikille avoimesti saatavilla.',
      'Jos alusta ei tue lataamista/tallentamista, mutta se on oppimateriaalille muuten paras mahdollinen ratkaisu, on oppimateriaali mahdollista myös linkittää palveluun. Huolehdi tällöin että oppimateriaali on käytettävissä ilman sisäänkirjautumista tai muita rajoitteita.',
    ]
  },
  {
    id: 6,
    question: 'Miten voin huomioida oppimateriaalin saavutettavuuden?',
    answer: [
      'Saavutettavuuden huomiomalla pyritään tekemään oppimateriaalista mahdollisimman käytettävä kaikille. Ladatessasi oppimateriaalisi avointen oppimateriaalien palveluun, vastaat itse oppimateriaalisi saavutettavuuden toteutuksesta. Oppimateriaalin saavutettavuutta voi lisätä huomioimalla erilaiset käyttäjät oppimateriaalia tehdessä. Esimerkiksi tehdessäsi videomateriaalia, on hyvä tehdä materiaalille myös tekstitys, jotta nekin oppijat tai opettajat jotka eivät kuule, ymmärtävät videon sisällön. Avointen oppimateriaalien palvelu tukee tekstitysten lisäämistä myös omana txt-tiedostona, jolloin voit lisätä useamman erikielisen tekstityksen tai jättää tämän mahdollisuuden materiaalin käyttäjille.  Eri ohjelmilla ja eri muotoisille materiaaleille on olemassa omia apuohjelmia saavutettavuuden varmistamiseen, lisätietoa tästä esimerkiksi Esteetöntä opiskelua -sivulta: http://www.esok.fi/stivisuositus/suosituksen-sisalto',
      'Tehdessäsi oppimateriaalia, on hyvä huomioida nämä seikat:',
      '- Jäsennä teksti mm. käyttämällä otsikoita otsikkotyylein, sijoittamalla tärkeän asian alkuun ja tekemällä lyhyitä kappaleita sekä listoja',
      '- Tee video-, kaavio- ja kuvasisällölle tekstivastineet',
      '- Tarjoa sisältöä eri muodoissa: tekstin lisäksi esimerkiksi inforgraafein',
      'Lisätietoa esimerkiksi Kehitysvammaliiton Papunet-palvelun pikaoppaasta sisällöntuottajille: http://papunet.net/saavutettavuus/pikaopas-sisallontuottajille',
      'Avointen oppimateriaalien palvelussa voit myös lisätä kuvailuun tiedon siitä, miten oppimateriaalissa on huomioitu saavutettavuus. Tämä auttaa oppimateriaalien käyttäjiä löytämään itselle sopivia materiaaleja helpommin.',
    ]
  },
];
