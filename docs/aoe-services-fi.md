# Palvelut

## 1. aoe-web-frontend

**Angular 20** (TypeScript) | Tarjoillaan OpenResty/Nginxillä

Käyttäjille näkyvä single-page-sovellus. Sitä käytetään sitä oppimateriaalien selaamiseen, hakemiseen, julkaisemiseen, arvioimiseen ja järjestämiseen. Tarjoaa myös ylläpitokäyttöliittymän moderointiin, analytiikkaan ja materiaalien hallintaan sekä upotettavan materiaalinäkymän kolmansien osapuolten sivustoille. Tukee suomea, englantia ja ruotsia.

**Frontendilla ei ole suoraa tietokantayhteyttä.** Kaikki data kulkee HTTP-kutsujen kautta kolmeen backend-palveluun:

| Backend                        | URL-konfiguraatio         | Mitä se hakee                                                                                                                                                            |
| ------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| web-backend (v1)               | `/api/v1`                 | Oppimateriaalit, kokoelmat, käyttäjätiedot, arviot, tiedostolataukset, tunnistautuminen                                                                                  |
| web-backend (v2)               | `/api/v2`                 | Haku, materiaalien lähetys, thumbnailit, ilmoitukset                                                                                                                     |
| semantic-apis                  | `/ref/api/v1`             | Viitetiedot kaikkiin lomakkeiden pudotusvalikoihin ja suodattimiin — koulutusasteet, oppiaineet, asiasanat, lisenssit, saavutettavuusominaisuudet, organisaatiot, kielet |
| data-analytics (proxyn kautta) | `/api/v2/statistics/prod` | Ylläpitonäkymän tilastot — materiaalien aktiivisuus ja hakupyyntöjen kokonaismäärät aikaväleittäin, jakaumat koulutusasteen/oppiaineen/organisaation mukaan              |
| web-backend (embed)            | `/embed`                  | Materiaalidata upotettavaa iframe-näkymää varten                                                                                                                         |

Tilastokutsut menevät osoitteeseen `/api/v2/statistics/prod`, jonka web-backend välittää edelleen data-analytics-palvelulle (frontend ei tiedä data-analytics-palvelusta suoraan).

#### Tulevaisuus: S3 + CloudFront ECS:n tilalle

Tämä palvelu ei tarvitse konttia. Nginx-konfiguraatio ei tee käytännössä mitään — se tarjoilee staattisia tiedostoja ilman URL-uudelleenkirjoituksia, proxy-sääntöjä, mukautettuja
otsakkeita tai Lua-skriptejä. Ainoa dynaaminen toiminto on, että entrypoint.sh kirjoittaa käynnistyksessä /assets/config/config.json-tiedoston ympäristömuuttujan (ENV)
perusteella. Tämä konfiguraatiotiedosto kertoo Angular-sovellukselle, missä ympäristössä se toimii.

S3 + CloudFront -siirtymää varten konfiguraatiotiedosto pitäisi generoida build/deploy-putkessa ympäristökohtaisesti konttikäynnistyksen sijaan. Kun tämä on hoidettu, frontend on
puhtaasti staattisia tiedostoja ja voidaan tarjoilla S3:sta CloudFrontin takaa — poistaen yhden ECS-palvelun ja OpenResty-riippuvuuden kokonaan.

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

**Kafka — julkaisee analytiikkatapahtumia kahteen aiheeseen:**

| Topic                    | Tapahtuma                                            | Payload                                                                                                      |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `prod_material_activity` | Käyttäjä katsoo, muokkaa, avaa tai lataa materiaalin | `{timestamp, eduMaterialId, interaction, metadata: {organizations, educationalLevels, educationalSubjects}}` |
| `prod_search_requests`   | Käyttäjä tekee haun                                  | `{timestamp, keywords, filters}`                                                                             |

User-agentit, jotka vastaavat `KAFKA_EXCLUDED_AGENT_IDENTIFIERS`-asetusta (esim. `oersi`), jätetään pois.

### Yhteydet muihin AOE-palveluihin:

