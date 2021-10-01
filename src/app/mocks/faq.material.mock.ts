/* eslint-disable max-len */

import { environment } from '../../environments/environment';

/**
 * Frequently Asked Questions mock
 */
export const FAQMaterial = {
  fi: [
    {
      question: 'Mitä minun pitää ottaa huomioon alkaessani tehdä oppimateriaalia? Asettaako Avointen oppimateriaalien kirjasto vaatimuksia oppimateriaalin tekemisen suhteen?',
      answer: [
        'Avointen oppimateriaalien kirjaston näkökulmasta huomioitavaa on vain se, että osaat ladata/tallentaa valitsemastasi työkalusta teoksesi tiedostona koneellesi ja että sinulla on oikeus lisensoida oppimateriaalisi avoimesti. Hyväksytyistä tiedostomuodoista saat lisätietoa seuraavasta kysymyksestä. Avoimesta lisenssistä lisätietoa tällä sivulla kohdassa Mitä ovat Creative Commons -lisenssit.',
        'Myös linkittäminen on mahdollista mikäli tallentaminen ei tule kyseeseen: varmista tällöin, että materiaali on avoimesti ilman sisäänkirjautumista ja muita rajoitteita saatavilla nyt ja myös oppimateriaalin tekemisen jälkeen sillä alustalla jonne se on tehty.',
        `Kannattaa tutustua myös <a href="https://www.oph.fi/fi/julkaisut/e-oppimateriaalin-laatukriteerit" target="_blank" rel="noopener nofollow">Opetushallituksen e-oppimateriaalien laatukiriteereihin (linkki kriteereihin)</a> ja miettiä mitä digitaaliselta oppimateriaalilta itse kaipaa. Myös <a href="${environment.frontendUrl}/#/materiaali/120">eAmk-hankkeen laatukriteerejä (linkki kriteereihin aoe.fissä)</a> on hyödyllistä käyttää soveltuvilta osin. Saavutettavuuden huomiointiin on vinkkejä tällä sivulla omassa kysymyksessään.`,
      ]
    },
    {
      question: 'Mitä materiaaleja voin tallentaa palveluun?',
      answer: [
        'Voit tallentaa mitä tahansa avoimia CC-lisensoituja oppimateriaaleja ladattavaksi palvelusta.',
        'Materiaaleja pystyy myös käyttämään palvelusta käsin. Aivan kaikki tiedostot eivät ole käytettäviä palvelusta käsin, mutta pyrimme kattamaan yleisimmät oppimateriaalien formaatit. Näitä ovat esimerkiksi eri videoiden, podcastien ja muiden äänitallenteiden, erimuotoisten tekstien, grafiikan, tehtävien ja esitysten sekä erilaisten sivustototeutusten tekemiseen käytetyt formaatit, muun muassa avi, mp4, mp3, pdf, docx, doc, odt, rtf, txt, markdown, h5p, ppt, pptx, odp, opt, html.',
        'Eikö suosimasi formaatti ole listattuna tai materiaalisi on ajettava (exe)? Älä huoli, nämä ovat vain esimerkkejä. Voit ottaa halutessasi meihin yhteyttä ja varmistaa tuetaanko formattia. Kuulemme mieluusti minkälaisia erilaisia oppimateriaaleja tällä hetkellä tehdäänkään!',
      ]
    },
    {
      question: 'Onko parempi tallentaa materiaali vai linkittää se?',
      answer: [
        'Tallennetut materiaalit säilyvät Avointen oppimateriaalien kirjastossa ilman että tarvitsee huolehtia niiden avoimena pitämisestä tai olemassa olosta hankkeen päättymisen jälkeen. Tallennetut oppimateriaalit pystyy myös lataamaan palvelusta, jolloin loppukäyttäjät voivat monipuolisemmin käyttää materiaaleja, viemällä niitä esim. oppimisalustaan joka hänellä on käytössään. Materiaalin tallentaminen sopii paremmin tilanteisiin, jossa materiaalin haluaa saattaa muiden käyttöön mahdollisimman vähällä ylläpitovaivalla.',
        'Linkitys on sopiva, jos materiaalin ylläpito on taattu. Se on soveltuvin muoto myös, jos oppimateriaali on tehty alustalle, josta sitä ei voida siirtää toisaalla (et voi siis esim. tallentaa materiaaliasi omalle koneellesi). Tällöin tulee huolehtia että materiaali on avoimesti ilman kirjautumista kenen tahansa saatavilla.',
      ]
    },
    {
      question: 'Miten oppimateriaalin lisääminen tapahtuu?',
      answer: [
        'Lisääminen on yksinkertaista: kirjaudut sisään, lataat tiedoston ja vastaat muutamiin kysymyksiin jotta muut pystyvät helposti ja nopeasti selvittämään millainen ja kenelle tarkoitettu oppimateriaalisi on.',
        `Tarkemman ohjeistuksen löydät <a href="${environment.frontendUrl}/#/materiaali/606">käyttöohjeistamme</a>.`,
      ]
    },
    {
      question: 'Miten materiaalia voi muokata tallentamisen jälkeen?',
      answer: [
        'Kehitämme tällä hetkellä materiaalien muokkaukseen toiminnallisuutta, joka tulee käyttöön arviolta maaliskuun alussa. Muokkaus-ominaisuuden tultua käyttöön voit omat oppimateriaalit -näkymästä klikata oppimateriaalin kohdalta muokkaa ja tämän jälkeen lisätä, poistaa tai vaihtaa oppimateriaalin kuvailutietoja sekä lisätä tai vaihtaa tiedostoja tai linkkejä, joista oppimateriaali koostuu. Aiempi versio on nähtävillä versiohistoriasta.',
      ]
    },
    {
      question: 'Voinko tehdä materiaaleja Avointen oppimateriaalien kirjastossa / miten voin tehdä materiaaleja?',
      answer: [
        'Avointen oppimateriaalien kirjastossa ei itsessään voi tehdä materiaaleja, sinne voi vain tallentaa tai linkittää muualla tehtyjä materiaaleja.',
        'Oppimateriaalien tekemiseen on useita soveltuvia työkaluja ja työkalu kannattaa valita sen mukaan, mikä soveltuu materiaaliin pedagogisesti ja vastaa muuhun tarpeeseen (esim. osaaminen, resurssit). Esimerkiksi erilaiset toimisto-ohjelmat, videotallennusohjelmat ja sivueditorit tarjoavat erilaisia ratkaisuja. Oppimateriaaleihin on myös niiden tekemiseen erikoistuneita palveluita kuten matematiikan GeoGebra. Työkalua valitessa kannattaa huomioida että materiaali on käytettävissä myös muualta käsin eli että se on tallennettavissa omalle koneellesi ja jaettavissa muille. Tämä takaa sen että oppimateriaalisi on käytettävissä vaikka käyttämäsi alusta ei enää olisikaan olemassa.',
      ]
    },
    {
      question: 'Tein X-alustalla materiaalin, miten saan sen ladattua alustalta jotta voin tallentaa sen Avointen oppimateriaalien kirjastoon?',
      answer: [
        'Alustan on tuettava tiedostojen lataamista jotta tämä on mahdollista. Esimerkiksi erilaisissa ohjelmistoissa on yleensä tiedosto tai asetus –valikossa tallentamiselle ja pilvipalveluissa kopion lataamiselle oma painikkeensa. Tallennettuasi tiedoston tietokoneellesi, voit sen sieltä tallentaa Avointen oppimateriaalien kirjastoon.',
        'Joitain case-esimerkkejä:',
        `<ul>
          <li>H5P vaatii että ylläpito on mahdollistanut latauksen. Latauspainike on yleensä h5p-tehtävän vasemmassa alalaidassa (Reuse tai Dowload). Mikäli et löydä lataus-painiketta, ota yhteys alustan ylläpitäjään. Lisätietoja <a href="https://h5p.org/documentation/for-authors/import-and-export" target="_blank" rel="noopener nofollow">H5P-tehtävistä H5P:n omilta sivuilta</a>. Ladattuasi tiedoston voit tallentaa ja käyttää sitä avointen oppimateriaalien palvelussa.</li>
          <li>Google Classroom ja Classcraftissa luotuja luokkia (class) ei voi ladata sellaisenaan palvelusta. Sen sijaan sinne tallennetut materiaalit kuten dokumentit, taulukot ja esitykset (Docs, Sheets, Slides, lataamasi tiedostot) ovat ladattavissa file ja download as –valikon kautta. Class ja Classcraft -kurssit samoin kuin Google forms -tehtävät on mahdollista linkittää Avoiten oppimateriaalien kirjastoon mikäli ne ovat kaikille avoimesti saatavilla.</li>
          <li>Oppimisalustoille kuten Moodle tai Itslearning tehdyt kurssit voi tuoda usealla eri tavalla palveluun. Mikäli oppimisalusta sallii kurssitiedoston lataamisen, voi tämän tallentaa Avointen oppimateriaalien kirjastoon, joskaan sitä ei voi käyttää Avointen oppimateriaalien kirjaston käyttöliittymästä vaan palvelusta voi vain ladata kurssitiedoston. Vaihtoehtona on tuoda oppimisalustaan tallennetut oppimateriaalit (esim. tehtävät, esitykset ja ohjeistusmateriaalit) omina tiedostoinaan Avointen oppimateriaalien kirjastoon. Tällöin kurssin oppimateriaaleja voi käyttää palvelusta käsin ja niiden käyttöönotto eri oppimisalustoissa on suoraviivaisempaa. Mikäli oppimisalustalla oleva kurssi on pitkäaikaisesti avoin kaikille, voi kurssin myös linkittää Avointen oppimateriaalien kirjastoon. Huomioithan että avoimuus tarkoittaa sitä, että materiaalia voi käyttää ilman tarvetta kirjautua oppimisalustaan. <strong>Suositelluinta on siirtää kurssin oppimateriaalit omina tiedostoinaan</strong>. Avointen oppimateriaalien kirjastossa yhdessä oppimateriaalissa voi olla usea tiedosto.</li>
          <li>Blogger ja Wordpress –palvelusta sivut ovat varmuuskopioitavissa settings-valikon kautta xml-muodossa. Selvitämme tällä hetkellä xml-muuntamista, mutta emme nykyisellään tue sen näyttämistä. Wordpressille on myös saatavissa lisäosa sivun lataamiseksi html-muodossa. Html:n (ja siihen liittyvät tiedostot) voi tallentaa zip-tiedostona ja sitä voi käyttää sivuston tavoin Avointen oppimateriaalien kirjastosta. Sekä Blogger että Wordpress –sivut voi linkittää Avointen oppimateriaalien kirjastoon mikäli ne ovat kaikille avoimesti saatavilla.</li>
        </ul>`,
        'Jos alusta ei tue lataamista/tallentamista, on oppimateriaali mahdollista myös linkittää palveluun. Huolehdi tällöin että oppimateriaali on käytettävissä ilman sisäänkirjautumista tai muita rajoitteita.',
      ]
    },
    {
      question: 'Miten voin huomioida oppimateriaalin saavutettavuuden?',
      answer: [
        'Saavutettavuuden huomiomalla pyritään tekemään oppimateriaalista mahdollisimman käytettävä kaikille. Ladatessasi oppimateriaalisi Avointen oppimateriaalien kirjastoon, vastaat itse oppimateriaalisi saavutettavuuden toteutuksesta. Oppimateriaalin saavutettavuutta voi lisätä huomioimalla erilaiset käyttäjät oppimateriaalia tehdessä. Esimerkiksi tehdessäsi videomateriaalia, on hyvä tehdä materiaalille myös tekstitys, jotta nekin oppijat tai opettajat jotka eivät kuule, ymmärtävät videon sisällön. Avointen oppimateriaalien kirjasto tukee tekstitysten lisäämistä myös omana txt-tiedostona, jolloin voit lisätä useamman erikielisen tekstityksen tai jättää tämän mahdollisuuden materiaalin käyttäjille.  Eri ohjelmilla ja eri muotoisille materiaaleille on olemassa omia apuohjelmia saavutettavuuden varmistamiseen, <a href="http://www.esok.fi/stivisuositus/suosituksen-sisalto" target="_blank" rel="noopener nofollow">lisätietoa saavutettavuuden apuohjelmista esimerkiksi Esteetöntä opiskelua -sivulta</a>.',
        'Tehdessäsi oppimateriaalia, on hyvä huomioida nämä seikat:',
        `<ul>
          <li>Jäsennä teksti mm. käyttämällä otsikoita otsikkotyylein, sijoittamalla tärkeän asian alkuun ja tekemällä lyhyitä kappaleita sekä listoja</li>
          <li>Tee video-, kaavio- ja kuvasisällölle tekstivastineet</li>
          <li>Tarjoa sisältöä eri muodoissa: tekstin lisäksi esimerkiksi infograafein</li>
         </ul>`,
        'Lisätietoa esimerkiksi Kehitysvammaliiton <a href="http://papunet.net/saavutettavuus/pikaopas-sisallontuottajille" target="_blank" rel="noopener nofollow">Papunet-palvelun pikaoppaasta sisällöntuottajille</a>.',
        'Avointen oppimateriaalien kirjastossa voit myös lisätä kuvailuun tiedon siitä, miten oppimateriaalissa on huomioitu saavutettavuus. Tämä auttaa oppimateriaalien käyttäjiä löytämään itselle sopivia materiaaleja helpommin. <a href="https://wiki.eduuni.fi/display/CscOppimateriaalivaranto/Oppimateriaalien+metatietomalli#Oppimateriaalienmetatietomalli-saavutettavuus" target="_blank" rel="noopener nofollow">Saavutettavuuteen liittyvistä kuvailutiedoista lisätietoa palvelun avoimesta wikialueesta</a>.',
      ]
    },
    {
      question: 'Mitä teen jos löydän virheellistä tai muuten sopimatonta sisältöä?',
      answer: [
        'Avointen oppimateriaalien kirjasto on avoin paikka oppimateriaalien jakamiseen. Kaikki kirjastoon oppimateriaalinsa jakavat sitoutuvat palvelun käyttöehtoihin, mutta silti joskus saattaa palveluun päätyä sopimatonta sisältöä. Voit ottaa tällöin meihin yhteyttä osoitteeseen oppimateriaalivaranto@csc.fi. Viestissäsi kerro mistä oppimateriaalista on kyse ja mikä materiaalissa on mielestäsi vikana. Tarkastamme kaikki meille ilmoitetut oppimateriaalit ja arkistoimme ne mikäli ne eivät vastaa palvelun käyttöehtoja.',
      ],
    },
    {
      question: 'Mitä voin tehdä jos materiaalini ei toimikaan?',
      answer: [
        'Joskus voi käydä niin, että ladattuasi materiaalin et saakaan materiaalia auki. Näissä tilanteissa, ota asiakastukeemme yhteys laittamalla sähköpostia osoitteeseen oppimateriaalivaranto@csc.fi. Viestissäsi kerro, mikä on vikana, mitä selainta ja selaimen versiota käytät ja mitä teit kun vikatilanne syntyi. Voimme yhdessä ratkaista ongelmatilanteen.',
        'Palvelu toimii parhaiten päivitetyillä selaimilla. Taataksesi sivuston parhaan toiminnan suosittelemme, että käytät Chrome, tai Firefox -selaimia ja päivität näitä säännöllisesti. Myös muut selaimet toimivat yleisesti. Tämän sivun kysymyksestä Mitä materiaaleja voin tallentaa palveluun voit tarkistaa onko materiaalisi tiedostotyyppi tuettu.',
      ],
    },
    {
      question: 'Miten materiaalia voi muokata tallentamisen jälkeen? Voiko tallennetun materiaali poistaa?',
      answer: [
        `Voit omat oppimateriaalit -näkymästä klikata oppimateriaalin kohdalta muokkaa ja tämän jälkeen lisätä, poistaa tai vaihtaa oppimateriaalin kuvailutietoja sekä lisätä tai vaihtaa tiedostoja tai linkkejä, joista oppimateriaali koostuu. <a href="${environment.frontendUrl}/#/materiaali/606">Tarkemmat ohjeet oppimateriaalien päivittämiseen löydät ohjeistamme</a>. Aiemmat versiot säilyvät palvelussa ja ovat jatkossa nähtävissä versiohistoriasta.`,
        'Käyttäjä ei voi poistaa Avointen oppimateriaalien kirjastoon tallennettuja oppimateriaaleja. Tämä on tärkeää jotta oppimateriaaleihin voi luotettavasti viitata. Oppimateriaalin voi merkitä vanhentuneeksi Oppimateriaali vanhenee -tiedon avulla, jolloin oppimateriaalia ei tule enää esille haussa. Virhetilanteissa tai mikäli löydät materiaalin, joka on käyttöehtojen vastainen, voi olla yhteydessä asiakastukeemme oppimateriaalivaranto@csc.fi ja ylläpitäjä voi poistaa materiaalin.',
      ],
    },
  ],
  en: [
    {
      question: 'Which factors must I take into account when setting out to create educational resources? Does the Library of Open Educational Resources set any requirements regarding the creation of educational materials?',
      answer: [
        'The Library of Open Educational Resources only requires that you are able to download/save your work onto your computer in a file format, and that you have permission to openly license your work. For more information on open licenses, see “What are Creative Commons licenses?” on this page.',
        'Linking to resources is also possible if they cannot be saved. Please ensure that the material is available openly, with no login or other restrictions, and that it can be accessed now and after its creation on the platform on which it was created.',
        'It is also advisable to read through <a href="https://www.oph.fi/fi/julkaisut/e-oppimateriaalin-laatukriteerit" target="_blank" rel="noopener nofollow">the Finnish National Agency for Education quality criteria for digital learning resources</a>, and consider what digital resources should accomplish (link in Finnish).',
        `Relevant sections of the <a href="${environment.frontendUrl}/#/materiaali/120">quality criteria for online implementations created</a> as part of the eAMK project can also be useful.`,
        'This page has a dedicated section for questions regarding accessibility.',
      ]
    },
    {
      question: 'Which kinds of resources can be uploaded to the service?',
      answer: [
        'Any open, Creative Commons licensed educational resources can be saved in the service for users to download.',
        'Resources can also be used on the service itself. This does not apply to all file formats, but we aim to support the most common formats utilized by open educational resources. These include the formats used with videos, podcasts and other audio recordings, various text files, graphics, exercises and presentations, and various website implementations, such as avi, mp4, mp3, pdf, docx, doc, odt, rtf, txt, markdown, h5p, ppt, pptx, odp, opt, and html.',
        'Is your preferred format not listed here or is your resource in the form of an executable program (exe)? Don’t worry, these are only examples. Feel free to contact us to confirm whether your format of choice is supported. We will be happy to hear about the full range of open educational resources being created!',
      ]
    },
    {
      question: 'Is it better to save a resource or link to it?',
      answer: [
        'Saved resources are stored in the Library of Open Educational Resources without the user needing to worry about them remaining open and available following the conclusion of the project in which they were created. Saved materials can also be downloaded from the service, which allows end users to utilize them in a range of ways e.g. by exporting them to each learning platform they are using. Saving is the more suitable option when the goal is to make the resource available to others with minimal effort as regards maintenance.',
        'Linking is a viable alternative when you can trust that the resource will be maintained on the website on which it is hosted. It is also suitable when the resource in question is hosted on a platform that does not allow it to be exported (i.e. it is not possible to download the material onto your own computer, for example). When linking to a resource, please ensure that it is available openly to all, with no login required.',
      ]
    },
    {
      question: 'How do I go about uploading educational resources?',
      answer: [
        'Uploading resources to the service is easy. Simply log in, upload the file, and answer a few questions that help others quickly and easily ascertain the type and intended target users of your resource.',
        `Read more from our <a href="${environment.frontendUrl}/#/materiaali/606">instructions</a>.`,
      ]
    },
    {
      question: 'Can I create resources on the Library of Open Educational Resources platform / How can I create resources?',
      answer: [
        'Resources created using other tools can be saved or linked to on the service, but is not possible to create resources on the service platform itself.',
        'There are a number of suitable tools for creating educational resources. These should be selected based on pedagogical considerations and other requirements (competences, available resources, etc.). As an example, office and video recording software and website editors offer a range of solutions. Specialized software for creating educational resources is also available, such as mathematics package GeoGebra. When selecting your tool, it is advisable to consider whether created material can be saved onto your own computer and distributed to others. This ensures that your educational resources remain usable even if the platform in question is no longer available.',
      ]
    },
    {
      question: 'I have created a resource using platform X: How do I download it from the platform in order to save it in the Library of Open Educational Resources?',
      answer: [
        'Firstly, the platform in question must allow files to be downloaded. In software programs, the save function can usually be found in the menu labeled “File” or “Settings”, and cloud services generally have a dedicated button for downloading copies. Once the file has been saved onto your computer, it can be uploaded to the Library of Open Educational Resources.',
        'Example cases:',
        `<ul>
          <li>H5P requires that the administrator has enabled downloading. The download button is usually located in the lower left-hand corner of the H5P exercise window (Reuse or Download). Contact the administrator if you cannot locate the download button. More <a href="https://h5p.org/documentation/for-authors/import-and-export" target="_blank" rel="noopener nofollow">information on H5P on their website</a>. Once you have downloaded the file, you can save and use it on the Library of Open Educational Resources.</li>
          <li>Classes created in Google Classroom and Classcraft cannot be downloaded from the service. However, materials saved in the service such as documents, tables, and presentations (Docs, Sheets, Slides, uploaded files) are downloadable using the menu labeled “File and download as”. Class and Classcraft courses as well as Google Forms exercises can be linked to the Library of Open Educational Resources, given that they are openly available to everyone.</li>
          <li>Courses created on learning platforms such as Moodle and Itslearning can be brought to the service in a number of ways. If the learning platform allows a course file to be downloaded, it can then be saved in the Library of Open Educational Resources. It cannot be used on the service, however, and can therefore only be downloaded. Alternatively, resources saved on the learning platform (such as exercises, presentations and instructional materials) can imported into the service as separate files. This approach allows course resources to be used on the service and makes using them on various learning platforms more straightforward. If a course hosted on a learning platform is open to everyone without login or time restrictions, it can also be linked to the service. It is recommended, however, that course resources are downloaded and then uploaded to the service. The Library of Open Educational Resources allows a single resource to contain multiple files.</li>
          <li>Blogger and Wordpress users can make backup copies of pages in xml format via the “Settings" menu. We are looking into the possibility of xml conversion, but viewing the format is currently not supported. A Wordpress plugin that enables users to download pages in html format is also available. Html files (and associated files) can be saved as a zip file and used on the Library of Open Educational Resources in the same way as on Wordpress. Blogger and Wordpress pages can also be linked to the service, given that they are openly accessible to everyone.</li>
        </ul>`,
        'If a platform does not support downloading/saving but it is otherwise an optimal solution for the resource in question, the resource can also be linked to the service. In this case it is important to ensure that the resource is usable without a login or other restrictions.',
      ]
    },
    {
      question: 'How do I make my educational resources accessible?',
      answer: [
        'Taking accessibility factors into account allows us to maximize usability for all users. When uploading your materials to the Library of Open Educational Resources, it is up to you to ensure that its features are accessible. Increased accessibility can be achieved by endeavoring to take into account the full range of users in the process of creating your educational resource. When creating a video, for example, it is advisable to include subtitles for those learners and teachers who are hard of hearing. The service supports adding subtitles using a separate txt file, which allows you to add subtitles in multiple languages or give the option to do so to the users of your resource. There are utility programs for various software programs and file formats that help ensure that material is accessible. For more information, see the <a href="http://www.esok.fi/stivisuositus/suosituksen-sisalto" target="_blank" rel="noopener nofollow">“Esteetöntä opiskelua” (“Accessible Learning”) page</a> (in Finnish).',
        'When creating educational resources, it is advisable to consider the following:',
        `<ul>
            <li>Organize text in a readable manner by e.g. applying the appropriate formatting to headings, placing core content at the beginning, and keeping paragraphs and lists concise,</li>
            <li>Provide text versions of content in video, chart and image format, and</li>
            <li>make content available in multiple forms, such as infographics instead of text alone.</li>
        </ul>`,
        'For more information, see the <a href="http://papunet.net/saavutettavuus/pikaopas-sisallontuottajille" target="_blank" rel="noopener nofollow">quick guide for content creators</a> on the Finnish Association on Intellectual and Developmental Disabilities’ Papunet service (in Finnish).',
        'The Library of Open Educational Resources also allows you to add information on how accessibility factors have been taken into account in the description of your resource. This makes it easier for users to find resources that meet their needs. For more information on material descriptions, see the service’s <a href="http://www.saavutettavasti.fi/#Oppimateriaalienmetatietomalli-saavutettavuus" target="_blank" rel="noopener nofollow">open wiki</a>.',
      ]
    },
    {
      question: 'What to do if I find improper or incorrect resources or comments?',
      answer: [
        'The Library of Open Educational Resources is an open space for sharing OER. Everyone that shares their resources in the services has agreed to follow the Terms of Use of the service, but some content not meant for the service can still sometimes find it\'s way here. If you find such content, please contact us at oppimateriaalivaranto@csc.fi. In your mail, please report to us the learning resource in question and what appears to be wrong with it. We inspect every reported resource and archive them if they do not follow our Terms of Use.',
      ],
    },
    {
      question: 'What can I do, if my learning resource is not functioning correctly?',
      answer: [
        'At times it can happen that the learning resource you uploaded does not open correctly. If this happens, please contact our support by sending us an email oppimateriaalivaranto@csc.fi. In your message it is important that you explain what is wrong, what browser you used and what were you doing in the service when the error happened. Together we can solve the situation.',
        'The service works best with up to date browsers. To make sure that you have the optimal experience, please use Chrome, or Firefox -browsers and update them regularly. You can also check which file formats are supported on this page in the question Which kinds of resources can be uploaded to the service?.',
      ],
    },
    {
      question: 'How can I update my learning resource after I have uploaded it? Can I delete the resource?',
      answer: [
        'You can edit your learning resources in the My open educational resources -view by clicking Edit underneath the resource you wish to edit. By doing this you can add, delete and change the metadata as well as the files and links that constitute the resource. <a href="https://aoe.fi/#/materiaali/606">You can find a more detailed instruction here</a>. Previous versions of the learning resource are saved in the service and you can access them in the future through the learning resources version history.',
        'A user cannot delete learning resources that have been uploaded in the Library of Open Educational Resources. This is important so that users can reliably reference the learning resources. You can however note that the learning resource expires after a specific date; when that date has passed, it no longer is possible to discover it through the search function. In case of an error or if you find a resource that violates our terms of use, please contact us at oppimateriaalivaranto@csc.fi so that an admin can delete the resource.',
      ],
    },
  ],
  sv: [
    {
      question: 'Vad ska jag beakta när jag börjar skapa undervisningsmaterial? Ställer Biblioteket för öppna lärresurser särskilda krav på materialen?',
      answer: [
        'Det enda att tänka på när det gäller Biblioteket för öppna lärresurser är att du i det verktyg du använder ska kunna ladda upp/spara en fil av ditt verk på din dator, och att du har rätt att licensera ditt undervisningsmaterial öppet. Du hittar mer information om öppna licenser på den här sidan under rubriken Vad är Creative Commons-licenser?',
        'Om fillagring inte är aktuell kan man också länka materialet. Försäkra dig i så fall om att materialet är öppet tillgängligt utan inloggning eller andra begränsningar såväl nu som senare på den plattform där det skapats.',
        'Det lönar sig att gå igenom <a href="https://www.oph.fi/fi/julkaisut/e-oppimateriaalin-laatukriteerit" target="_blank" rel="noopener nofollow">Utbildningsstyrelsens kvalitetskriterier</a> för digitala läromaterial och fundera på vad man själv vill ha ut av dem.',
        `Också projektet <a href="${environment.frontendUrl}/#/materiaali/120">eAMK:s kvalitetskriterier</a> är användbara till tillämpliga delar.`,
        'I ett eget avsnitt på den här sidan finns det tips om hur man beaktar tillgängligheten.',
      ]
    },
    {
      question: 'Vilka material kan lagras i tjänsten?',
      answer: [
        'Du kan lagra vilka som helst undervisningsmaterial med en öppen CC-licens i tjänsten, varifrån de sedan kan laddas ner.',
        'Materialen kan också användas direkt i tjänsten. Inte riktigt alla resurser kan användas via tjänsten, men vi försöker inkludera de vanligaste formaten för undervisningsmaterial. Till dessa hör olika format för videor, poddar och andra ljudinspelningar, texter, grafik, uppgifter och presentationer samt olika webbsideformat, bland annat avi, mp4, mp3, pdf, docx, doc, odt, rtf, txt, markdown, h5p, ppt, pptx, odp, opt, html.',
        'Finns inte det format du tänkt använda på listan eller är din fil exekverbar (exe)? Du behöver inte oroa dig, listan innehåller bara exempel. Om du vill kan du kontakta oss och försäkra dig om huruvida ditt valda format stöds. Vi vill gärna veta vilka typer av undervisningsmaterial som skapas just nu!',
      ]
    },
    {
      question: 'Är det bättre att lagra materialet i tjänsten eller länka till det?',
      answer: [
        'Material som lagras i Biblioteket för öppna lärresurser blir kvar där utan att man efter att ens projekt upphört behöver göra något för att de ska finnas tillgängliga eller förbli öppna. De lagrade materialen kan också laddas ner från tjänsten, vilket betyder att slutanvändarna kan utnyttja materialen mer mångsidigt genom att exempelvis föra över dem till den lärplattform de använder. Om man vill att materialet ska kunna användas av andra samtidigt som det administrativa arbetet blir så litet som möjligt, lämpar sig lagring bättre.',
        'Länkning fungerar om administrationen av resursen kan garanteras. Detta är också det lämpligaste sättet om undervisningsmaterialet finns på en plattform varifrån det inte kan flyttas (så att du till exempel inte kan spara det på din egen dator). I det här fallet ska man se till att materialet är öppet tillgängligt för alla utan inloggning.',
      ]
    },
    {
      question: 'Hur läggs material till?',
      answer: [
        'Att lägga till resurser i tjänsten är enkelt: du loggar in, laddar upp filen och besvarar några frågor, så att andra enkelt och snabbt kan avgöra hurdant ditt material är och för vem det är avsett.',
        `Läs mer från våra <a href="${environment.frontendUrl}/#/materiaali/606">anvisningarna</a>.`,
      ]
    },
    {
      question: 'Kan jag skapa material i Biblioteket för öppna lärresurser/hur ska jag skapa material?',
      answer: [
        'Man kan inte skapa själva materialen i Biblioteket för öppna lärresurser utan enbart lagra eller länka material som skapats någon annanstans.',
        'Det finns många lämpliga verktyg för att skapa undervisningsmaterial. Välj det verktyg som är mest pedagogiskt för materialet i fråga och som i övrigt motsvarar behoven (kompetens, resurser osv.) Exempelvis erbjuder olika kontorspaket, videoinspelningsprogram och webbeditorer många typer av lösningar. Det finns också tjänster som är specialiserade på undervisningsmaterial, till exempel GeoGebra för matematik. När man väljer verktyg bör man beakta att materialen ska kunna användas i andra sammanhang, det vill säga att de ska kunna sparas på din egen dator och delas med andra. Detta säkerställer att ditt material kan utnyttjas också om inte den plattform du använt längre finns.',
      ]
    },
    {
      question: 'Jag skapade material på plattformen X. Hur kan jag ladda ned det från plattformen så att jag kan lagra det i Biblioteket för öppna lärresurser?',
      answer: [
        'Plattformen måste stödja filnedladdning för att det ska gå. Exempelvis finns det i många olika program vanligtvis alternativ för att ladda ned en kopia av filen i fil- eller inställningsmenyn och i molntjänster en särskild knapp för att spara en kopia. När du laddat ned filen till din dator kan du sedan lagra den i tjänsten för öppna lärresurser.',
        'Exempel:',
        `<ul>
            <li>H5P kräver att en administratör aktiverat nedladdning. Nedladdningsknappen finns vanligtvis nere till vänster i en h5p-upgift (Reuse eller Download). Om du inte hittar den kan du kontakta plattformens administratör. Mer <a href="https://h5p.org/documentation/for-authors/import-and-export" target="_blank" rel="noopener nofollow">information om H5P på H5P-sidan</a>. Efter att du laddat ned filen kan du lagra och använda den i Biblioteket för öppna lärresurser.</li>
            <li>Google Classroom och klassrum (class) som skapats i Classcraft kan inte laddas ner som sådana från tjänsten. Däremot kan material som lagrats där, exempelvis dokument, tabeller och presentationer (Docs, Sheets, Slides, filer du laddat upp) laddas ner via menyalternativet File och Download as. Class och Classcraft-kurserna kan, liksom även Google forms-uppgifter, länkas i Biblioteket för öppna lärresurser, förutsatt att materialen är öppet tillgängliga för alla.</li>
            <li>Kurser som skapats i sådana lärplattformar som Moodle eller Itslearning kan föras in i tjänsten på flera olika sätt. Om lärplattformen medger nedladdning av kursfilen, kan den sedan lagras i Biblioteket för öppna lärresurser. Den kan ändå inte användas där utan man kan bara ladda ner kursfilen från tjänsten. Alternativet är att lägga in undervisningsmaterialen från lärplattformen (t.ex. uppgifter, presentationer och instruktionsmaterial) i egna filer i Biblioteket för öppna lärresurser. I så fall kan materialen användas i tjänsten och det är enklare att föra över dem till andra lärplattformar. Om en kurs i en lärplattform är långvarigt öppen för alla utan inloggning, kan man också länka kursen i Biblioteket för öppna lärresurser. Det alternativ som rekommenderas är att man lägger in undervisningsmaterialen i egna filer. I Biblioteket för öppna lärresurser kan det finnas flera filer i en enskild lärresurs.</li>
            <li>I tjänsterna Blogger och Wordpress kan sidor säkerhetskopieras i xml via Settings. Vi utreder för närvarande xml-konvertering, men i dagsläget stöds inte formatet. För tjänsten Wordpress finns också ett insticksprogram som gör det möjligt att ladda ned sidan i html. Html:n (och de filer som ingår i den) kan sparas som zip-fil och användas som en webbplats i Biblioteket för öppna lärresurser. Såväl Blogger- som Wordpress-sidor kan länkas i Biblioteket för öppna lärresurser, förutsatt att de är öppet tillgängliga för alla.</li>
        </ul>`,
        'Om plattformen inte stöder nedladdning/lagring men detta annars vore det bästa alternativet för materialet, kan materialet även länkas i tjänsten. I så fall ska du se till att undervisningsmaterialet kan användas utan inloggning eller andra begränsningar.',
      ]
    },
    {
      question: 'Hur kan jag beakta tillgängligheten i undervisningsmaterialet?',
      answer: [
        'Att beakta tillgängligheten betyder att undervisningsmaterialet blir så användarvänligt som möjligt för alla. När du lagrar undervisningsmaterial i Biblioteket för öppna lärresurser ansvarar du själv för att tillgängligheten beaktats. Tillgängligheten kan förbättras genom att olika användargrupper beaktas när materialet utarbetas. Exempelvis är det bra att lägga till undertexter till videor så att också studenter och lärare som inte hör kan ta del av innehållet. Biblioteket för öppna lärresurser stöder infogande av undertexterna som txt-fil. På så sätt kan du lägga till textning på flera språk eller ge användarna möjlighet till detta. Det finns särskilda hjälpprogram för att säkerställa tillgängligheten i olika program och format. Mer information om det här finns exempelvis på <a href="http://www.esok.fi/stivisuositus/suosituksen-sisalto" target="_blank" rel="noopener nofollow">webbplatsen Esteetöntä opiskelua (tillgängliga studier)</a> (på finska).',
        'När du utarbetar undervisningsmaterial är det bra att beakta följande:',
        `<ul>
            <li>att du strukturerar texten bland annat genom att formatera rubriker med rubrikformat, placera det viktigaste först och skriva korta stycken och listor,</li>
            <li>att du skapar textversioner av videor, diagram och bilder</li>
            <li>att du erbjuder innehållet i olika format, exempelvis såväl text som infografer.</li>
        </ul>`,
        'Mer information finns till exempel i <a href="http://papunet.net/saavutettavuus/pikaopas-sisallontuottajille" target="_blank" rel="noopener nofollow">snabbguiden för innehållsproducenter i Förbundet Utvecklingshämnings tjänst Papunet</a> (på finska).',
        'I Biblioteket för öppna lärresurser kan du i beskrivningen också lägga till information om hur tillgängligheten har beaktats i materialet. Det underlättar för användarna att hitta material som passar dem. Det finns mera information <a href="http://www.saavutettavasti.fi/#Oppimateriaalienmetatietomalli-saavutettavuus" target="_blank" rel="noopener nofollow">om metadata i tjänstens öppna wiki</a> (på finska).',
      ]
    },
    {
      question: 'Vad kan jag göra om jag finner en lärresurs som är felaktig?',
      answer: [
        'Biblioteket för öppna lärresurser är en öppen plats för publicering av öppna lärresurser. Alla människor som publicerar lärresurser i tjänsten accepterar tjänstens användningsvillkor, men ändå kan någon felaktiga lärresurser finnas sig på tjänsten. Om du ser någonting som är opassande eller emot tjänstens användningsvillkor, var god och kontakta oss: oppimateriaalivaranto@csc.fi. I din e-post, specificera vilken lärresurs rapporterar du och vad är fel med resursen. Vi inspekterar alla lärresurser som är rapporteras och arkiverar dom om de är emot tjänstens anvädningsvillkor.',
      ],
    },
    {
      question: 'Vad kan jag göra om min lärresurs inte fungerar?',
      answer: [
        'Ibland kan det hända att lärresurs du laddade upp inte öppnas korrekt. Om detta händer, vänligen kontakta vår support oppimateriaalivaranto@csc.fi. I ditt meddelande är det viktigt att du förklarar vad som är fel, vilken webbläsare du använde och vad gjorde du i tjänsten när felet inträffade.',
        'Tjänsten fungerar bäst med en uppdaterad webbläsare. Du har den bästa upplevelsen, när du använder Chrome eller Firefox -webbläsare och uppdaterar dem regelbundet. Du kan också kolla vilka format kan användas direkt i tjänsten på den här sidan i frågan Vilka material kan lagras i tjänsten?.',
      ],
    },
    {
      question: 'Hur kan jag uppdatera min lärresurs efter att jag har laddat upp den? Kan jag ta bort resursen?',
      answer: [
        `Du kan redigera dina lärresurser i Mina lärresurser -sidan. Klick Redigera under lärresursen och då kan du lägga till, ta bort och ändra metadata samt de filer och länkar som utgör resursen. <a href="${environment.frontendUrl}/#/materiaali/606">Anvisning för redigering av lärresurser finns här</a>. Tidigare versioner av lärresursen sparas i tjänsten och du kan komma åt dem i framtiden genom lärresursens versionshistorik.`,
        'En användare kan inte ta bort lärresurser som har laddats upp i biblioteket. Detta är viktigt så att användare på ett tillförlitligt sätt kan referera till lärresurserna. Du kan ändå tillsätta ett datum då lärresursen föråldras; när detta datum har gått är det inte längre möjligt att upptäcka det genom sökfunktionen. Om någonting går fel eller om du hittar en resurs som bryter mot våra användarvillkor, vänligen kontakta oss på oppimateriaalivaranto@csc.fi så att en administratör kan ta bort resursen.',
      ],
    },
  ]
};
