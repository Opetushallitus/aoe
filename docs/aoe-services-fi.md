# Palvelut

## 1. aoe-web-frontend

**Angular 21** (TypeScript) | Tarjoillaan S3:sta CloudFrontin takaa

Käyttäjille näkyvä single-page-sovellus. Sitä käytetään sitä oppimateriaalien selaamiseen, hakemiseen, julkaisemiseen, arvioimiseen ja järjestämiseen. Tarjoaa myös ylläpitokäyttöliittymän moderointiin, analytiikkaan ja materiaalien hallintaan sekä upotettavan materiaalinäkymän kolmansien osapuolten sivustoille. Tukee suomea, englantia ja ruotsia.

**Frontendilla ei ole suoraa tietokantayhteyttä.** Kaikki data kulkee HTTP-kutsujen kautta kolmeen backend-palveluun:

| Backend                   | URL-konfiguraatio         | Mitä se hakee                                                                                                                                                            |
| ------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| web-backend (v1)          | `/api/v1`                 | Oppimateriaalit, kokoelmat, käyttäjätiedot, arviot, tiedostolataukset, tunnistautuminen                                                                                  |
| web-backend (v2)          | `/api/v2`                 | Haku, materiaalien lähetys, thumbnailit, ilmoitukset                                                                                                                     |
| web-backend (viitetiedot) | `/ref/api/v1`             | Viitetiedot kaikkiin lomakkeiden pudotusvalikoihin ja suodattimiin — koulutusasteet, oppiaineet, asiasanat, lisenssit, saavutettavuusominaisuudet, organisaatiot, kielet |
| web-backend (tilastot)    | `/api/v2/statistics/prod` | Ylläpitonäkymän tilastot — materiaalien aktiivisuus ja hakupyyntöjen kokonaismäärät aikaväleittäin, jakaumat koulutusasteen/oppiaineen/organisaation mukaan              |
| web-backend (embed)       | `/embed`                  | Materiaalidata upotettavaa iframe-näkymää varten                                                                                                                         |

#### Miten staattinen sivusto tarjoillaan

Sovellus on puhdas selainpuolen SPA, jolla ei ole käynnistyksen aikaista konfiguraatiota — se kutsuu backendiä suhteellisilla URL-osoitteilla, joten yksi build palvelee kaikkia
ympäristöjä. `aoe-infra/lib/cloudfront-stack.ts` määrittelee tarjoilukerroksen samalla tavalla dev-, qa- ja prod-ympäristöihin.

`npm run build --configuration production` tuottaa `dist`-hakemiston sisältötiivisteillä nimetyillä tiedostoilla, ja `deploy-scripts/deploy.sh` ajaa buildin ennen `cdk`:tä,
koska bucket deployment paketoi `dist`-hakemiston CDK-assetiksi jo synth-vaiheessa. `aoe-infra/lib/frontend-stack.ts` julkaisee sen kahdessa erässä, koska `Cache-Control`
asetetaan erä kerrallaan:

| Erä               | Sisältö                                                | `Cache-Control`                         |
| ----------------- | ------------------------------------------------------ | --------------------------------------- |
| Tiivisteellä nimetyt | bundlet, `media/`, sourcemapit                      | `public, max-age=31536000, immutable`   |
| Sisäänmenopisteet | `index.html`, `i18n/*`, `robots.txt`, `assets/*`        | `no-cache`                              |

Kumpikaan erä ei poista vanhoja objekteja, joten vanhaa `index.html`-tiedostoa käyttävä selain saa edelleen haettua siihen viittaavat chunkit. Sisäänmenopisteiden erä riippuu
tiivisteellä nimettyjen erästä, joten `index.html` ei koskaan päädy bucketiin ennen niitä, ja se lähettää `/*`-invalidoinnin.

Bucket on yksityinen ja siihen päästään vain Origin Access Controlin kautta. Syvälinkeillä ei ole omaa S3-avainta, joten `resources/functions/viewer-request.js` kirjoittaa
jokaisen tiedostopäätteettömän polun muotoon `/index.html` — tämä korvaa Nginxin `try_files`-säännön — kun taas backend-prefiksit ja tiedostopäätteelliset polut menevät läpi
koskemattomina. Sama funktio hoitaa dev- ja qa-ympäristöjen basic auth -suojauksen, ja se on kiinnitetty jokaiseen behavioriin, jotta suojaus kattaa backend-polut siinä missä
SPA:n. Prodissa tunnuksia ei ole määritelty, joten funktio vain uudelleenkirjoittaa polut.