| Palvelu            | Miten                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **streaming-app**  | Kun tiedostolatauksessa on `Range`-otsake ja tiedosto täyttää suoratoiston kriteerit (MIME-tyyppi kuuluu joukkoon `[audio/mp4, audio/mpeg, audio/x-m4a, video/mp4]`, tiedostokoko >= `STREAM_FILESIZE_MIN`). Jo ehdot toteutuu, se vastaa **HTTP 302** -ohjauksella ja ohjaa selaimen osoitteeseen `/stream/api/v1/material/{filename}`. Muussa tapauksessa se palvelee tiedoston suoraan S3:sta. |
| **data-analytics** | Polku `/api/v2/statistics` proxytetään `http-proxy-middleware`:llä osoitteeseen `http://aoe-data-analytics:8080/analytics/api`. Frontend kutsuu tätä ylläpitonäkymän tilastoja varten.                                                                                                                                                                                                            |
| **data-services**  | Ei suoria kutsuja. Data-services kutsuu backendiä, ei toisin päin.                                                                                                                                                                                                                                                                                                                                |
| **semantic-apis**  | Ei suoria kutsuja. Vain frontend kutsuu semantic-apis-palvelua.                                                                                                                                                                                                                                                                                                                                   |

**Tunnistautuminen:** OIDC Passport.js:n kautta. Selvittää issuerin osoitteesta `PROXY_URI`, ohjaa käyttäjät kirjautumaan scopeilla `openid profile offline_access`, käsittelee paluun osoitteessa `/api/secure/redirect` ja luo uudet käyttäjät automaattisesti PostgreSQL:ään.

**Ajastetut tehtävät:**

| Aika (UTC)              | Tehtävä                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| 1:00 AM                 | Siivoa väliaikaiset H5P- ja HTML-hakemistot                                 |
| 1:15 AM                 | Luo URNit julkaisemattomille materiaaleille (jos käytössä)                  |
| 1:30 AM                 | Indeksoi OpenSearch uudelleen viimeisimpien materiaalimuutosten perusteella |
| 10:00 AM                | Lähetä vanhenemis- ja arviointi-ilmoitussähköpostit AWS SES:n kautta        |
| Käynnistyksessä (+10 s) | Muunna odottavat Office-tiedostot PDF:iksi ja lataa S3:een                  |

---

## 3. aoe-streaming-app

**Node.js / Express 5** (TypeScript) | Portti 3001

Tilaton mediasuoratoistoproxy S3:n ja selaimen välissä. Sen tarkoitus on erottaa paljon I/O:ta kuormittava suoratoisto pääbackendistä ja tukea HTTP Range -pyyntöjä videon/äänen kelaamista varten.

**Selain ei koskaan kutsu tätä palvelua suoraan.** Kulku on seuraava:

1. Selain pyytää tiedoston latausta web-backendiltä
2. Web-backend tarkistaa: onko suoratoisto käytössä, onko `Range`-otsake, onko MIME-tyyppi audio/video, onko tiedosto riittävän suuri?
3. Jos kaikki ehdot täyttyvät, web-backend vastaa **HTTP 302** → `/stream/api/v1/material/{filename}`
4. Selain seuraa ohjausta suoratoistopalveluun
5. Suoratoistopalvelu tekee HEAD-pyynnön S3:een tiedoston metatietoja varten ja suoratoistaa sitten tiedoston takaisin Range-tuella

**Ainoa yhteys:** AWS S3 (vain luku)

**Endpointit:**

- `GET /stream/api/v1/material/:filename` — suoratoistaa tiedoston S3:sta
- `HEAD /stream/api/v1/material/:filename` — palauttaa tiedoston metatiedot (käytetään web-backendin terveystarkistuksessa)
- `GET /health` — terveystarkistus

---

## 4. aoe-semantic-apis

**Node.js / Express 5** (TypeScript)

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

**Kuka kutsuu Semantic-apia:** Vain frontend, `koodistoUrl`-osoitteen (`/ref/api/v1`) kautta. Backend ei kutsu semantic-apis-palvelua.

**REST-endpointit** (kaikki polun `/ref/api/v1` alla):

Yksinkertaiset resurssit: `/asiasanat/{lang}`, `/organisaatiot/{lang}`, `/koulutusasteet/{lang}`, `/kielet/{lang}`, `/lisenssit/{lang}`, `/oppimateriaalityypit/{lang}`, `/kohderyhmat/{lang}`, `/kayttokohteet/{lang}`, `/saavutettavuudentukitoiminnot/{lang}`, `/saavutettavuudenesteet/{lang}`, `/tieteenalat/{lang}`

