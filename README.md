# AOE

## Teknologiat

Nämä ovat keskeiset AOE järjestelmän käytettävät teknologiat

- Aurora PostgresSQL
- OpenSearch -hakuindeksi
- AWS S3
- Palvelinteknologiat
  - NodeJs
  - TypeScript
- Web-sovelluksen frontend-teknologiat
  - Angular
  - npm-työkalu riippuvuuksien hakuun
  - TypeScript

## Kehitysympäristö

#### Ajaminen Dockerilla

Yleisimmät komennot (käynnistys, lint, testit, psql, lokit, deploy) näkee komennolla `task`. Ne kutsuvat repositoryn skriptejä [`taskfile.yml`](taskfile.yml):n kautta. Skriptille annettavat argumentit kirjoitetaan `--`:n jälkeen (esim. `task test -- --workers=1`), ja `task --summary <task>` näyttää, mitä argumentteja komento ottaa. `task` on [go-task](https://taskfile.dev): `brew install go-task`.

Koko AOE:n saa paikallisesti ajoon komennolla `task start` (kutsuu `./start-local-env.sh`-skriptiä).
Skripti käynnistää docker compose:n avulla kaikki AOE palvelut, frontin ja riippuvuudet docker kontteihin.

Ympäristössä on myös NGINX, jonka kautta kaikki web sovelluksen https-pyynnöt menevät.

Lokaali AOE käyttää paikallista OIDC-palvelua (Keycloak), jota vasten AOE tekee autentikaation. Palveluun on esikonfiguroitu kaksi käyttäjää: aoeuser/password123 ja tuomas.jukola/password123.

1. Lisää oman koneesi host tiedostoon seuraavat rivit

- 127.0.0.1 aoe-oidc-server
- 127.0.0.1 demo.aoe.fi

2. Aja projektin juuressa `task start`

- Skripti luo itseallekirjoitetun varmenteen hakemistoon `docker/dev/nginx-selfsigned.crt`
- Lisää varmenne `docker/dev/nginx-selfsigned.crt` oman koneesi luotettuihin varmenteisiin, selaimat sallivat itseallekirjoitetun varmenteen käytön.

3. Selaimella AOE web sovellukseen pääsee url:lla https://demo.aoe.fi/

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

## Testien ajaminen

Testit ajetaan normaalisti komennolla `task test` (kutsuu `./run-tests.sh`-skriptiä) ja Playwrightin UI:n saa näkyviin
komennolla `task test:ui`. Lokaalisti ajettaessa testit käyttävät oletuksena useampaa workeria, jolloin
testien tulokset eivät ole luotettavia. Testit voi pakottaa ajamaan yhdellä workerilla joko
Playwrightin UI:ssa tai käyttämällä `--workers=1`-flagia komentorivillä (`task test -- --workers=1`). CI ajaa testit aina
yhdellä workerilla.