CloudFront lisää origin-pyyntöihin varmennusotsakkeen, ja jokainen ALB:n kuuntelijasääntö vaatii sen polkuehtojen lisäksi. Pyyntö joka ei osu yhteenkään sääntöön päätyy
kuuntelijan oletustoimintoon eli kiinteään `404`-vastaukseen.

Paikallinen kehitysympäristö on poikkeus: `docker-compose.local-dev.yml` ajaa Angularin kehityspalvelinta (`ng serve`, tiedostosta `aoe-web-frontend/docker/Dockerfile.local`)
paikallisen nginxin takana, ja CI:n Playwright-ympäristö tarjoilee `dist`-hakemiston nginx-kontista. Kumpikaan ei kulje CloudFrontin kautta, joten reititystaulu ja yllä kuvattu
polun uudelleenkirjoitus toteutuvat vain deployatussa ympäristössä.

---

## 2. aoe-web-backend

**Node.js / Express 5** (TypeScript)

Keskeinen API-palvelu. Hoitaa kaiken liiketoimintalogiikan: materiaalien CRUD-operaatiot, tiedostojen lähetys ja lataus, kokoelmien hallinta, käyttäjien tunnistautuminen, haun indeksointi, H5P-interaktiivinen sisältö ja analytiikkatapahtumien julkaisu. Julkaisee sekä v1- että v2-REST-rajapinnat.

**Tietokannat:**

| Tietokanta     | Tarkoitus                                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **PostgreSQL** | Ensisijainen tietovarasto — käyttäjät, materiaalit, versiot, tietueet, liitteet, kokoelmat, arviot, ilmoitukset, URNit                       |
| **Redis**      | Istuntotallennus express-sessionin + connect-redisin kautta                                                                                  |
| **OpenSearch** | Oppimateriaalien (`aoe`-indeksi) ja kokoelmien (`aoecollection`-indeksi) kokotekstihakuindeksit. Indeksoidaan uudelleen joka yö klo 1.30 UTC |

**Pilvitallennus (S3):**

| Bucket         | Sisältö                                                        |
| -------------- | -------------------------------------------------------------- |
| `aoe`          | Oppimateriaalitiedostot (ääni, video, asiakirjat, H5P-paketit) |
| `aoepdf`       | Office-tiedostojen PDF-muunnokset (LibreOfficen kautta)        |
| `aoethumbnail` | Materiaalien ja kokoelmien pikkukuvat                          |

**Analytiikkatapahtumat** kirjoitetaan suoraan PostgreSQL:ään (`material_activity`- ja `search_requests`-tauluihin). User-agentit, jotka vastaavat `ANALYTICS_EXCLUDED_AGENT_IDENTIFIERS`-asetusta (esim. `oersi`), jätetään pois.

**Median tavualueet:** Kun vähintään 100 000 tavun ääni- tai videotiedoston (`audio/mp4`, `audio/mpeg`, `audio/x-m4a`, `video/mp4`) latauksessa on yksi `Range: bytes=alku-loppu` -otsake, backend vastaa **HTTP 206 Partial Content** -vastauksella suoraan S3:sta, jotta soittimet voivat kelata. Muut lataukset saavat koko tiedoston. Vanha suoratoisto-osoite `/stream/api/v1/material/{filename}` vastaa **HTTP 301** -ohjauksella osoitteeseen `/api/v1/download/{filename}`.

**Tunnistautuminen:** OIDC Passport.js:n kautta. Selvittää issuerin osoitteesta `PROXY_URI`, ohjaa käyttäjät kirjautumaan scopeilla `openid profile offline_access`, käsittelee paluun osoitteessa `/api/secure/redirect` ja luo uudet käyttäjät automaattisesti PostgreSQL:ään.

**Ajastetut tehtävät:**