Hierarkkiset resurssit (parent ID:t mukana): `/oppiaineet/{lang}`, `/tavoitteet/{ids}/{lang}`, `/sisaltoalueet/{ids}/{lang}`, `/lukio-oppiaineet/{lang}`, `/lukio-moduulit/{ids}/{lang}`, `/ammattikoulu-tutkinnot/{lang}`, `/ammattikoulu-tutkinnon-osat/{ids}/{lang}` ja muita.

Yhdistetty suodatinendpoint: `/filters-oppiaineet-tieteenalat-tutkinnot/{lang}`

#### Tulevaisuus: yhdistetään web-backendiin

Suunnitelmana on siirtää viitetietojen haku- ja tarjoamislogiikka web-backendiin. Ulkoisten API-rajapintojen integraatioista (Opintopolku, Finto, Suomi.fi) tulisi backendin ajastettu työ, samaan tapaan kuin nykyinen yöllinen OpenSearch-uudelleenindeksointi. Redis-välimuistin sijaan viitetiedot tallennettaisiin PostgreSQL:ään — data päivittyy vain kerran viikossa, joten erilliselle välimuistille ei ole tarvetta. Backend tarjoaisi samat `/ref/api/v1`-endpointit, joten frontendiin ei tarvittaisi muutoksia.

**Mitä tämä poistaa:** Yhden ECS-palvelun, yhden CDK-stackin, yhden docker imagen, yhden julkaisuputken ja Redisin käyttö vähenee. (Jotta senkin voisi myöhemmin poistaa)

**Mitä tämä vaatii:** Ulkoisten API-kutsujen toteuttamisen uudelleen (mukaan lukien Finton RDF+XML-parsinta) sekä REST-endpointtien toteuttamisen TypeScriptillä backendissä. Uuden PostgreSQL-taulun (tai taulujen) normalisoidun viitedatan tallentamista varten.

---

## 5. aoe-data-analytics

**Java 17 / Spring Boot 3.5** | endpoint `/analytics/api`

Analytiikan ETL-prosessori. Kuluttaa analytiikkatapahtumia Kafkasta, tallentaa ne MongoDB:hen ja tarjoaa REST-endpointit aggregoitujen tilastojen kyselyyn. Web-backend välittää `/api/v2/statistics` -pyynnöt tänne.

**Kafka-kulutus:**

| Topic                    | Kuluttajaryhmä                 | Sisältö                                                                                        |
| ------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------- |
| `prod_material_activity` | `group-prod-material-activity` | Materiaalin katselu-, muokkaus-, avaus- ja lataustapahtumat, joissa on mukana koulutusmetadata |
| `prod_search_requests`   | `group-prod-search-requests`   | Haut avainsanoilla ja suodattimilla                                                            |

Tapahtumat saapuvat JSONina ja tallennetaan MongoDB:hen.

**MongoDB-kokoelmat:**

| Kokoelma            | Dokumentin sisältö                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `material_activity` | `{sessionId, timestamp, eduMaterialId, interaction, metadata: {organizations, educationalLevels, educationalSubjects}}` |
| `search_requests`   | `{sessionId, timestamp, keywords, filters: {educationalLevels, educationalSubjects, learningResourceTypes}}`            |

**PostgreSQL (vain luku):** Hakee tietoa SQL tietokannasta laskeakseen materiaalien määrät koulutusasteen, oppiaineen ja organisaation mukaan. Tätä käytetään "julkaistut materiaalit" -tilastoihin, ei aikasarja-aktiivisuusdataan.

**REST-endpointit** (frontend kutsuu web-backend-proxyn kautta):

