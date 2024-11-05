# AOE

## Teknologiat
Nämä ovat keskeiset AOE järjestelmän käytettävät teknologiat

- PostgreSQL
- MongoDB
- Redis
- ElasticSearch
- Apache Kafka
- AWS S3
- Palvelinteknologiat
  - Spring boot
  - NodeJs
  - Maven
- Web-sovelluksen frontend-teknologiat
  - Angular 14.3.0
  - npm-työkalu riippuvuuksien hakuun
  - TypeScript

## Kehitysympäristö


#### Ajaminen Dockerilla
Koko AOE:n saa paikallisesti ajoon `./start-local-env.sh` skiptin avulla. 
Skripti käynnistää docker compose:n avulla kaikki AOE palvelut, frontin ja riippuvuudet docker kontteihin.

Ympäristössä on myös NGINX, jonka kautta kaikki web sovelluksen https-pyynnöt menevät.

Lokaali AOE käyttää mock OIDC palvelua, jota vasten AOE tekee autentikaation. OIDC mock service:ssä on konfiguroitu yksi käyttäjä: aoeuser/password123.

1) Luo .env tiedostot
- `/aoe-web-backend/.env` 
- `/aoe-streaming-app/.env`
- `aoe-data-analytics/.env`
- `aoe-semantic-apis/.env`
- `aoe-data-services/.env`

2) Lisää sertifikaatti `docker/nginx/nginx-selfsigned.crt` oman koneesi luotettuihin serfikaatteihin, selaimat sallivat itse allekirjoitetun varmenteen käytön. 

3) Lisää oman koneesi host tiedostoon seuraavat rivit
- 127.0.0.1       aoe-oidc-server
- 127.0.0.1       demo.aoe.fi

4) Aja projektin juuressa `./start-local-env.sh`
- Selaimella AOE web sovellukseen pääsee url:lla https://demo.aoe.fi/