Jokainen tehtävä ajetaan vain yhdessä taskissa: tehtävän ajaa se task, joka ehtii ensin lisätä päivän rivin tauluun `scheduled_task_run`, ja muut kirjaavat ohituksen lokiin. Jokaisen tehtävän voi kytkeä pois asetuksella `SCHEDULED_TASK_<NIMI>_ENABLED=false` (oletuksena päällä).

| Aika (UTC) | Tehtävä | Kytkin |
| ---------- | ------- | ------ |
| 1:00 AM    | Siivoa väliaikaiset H5P- ja HTML-hakemistot | `SCHEDULED_TASK_DIRECTORY_CLEANING_ENABLED` |
| 1:15 AM    | Luo URNit julkaisemattomille materiaaleille | `SCHEDULED_TASK_PID_REGISTRATION_ENABLED` |
| 1:30 AM    | Indeksoi materiaali- ja kokoelmaindeksit kokonaan uudelleen OpenSearchiin | `SCHEDULED_TASK_SEARCH_REINDEX_ENABLED` |
| 2:00 AM    | Muunna Office-tiedostot, joilta puuttuu PDF, ja lataa PDF:t S3:een | `SCHEDULED_TASK_OFFICE_PDF_CONVERSION_ENABLED` |
| 3:00 AM    | Päivitä viitetietorajapintojen tiedot Redikseen | `SCHEDULED_TASK_REFERENCE_DATA_UPDATE_ENABLED` |
| 10:00 AM   | Lähetä vanhenemis- ja arviointi-ilmoitussähköpostit AWS SES:n kautta | `SCHEDULED_TASK_NOTIFICATION_MAIL_ENABLED` |

Käynnistyessään jokainen task päivittää lisäksi viitetiedot Redikseen ja luo puuttuvat OpenSearch-indeksit (`CREATE_ES_INDEX=1` luo molemmat uudelleen; koska taskeja on useampi, julkaise ensin `min_count: 1` ja `max_count: 1`, jotta vain yksi task luo indeksit uudelleen).

#### Viitetietorajapinnat

Metadatan aggregointi- ja välimuistikerros. Hakee viitetietoja suomalaisista koulutusalan API-rajapinnoista, normalisoi ne avain-arvo-pareiksi monikielisillä nimikkeillä (fi/sv/en) ja tallentaa kaiken Redis-välimuistiin. Frontend lukee tätä välimuistissa olevaa dataa kaikkiin lomakkeiden pudotusvalikoihin ja hakusuodattimiin.

**Kutsuttavat ulkoiset API:t:**

| API                       | URL-pohja                                               | Haettava data                                                                                                           |
| ------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Opintopolku Koodistot     | `virkailija.opintopolku.fi/koodisto-service/rest/json`  | Lukion kurssit, tieteenalat                                                                                             |
| Opintopolku ePerusteet    | `virkailija.opintopolku.fi/eperusteet-service/api`      | Perusopetuksen, lukion ja ammatillisen koulutuksen opetussuunnitelmat (oppiaineet, tavoitteet, moduulit, sisältöalueet) |
| Opintopolku Organisaatiot | `virkailija.opintopolku.fi/organisaatio-service/rest`   | Koulutusorganisaatiot                                                                                                   |
| Finto YSO                 | `api.finto.fi/rest/v1/yso/data`                         | Asiasanat/tesaurus (RDF+XML-muodossa)                                                                                   |
| Suomi.fi Koodistot        | `koodistot.suomi.fi/codelist-api/api/v1/coderegistries` | Koulutusasteet, saavutettavuuden tukitoiminnot/esteet, koulutusroolit, oppimateriaalityypit, lisenssit, kielet          |

Kaikkiin ulkoisiin kutsuihin sisältyy `Caller-Id`-otsake, jossa on organisaation OID.

**Datan päivitys:** Joka sunnuntai klo 3.00 UTC node-cronin kautta sekä kerran käynnistyksessä, kun Redis-yhteys on valmis.

**Kuka kutsuu Semantic-apia:** Vain frontend, `koodistoUrl`-osoitteen (`/ref/api/v1`) kautta.

**REST-endpointit** (kaikki polun `/ref/api/v1` alla):

Yksinkertaiset resurssit: `/asiasanat/{lang}`, `/organisaatiot/{lang}`, `/koulutusasteet/{lang}`, `/kielet/{lang}`, `/lisenssit/{lang}`, `/oppimateriaalityypit/{lang}`, `/kohderyhmat/{lang}`, `/kayttokohteet/{lang}`, `/saavutettavuudentukitoiminnot/{lang}`, `/saavutettavuudenesteet/{lang}`, `/tieteenalat/{lang}`