| Endpoint                                                  | Tarkoitus                                                       |
| --------------------------------------------------------- | --------------------------------------------------------------- |
| `POST /statistics/prod/materialactivity/{interval}/total` | Materiaalivuorovaikutusten aikasarja (interval: DAY/WEEK/MONTH) |
| `POST /statistics/prod/searchrequests/{interval}/total`   | Hakupyyntöjen aikasarja                                         |
| `POST /statistics/prod/educationallevel/all`              | Materiaalien määrä koulutusasteittain                           |
| `POST /statistics/prod/educationallevel/expired`          | Vanhenevat materiaalit koulutusasteittain                       |
| `POST /statistics/prod/educationalsubject/all`            | Materiaalien määrä oppiaineittain                               |
| `POST /statistics/prod/organization/all`                  | Materiaalien määrä organisaatioittain                           |

Kaikki endpointit hyväksyvät päivämäärävälin parametreina ja palauttavat aggregoidut tulokset

---

## 6. aoe-data-services

**Java 17 / Spring Boot 3.5** | Endpoint `/meta`

OAI-PMH-palvelu (Open Archives Initiative Protocol for Metadata Harvesting). Julkaisee AOE-materiaalien metatiedot standardoidussa XML-muodossa, jotta ulkoiset kirjastoluettelot, institutionaaliset repositoriot ja metadatan aggregaattorit voivat haravoida ne.

**Tämä on ulospäin näkyvä integraatiopalvelu.** Mikään AOE-palvelu ei kutsu sitä — vain ulkoiset harvesterit.

**Datan kulku:** Ulkoinen harvesteri → data-services → web-backend → PostgreSQL

Kun harvesteri lähettää OAI-PMH-pyynnön, data-services tekee POST-pyynnön web-backendin osoitteeseen `https://aoe.fi/api/v1/oaipmh/metadata` päivämääräväli- ja sivutusparametreilla. Web-backend kutsuu PostgreSQL:ää ja palauttaa JSONin. Data-services muuntaa tämän sitten LRMI/DublinCore-XML:ksi.

**Kaksi endpoint-varianttia:**

| Endpoint          | Tunnisteen muoto         | Toiminta                                                        |
| ----------------- | ------------------------ | --------------------------------------------------------------- |
| `/meta/oaipmh`    | `oai:aoe.fi:{id}`        | Normaali haravointi, sisältää poistetut tietueet                |
| `/meta/v2/oaipmh` | `oai:aoe.fi:{id}-{date}` | URN-pohjainen, kaikki versiot, ei sisällä poistettuja tietueita |

**Tuetut OAI-PMH-verbit:** `Identify`, `ListRecords`, `ListIdentifiers`, `GetRecords`

**Tulostusmuoto:** OAI-PMH XML, joka kapseloi DublinCore- (`dc:`) ja LRMI-FI- (`lrmi_fi:`) metadatan — otsikot, kuvaukset, tekijät, asiasanat, koulutusasteet, saavutettavuusominaisuudet, lisenssit, opetussuunnitelmakohdistukset, kielikoodit ja linkitetyt resurssit.

Tilaton — ei suoria tietokantayhteyksiä

#### Tulevaisuus: yhdistetään web-backendiin

Tämä palvelu on ehdolla poistettavaksi samasta syystä kuin semantic-apis: arkkitehtuurin yksinkertaistamiseksi.

Backendissä on jo OAI-PMH-kyselylogiikka, jota data-services kutsuu (`/api/v1/oaipmh/metadata`). Ainoa asia, jonka data-services lisää, on JSONin muuntaminen LRMI/DublinCore-muotoiseksi XML:ksi. Tämä muunnos toteutettaisiin uudelleen TypeScriptillä ja OAI-PMH-endpointit tarjottaisiin suoraan backendistä.

**XML-ulostulon on oltava identtinen nykyisen Java-toteutuksen kanssa.** Ulkoiset harvesterit ovat riippuvaisia formaatista. Integraatiotestien tulisi verrata uutta TypeScript toteutusta nykyisen Java-palvelun vastauksiin, jotta tavutason oikeellisuus voidaan varmistaa ennen käyttöönottoa.

**Mitä tämä poistaa:** Yhden ECS-palvelun, yhden CDK-stackin, yhden docker imagen, yhden julkaisuputken ja toisen kahdesta Java/Spring Boot -palvelusta.

**Mitä tämä vaatii:** Palvelun toteuttamisen uudelleen TypeScriptillä sekä integraatiotestit, jotka varmistavat rajapinnan toiminnan samanlaiseksi kuin ennenkin.
