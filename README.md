# AOE

## Teknologiat
Nämä ovat keskeiset AOE järjestelmän käytettävät teknologiat

- Aurora PostgresSQL
- DocumentDB
- ElastiCache Redis OSS
- OpenSearch -hakuideksi
- AWS MSK Kafka
- AWS S3
- Palvelinteknologiat
  - Spring boot
  - NodeJs
  - Maven-build-työkalu kehityskäyttöön ja asennettavan paketin rakentamiseen
- Web-sovelluksen frontend-teknologiat
  - Angular
  - npm-työkalu riippuvuuksien hakuun
  - TypeScript

## Kehitysympäristö

### .env tiedostojen hakeminen
AOE:n service projektit vaatii .env tiedostot jotka voi ladata `./scripts/fetch_secrets.sh` skriptin avulla AWS:stä.
Skripti kopioi AWS S3:sta .env tiedostot projekteihin. Huom skripti tarvitsee toimiakseen aws sso sisäänkirjautumisen.

### S3 .env datan päivittäminen
AWS S3 .env datan voi päivitää käyttäen `./scripts/update_secrets.sh` skriptiä
1) Päivitä .env tiedosto(t) projektien juuressa.
- `/aoe-web-backend/.env`
- `/aoe-streaming-app/.env`
- `/aoe-data-analytics/.env`
- `/aoe-semantic-apis/.env`
- `/aoe-data-services/.env`
2) Aja `./scripts/update_secrets.sh`

#### Ajaminen Dockerilla
Koko AOE:n saa paikallisesti ajoon `./start-local-env.sh` skiptin avulla. 
Skripti käynnistää docker compose:n avulla kaikki AOE palvelut, frontin ja riippuvuudet docker kontteihin.

Ympäristössä on myös NGINX, jonka kautta kaikki web sovelluksen https-pyynnöt menevät.

Lokaali AOE käyttää mock OIDC palvelua, jota vasten AOE tekee autentikaation. OIDC mock service:ssä on konfiguroitu yksi käyttäjä: aoeuser/password123.

1) Lisää oman koneesi host tiedostoon seuraavat rivit
- 127.0.0.1       aoe-oidc-server
- 127.0.0.1       demo.aoe.fi

2) Aja projektin juuressa `./start-local-env.sh`
- Skripti lataa tarvittaessa .env tiedostot AWS S3:sta
- Skipti luo itseallekirjoitetun varmenteen hakemistoon `docker/dev/nginx/nginx-selfsigned.crt`
- Lisää varmenne `docker/dev/nginx/nginx-selfsigned.crt` oman koneesi luotettuihin varmenteisiin, selaimat sallivat itseallekirjoitetun varmenteen käytön.

4. Selaimella AOE web sovellukseen pääsee url:lla https://demo.aoe.fi/


#### aws config:

[sso-session oph-federation]
sso_session=oph-federation
sso_region=eu-west-1
sso_start_url = https://oph-aws-sso.awsapps.com/start
sso_registration_scopes = sso:account:access

[profile aoe-dev]
sso_session = oph-federation
sso_account_id = 339713180834
sso_role_name = AdministratorAccess
region = eu-west-1
output = json

[profile aoe-qa]
sso_session = oph-federation
sso_account_id = 058264216444
sso_role_name = AdministratorAccess
region = eu-west-1
output = json

[profile aoe-prod]
sso_session = oph-federation
sso_account_id = 381492241240
sso_role_name = AdministratorAccess
region = eu-west-1
output = json
