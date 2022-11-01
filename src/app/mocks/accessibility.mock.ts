import { AccessibilityTable } from '@models/mocks/accessibility-table';

/* eslint-disable max-len */
export const Accessibility: AccessibilityTable = {
    fi: [
        {
            topic: 'Kielen selkeys ja ymmärrettävyys',
            examples: [
                'Käytä selkeää yleiskieltä, jota kaikkien oppijoiden on helppo ymmärtää.',
                'Selosta käytetyt vieraat termit.',
            ],
            details: [
                `<a href="https://www.kotus.fi/" rel="noopener">Kotimaisten kielten keskus</a>`,
                `<a href="https://kaltura.hamk.fi/media/N%C3%A4in+kirjoitat+saavutettavaa+verkkoteksti%C3%A4/0_b20hi76r" rel="noopener">Saavutettava verkkoteksti</a>`,
            ],
            howTo: [
                `Saavutettavuuden ominaisuudet kenttään valitse <strong>Selkokieli.</strong>`,
                `Jos olet toteuttanut oppimateriaalisi käyttäen helppolukuista, suurikokoista fonttia voit merkitä samaan kenttää <strong>isokokoinen teksti.</strong>`,
            ],
        },
        {
            topic: 'Työkalujen käyttö selkeän ja loogisen rakenteen luomisessa',
            examples: [
                'Jaa materiaali kuvaavasti otsikoituihin osiin, jotta oppija saa tiedon oppimateriaalin rakenteesta.',
                'Hyödynnä ohjelmiston valmiita tyylimuotoiluja.',
                'Nimeä linkit havainnollisesti.',
            ],
            details: [
                `<a href="https://www.saavutettavasti.fi/saavutettavat-asiakirjat/" rel="noopener">Saavutettavasti.fi-sivuston ohjeet saavutettaviin asiakirjoihin</a>`,
                `<a href="https://www.eoppiva.fi/koulutukset/saavutettavat-asiakirjat-verkossa/" rel="noopener">eOppivan kurssi: Saavutettavat asiakirjat verkossa</a>`,
            ],
            howTo: [
                `Saavutettavuuden ominaisuudet -kenttään valitse <strong>Navigointi rakenteen avulla</strong>. Jos olet tehnyt rakenteita ja hallinnanominaisuuksia multimediaa` +
                    ` sisältäviin oppimateriaaleihin, esimerkiksi videoita ja ääntä hyödyntäviin materiaaleihin, voit valita <strong>Multimedia ja ajastettu sisältö hallittavissa.</strong>`,
            ],
        },
        {
            topic: 'Ei-tekstuaalisten elementtien erottuvuus ja vaihtoehtoiset esittämistavat',
            examples: [
                'Huomioi teksti- ja värikontrastit, jotta materiaalista olisi mahdollisimman helppo havaita eri sisällöt.',
                'Varmista, että materiaali toimii myös mustavalkoisena.',
                'Tuota ei-tekstuaaliselle materiaalille tekstivastineet: kirjoita esim. kuville vaihtoehtoiset tekstit tai kuvatekstit ja lisää video- ja audiotallenteisiin tekstitys, tekstivastineet tai kuvatulkkaus.',
            ],
            details: [
                `<a href="https://www.saavutettavasti.fi/kuva-ja-aani/" rel="noopener">Kuva ja ääni</a>`,
                `<a href="https://support.google.com/youtube/answer/2734796?hl=fi" rel="noopener">Videoiden tekstityksestä</a>`,
                `<a href="https://selkokeskus.fi/selkokieli/" rel="noopener">Selkokieliset videot</a>`,
                `<a href="https://digipedaohjeet.hamk.fi/ohje/nain-tuotat-saavutettavan-videon/" rel="noopener">Videoiden tekstittäminen edistää saavutettavuutta</a>` +
                    ' -ohjeessa havainnollistuu hyvin eri tekstitystapojen (open tai closed captions) erot',
            ],
            howTo: [
                `Saavutettavuuden ominaisuudet -kenttään valitse <strong>tekstivastine</strong> kun olet kuvaillut visuaalisen sisällön. Samasta kentästä valitse <strong>tekstitys</strong>, mikäli videoissasi on synkronoitu tekstuaalinen vastine puheelle.` +
                    ` Lisäksi voit valita <strong>käsikirjoitus</strong>, mikäli äänitiedostoille on kirjoitettu erillinen tekstivastine. Mikäli äänisisällölle on viittomakielinen tulkkaus, voit valita <strong>viittomakieli.</strong>` +
                    ` Mikäli olet käyttänyt kaavioiden tai muun sisällön esittämiseen niiden luettavuuden mahdollistavia <strong>MathML-, ChemML-</strong> tai <strong>latex</strong> -merkkauskieltä, voit merkitä myös tämän.`,
            ],
        },
        {
            topic: 'Materiaalin ja sen sisällön löydettävyys',
            examples: [
                'Kuvaile oppimateriaalien metatietoihin, mistä materiaalista on kyse, kenelle se on tarkoitettu ja miten siinä on otettu saavutettavuus huomioon.',
            ],
            details: [
                `<a href="https://koodistot.suomi.fi/codescheme;registryCode=edtech;schemeCode=AccessibilityFeatures/" rel="noopener">Sanasto saavutettavuusmetatiedoille</a>`,
                `<a href="https://aoe.fi/#/materiaali/606/" rel="noopener">Ohjeet metatietojen lisäämiseen</a>`,
            ],
            howTo: [
                `Huolellinen kuvailu on myös saavutettavuutta.   Saavutettavuutta varten on käytössä saavutettavuuden ominaisuudet ja saavutettavuuden esteet -kentät, mutta myös muiden kohtien täyttäminen lisää toisten ymmärrystä materiaalistasi,` +
                    ` sen soveltuvuudesta ja sen käyttötarkoituksista.`,
            ],
        },
        {
            topic: 'Materiaalin käytettävyys eri laitteilla ja ympäristöissä',
            examples: [
                'Käytä tiedostomuotoja ja ratkaisuja, jotka antavat käyttäjälle mahdollisuuden mukauttaa ulkoasua omiin tarpeisiinsa.',
            ],
            details: [
                `<a href="https://daisy.org/info-help/time-to-use-the-modern-digital-publishing-format/" rel="noopener">Epub ja PDF -formaattien vertailu (engl.)</a>`,
            ],
            howTo: [],
        },
        {
            topic: 'Hyödynnä saavutettavia materiaaleja',
            examples: [
                'Kun hyödynnät opetuksessa muiden tuottamia aineistoja, tarkista niiden saavutettavuus, esim. tekstitykset.',
            ],
            details: [],
            howTo: [
                `Kun teet omia oppimateriaaleja hyödyntäen toisten oppimateriaaleja, voit merkata nämä materiaalit Hyödynnetyt materiaalit -sivulle. Mikäli lisenssi sallii, voit myös tehdä toisten oppimateriaalista saavutettavampia ` +
                    `– esim. tehdä tekstityksen niille!`,
            ],
        },
    ],
    en: [
        {
            topic: 'Clarity and comprehensibility of language',
            examples: [
                'Use a clear general language that is easy for all learners to understand.',
                'Explain the unfamiliar terms used.',
            ],
            details: [
                `<a href="https://www.kotus.fi/en" rel="noopener">Institute for the Languages of Finland</a>`,
                `<a href="https://kaltura.hamk.fi/media/N%C3%A4in+kirjoitat+saavutettavaa+verkkoteksti%C3%A4/0_b20hi76r" rel="noopener">Accessible online text (in Finnish)</a>`,
            ],
            howTo: [
                `In the Accessibility Feature field, choose <strong>plain language.</strong>`,
                `Choose <strong>large print</strong>, if you have used an easy-to-read, large sized font in your learning resource.`,
            ],
        },
        {
            topic: 'Use tools for creating a clear and logical structure',
            examples: [
                'Divide the material into sections with descriptive titles to inform the learner about the structure of the educational resource.',
                'Take advantage of the built-in styles of the software.',
                'Name the links illustratively.',
            ],
            details: [
                `<a href="https://www.saavutettavasti.fi/saavutettavat-asiakirjat/" rel="noopener">Instructions of the Saavutettavasti.fi website to accessible documentation (in Finnish)</a>`,
                `<a href="https://www.eoppiva.fi/koulutukset/saavutettavat-asiakirjat-verkossa/" rel="noopener">eOppiva course: Accessible documents online (in Finnish)</a>`,
            ],
            howTo: [
                `Choose <strong>structural navigation</strong> in the Accessibility Feature field.`,
                `If you have a learning resource that includes video or voice and you have created navigable structure and other ways to control multimedia you can also choose <strong>timing control.</strong>`,
            ],
        },
        {
            topic: 'Visibility and alternative presentation methods of non-textual elements',
            examples: [
                'Take text and colour contrasts into account to ensure that the different contents are as easy as possible to distinguish in the material.',
                'Make sure that the material also functions in black and white.',
                'Produce equivalent content for non-textual material: for example, type alternative texts or captions for images, and add captions, subtitles, media alternative transcripts or audio descriptions to video and audio recordings.',
            ],
            details: [
                `<a href="https://www.saavutettavasti.fi/kuva-ja-aani/" rel="noopener">Image and sound (in Finnish)</a>`,
                `<a href="https://support.google.com/youtube/answer/2734796?hl=en" rel="noopener">About captioning videos</a>`,
                `<a href="https://selkokeskus.fi/in-english/guidelines-and-instructions/" rel="noopener">Plain language videos</a>`,
                'The guideline ' +
                    `<a href="https://digipedaohjeet.hamk.fi/ohje/nain-tuotat-saavutettavan-videon/" rel="noopener">Captioning of videos promotes accessibility</a>` +
                    ' shows the differences between different modes of captioning (open or closed captions) (in Finnish)',
            ],
            howTo: [
                `Choose <strong>alternative text</strong> in the Accessibility Feature field if you have created descriptions for visual content.`,
                `Choose <strong>captions</strong> if you have created synchronized text for speech in videos.`,
                `Choose <strong>transcript</strong> if you have created a separate alternative text for voice.`,
                `Choose <strong>sign language</strong> if the video has language interpretation in sign language.`,
                `Choose <strong>MathML, ChemML</strong> or <strong>Latex</strong> if you have used one of these to express figures or other content.`,
            ],
        },
        {
            topic: 'Findability of resources and their contents',
            examples: [
                'In the metadata of educational resources, describe what the resources are about, who they are intended for and how accessibility has been taken into account in them.',
            ],
            details: [
                `<a href="https://koodistot.suomi.fi/codescheme;registryCode=edtech;schemeCode=AccessibilityFeatures/" rel="noopener">Glossary for accessibility metadata</a>`,
                `<a href="https://aoe.fi/#/materiaali/606/" rel="noopener">Instructions for adding metadata</a>`,
            ],
            howTo: [
                `Good metadata also increases accessibility. We have specific fields for Accessibility Feature and Accessibility Hazard, but other metadata fields also help others to understand your learning resource, how to use it and for what purposes it is suitable.`,
            ],
        },
        {
            topic: 'The usability of resources with different devices and in various environments',
            examples: [
                'Use file formats and solutions that allow the user to customize the appearance according to their own needs.',
            ],
            details: [
                `<a href="https://daisy.org/info-help/time-to-use-the-modern-digital-publishing-format/" rel="noopener">Comparison of Epub and PDF formats</a>`,
            ],
            howTo: [],
        },
        {
            topic: 'Make use of accessible materials',
            examples: [
                'When you use resources produced by others in teaching, check their accessibility, e.g., captioning.',
            ],
            details: [],
            howTo: [
                'When you use resources produced by others you can credit the resources in the References page. You can also make resources made by others more accessible for example by making captions for them if the license of the learning resources permits such use!',
            ],
        },
    ],
    sv: [
        {
            topic: 'Ett tydligt och begripligt språk',
            examples: [
                'Använd ett tydligt allmänspråk som alla studerande lätt kan förstå.',
                'Redogör för främmande termer som använts.',
            ],
            details: [
                `<a href="https://www.sprakinstitutet.fi/sv" rel="noopener">Institutet för de inhemska språken</a>`,
                `<a href="https://kaltura.hamk.fi/media/N%C3%A4in+kirjoitat+saavutettavaa+verkkoteksti%C3%A4/0_b20hi76r" rel="noopener">En tillgänglig webbtext (på finska)</a>`,
            ],
            howTo: [
                `Välj <strong>lättläst språk</strong> i Tillgänglighetsegenskaper fältet.`,
                `Välj <strong>storstilstext</strong> om du har använt en stor och lättläst font.`,
            ],
        },
        {
            topic: 'Användning av verktyg för att skapa en tydlig och logisk struktur',
            examples: [
                'Dela in materialet under rubriker som beskriver materialet så att de studerande får information om lärresursens struktur.',
                'Utnyttja programvarans färdiga stilverktyg.',
                'Namnge länkar på ett överskådligt sätt.',
            ],
            details: [
                `<a href="https://www.saavutettavasti.fi/saavutettavat-asiakirjat/" rel="noopener">Anvisningar för tillgängliga dokument på webbplatsen Saavutettavasti.fi (på finska)</a>`,
                `<a href="https://www.eoppiva.fi/koulutukset/saavutettavat-asiakirjat-verkossa/" rel="noopener">eOppivas kurs: Tillgängliga dokument på webben  (på finska)</a>`,
            ],
            howTo: [
                `Välj <strong>möjligt att använda materialet med hjälp av strukturen.</strong> Om du har en multimedia lärresurs som har strukturer och kontroll egenskaper, välj <strong>multimedia och andra tidsberoende innehäll kan kontrolleras.</strong>`,
            ],
        },
        {
            topic: 'Icke-textuella element och alternativa presentationssätt',
            examples: [
                'Beakta text- och färgkontraster så att det är så lätt som möjligt att upptäcka olika innehåll i materialet.',
                'Kontrollera att materialet även fungerar i svartvitt.',
                'Skriv textalternativ för icke-textuella element: bildtexter eller alternativa texter för bilder samt textning, alternativ text eller bildtolkning för video- och audioupptagningar.',
            ],
            details: [
                `<a href="https://www.saavutettavasti.fi/kuva-ja-aani/" rel="noopener">Bild och ljud (på finska)</a>`,
                `<a href="https://support.google.com/youtube/answer/2734796?hl=sv" rel="noopener">Lägga till undertexter</a>`,
                `<a href="https://selkokeskus.fi/pa-svenska/om-lattlast/" rel="noopener">Lättlästa videor</a>`,
                'I anvisningen ' +
                    `<a href="https://digipedaohjeet.hamk.fi/ohje/nain-tuotat-saavutettavan-videon/" rel="noopener">Textning av videor främjar tillgängligheten</a>` +
                    ' tydliggörs skillnaderna mellan olika textningssätt (open eller closed captions) (på finska)',
            ],
            howTo: [
                `Välj <strong>text-alternative till icke-textbaserad information</strong> om du har alternativtexter för visuell information. Välj <strong>textning</strong> om din video har synkroniserad text-alternativ till röst.` +
                    ` Välj <strong>manuskript</strong> om du har en separat textfil med text-alternativ till röst. Välj <strong>teckenspråk</strong> om du har en teckenspråkig tolkning på din video.` +
                    ` Välj <strong>MathML, ChemML</strong> eller <strong>latex</strong> om du har använt en av de.`,
            ],
        },
        {
            topic: 'Sökbarhet av material och dess innehåll',
            examples: [
                'Beskriv i lärresursens metadata vilket slags material det är fråga om, för vem det är avsett och hur tillgängligheten har beaktats.',
            ],
            details: [
                `<a href="https://koodistot.suomi.fi/codescheme;registryCode=edtech;schemeCode=AccessibilityFeatures/" rel="noopener">Ordlista för tillgänglighetsmetadata</a>`,
                `<a href="https://aoe.fi/#/materiaali/606/" rel="noopener">Lägga till Anvisningar för att lägga till metadata</a>`,
            ],
            howTo: [
                `Metadata är också en del av tillgänglighet. Vi har fälten Tillgänglighetsegenskaper och Hinder för tillgänglighet för information om tillgänglighet. Men andra fält också gör det enklare för andra människor att förstå din lärresurs och dess ändamål.`,
            ],
        },
        {
            topic: 'Materialets användbarhet med olika enheter och i miljöer',
            examples: [
                'Använd filformat och lösningar som gör det möjligt för användaren att anpassa utformningen efter sina behov.',
            ],
            details: [
                `<a href="https://daisy.org/info-help/time-to-use-the-modern-digital-publishing-format/" rel="noopener">Jämförelse av Epub och PDF-format (på engelska)</a>`,
            ],
            howTo: [],
        },
        {
            topic: 'Utnyttja tillgängliga material',
            examples: [
                'När du utnyttjar material som andra producerat i undervisningen ska du kontrollera att materialet är tillgängligt, t.ex. att det har textning.',
            ],
            details: [],
            howTo: [
                'När du utnyttjar material som andra producerat, kan du beteckna deras information på Referens-sidan.',
            ],
        },
    ],
};