Hierarkkiset resurssit (parent ID:t mukana): `/oppiaineet/{lang}`, `/tavoitteet/{ids}/{lang}`, `/sisaltoalueet/{ids}/{lang}`, `/lukio-oppiaineet/{lang}`, `/lukio-moduulit/{ids}/{lang}`, `/ammattikoulu-tutkinnot/{lang}`, `/ammattikoulu-tutkinnon-osat/{ids}/{lang}` ja muita.

Yhdistetty suodatinendpoint: `/filters-oppiaineet-tieteenalat-tutkinnot/{lang}`

#### Tilastorajapinnat

Kaikki polun `/api/v2/statistics` alla, vaativat tunnistautumisen:

| Endpoint                                       | Tarkoitus                                                       |
| ---------------------------------------------- | --------------------------------------------------------------- |
| `POST /prod/materialactivity/{interval}/total` | Materiaalivuorovaikutusten aikasarja (interval: day/week/month) |
| `POST /prod/searchrequests/{interval}/total`   | Hakupyyntöjen aikasarja                                         |
| `POST /prod/educationallevel/all`              | Materiaalien määrä koulutusasteittain                           |
| `POST /prod/educationallevel/expired`          | Vanhenevat materiaalit koulutusasteittain                       |
| `POST /prod/educationalsubject/all`            | Materiaalien määrä oppiaineittain                               |
| `POST /prod/organization/all`                  | Materiaalien määrä organisaatioittain                           |

Kaikki rajapinnat hyväksyvät päivämäärävälin parametreina (`since`, `until`) ja palauttavat aggregoidut tulokset.

#### OAI-PMH-metadatarajapinta

OAI-PMH-palvelu (Open Archives Initiative Protocol for Metadata Harvesting). Julkaisee AOE-materiaalien metatiedot standardoidussa XML-muodossa, jotta ulkoiset kirjastoluettelot, institutionaaliset repositoriot ja metadatan aggregaattorit voivat haravoida ne. Kutsuu materiaalimetadatan kyselylogiikkaa prosessin sisäisesti (ei sisäistä HTTP-hyppyä).

**Tämä on ulospäin näkyvä integraatiorajapinta** — vain ulkoiset harvesterit kutsuvat sitä.

**Kaksi endpoint-varianttia:**

| Endpoint          | Tunnisteen muoto           | Toiminta                                                        |
| ----------------- | -------------------------- | --------------------------------------------------------------- |
| `/meta/oaipmh`    | `oai:<domain>:{id}`        | Normaali haravointi, sisältää poistetut tietueet                |
| `/meta/v2/oaipmh` | `oai:<domain>:{id}-{date}` | URN-pohjainen, kaikki versiot, ei sisällä poistettuja tietueita |

**Tuetut OAI-PMH-verbit:** `Identify`, `ListRecords`, `ListIdentifiers`, `GetRecords`

**Tulostusmuoto:** OAI-PMH XML, joka kapseloi DublinCore- (`dc:`) ja LRMI-FI- (`lrmi_fi:`) metadatan — otsikot, kuvaukset, tekijät, asiasanat, koulutusasteet, saavutettavuusominaisuudet, lisenssit, opetussuunnitelmakohdistukset, kielikoodit ja linkitetyt resurssit.

**Sivutus:** 20 tietuetta sivua kohden resumption tokenien avulla (yksinkertaisia sivuindeksilukuja).

#### Tulevaisuus: poistetaan Redis

Redis-välimuistin sijaan viitetiedot tallennettaisiin PostgreSQL:ään — data päivittyy vain kerran viikossa, joten erilliselle välimuistille ei ole tarvetta. Backend tarjoaisi samat `/ref/api/v1`-endpointit, joten frontendiin ei tarvittaisi muutoksia.

**Mitä tämä poistaa:** Yhden CDK-stackin ja Redisin käyttö päättyy.

**Mitä tämä vaatii:** Uuden PostgreSQL-taulun (tai taulujen) normalisoidun viitedatan tallentamista varten.
