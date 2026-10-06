# AOE ECS Services Overview

AOE (Avoimet Oppimateriaalit - Library of Open Educational Resources) runs one backend service on AWS ECS Fargate, built with Node.js/TypeScript, and serves its Angular frontend as static files from S3.

## Request Routing

All traffic enters through CloudFront. Its default cache behavior serves the frontend from S3, and every backend path has an explicit behavior forwarding to the Application Load Balancer, where path-based rules pick the service. Anything without a matching behavior therefore lands on S3 — which is why the backend patterns are enumerated rather than wildcarded.

| Path Pattern | CloudFront Origin | Then | Container Port |
|---|---|---|---|
| `/api/*`, `/h5p/*`, `/embed/material/*`, `/embed/download/*`, `/embed/pdf/*`, `/content/*`, `/ref/api/v1*`, `/meta/oaipmh*`, `/meta/v2/oaipmh*` | ALB | web-backend | 8080 |
| `/stream/api/v1*` | ALB | web-backend (301 to `/api/v1/download/*`) | 8080 |
| everything else, including `/embed/:id/:lang` | S3 (`aoe-frontend-<env>`) | — | — |

The three `/embed/` subpaths are listed individually on purpose: `/embed/:id/:lang` is an Angular route that must reach S3, so collapsing them to `/embed/*` would send the embed view to the backend.

Each listener rule matches on its path patterns and on an origin verification header that CloudFront adds to origin requests. A request matching no rule falls through to the listener's default action, a fixed `404 Not Found` in `aoe-infra/lib/alb-stack.ts`.

Both sides resolve the header value from the same secret, so rotating it means updating the secret and redeploying the CloudFront stack before the ECS service stacks.

## Services

### 1. aoe-web-frontend

**Angular 21** (TypeScript) | Served from S3 behind CloudFront

The user-facing single-page application. Educators and learners use it to browse, search, publish, rate, and organize educational materials. Also provides an admin interface for moderation, analytics, and material management, and an embeddable material view for third-party sites. Supports Finnish, English, and Swedish.

**The frontend has no direct database access.** All data flows through HTTP calls to three backend services:

| Backend | URL Config | What it fetches |
|---|---|---|
| web-backend (v1) | `/api/v1` | Materials, collections, user data, ratings, file downloads, authentication |
| web-backend (v2) | `/api/v2` | Search, material uploads, thumbnails, notifications |
| web-backend (reference data) | `/ref/api/v1` | Reference data for all form dropdowns and filters — educational levels, subjects, keywords, licenses, accessibility features, organizations, languages (30+ categories) |
| web-backend (statistics) | `/api/v2/statistics/prod` | Admin dashboard statistics — material activity and search request totals by time interval, distributions by educational level/subject/organization |
| web-backend (embed) | `/embed` | Material data for the embeddable iframe view |

#### How the static site is delivered

The app is a pure client-side SPA with no startup-time configuration — it calls the backend over relative URLs, so one build serves every environment. `aoe-infra/lib/cloudfront-stack.ts` defines the delivery layer for dev, qa and prod alike:

`npm run build --configuration production` emits `dist` with content-hashed filenames, and `deploy-scripts/deploy.sh` runs it before `cdk`, because the bucket deployment stages `dist` as a CDK asset at synth time. `aoe-infra/lib/frontend-stack.ts` publishes it in two passes, since `Cache-Control` is set per deployment:

| Group | Contents | `Cache-Control` |
|---|---|---|
| Hashed output | bundles, `media/`, sourcemaps | `public, max-age=31536000, immutable` |
| Entry points | `index.html`, `i18n/*`, `robots.txt`, `assets/*` | `no-cache` |

Neither pass prunes, so a client holding an older `index.html` can still fetch the chunks it references. The entry-point pass depends on the hashed one, so `index.html` never lands before them, and it submits a `/*` invalidation.

The bucket is private and reached only through Origin Access Control. Deep links have no S3 key of their own, so `resources/functions/viewer-request.js` rewrites any path with no file extension to `/index.html` — the replacement for Nginx's `try_files` — while backend prefixes and anything with an extension pass through untouched. The same function carries the basic-auth gate in dev and qa, attached to every behavior so the protection covers the backend paths as well as the SPA; in prod no credentials are configured and it only rewrites.

Local development is the exception: `docker-compose.local-dev.yml` runs the Angular dev server (`ng serve`, from `aoe-web-frontend/docker/Dockerfile.local`) behind a local nginx, and CI's Playwright stack serves `dist` from an nginx container. Neither involves CloudFront, so the routing table and the path rewrite above are exercised only in a deployed environment.

---

### 2. aoe-web-backend

**Node.js / Express 5** (TypeScript) | Port 3000

The central API service. Handles all business logic: material CRUD, file uploads and downloads, collection management, user authentication, search indexing, H5P interactive content, and analytics event publishing. Exposes both v1 and v2 REST APIs.

**Databases:**

| Database | Purpose |
|---|---|
| **PostgreSQL** | Primary store — users, materials, versions, records, attachments, collections, ratings, notifications, URNs |
| **Redis** | Session storage via express-session + connect-redis |
| **OpenSearch** | Full-text search indices for materials (`aoe` index) and collections (`aoecollection` index). Re-indexed nightly at 1:30 AM UTC |

**Cloud storage (S3):**

| Bucket | Contents |
|---|---|
| `aoe` | Educational material files (audio, video, documents, H5P packages) |
| `aoepdf` | Office-to-PDF conversions (via LibreOffice) |
| `aoethumbnail` | Material and collection thumbnail images |

**Analytics events** are written directly to PostgreSQL (`material_activity` and `search_requests` tables). User-agents matching `ANALYTICS_EXCLUDED_AGENT_IDENTIFIERS` (e.g. `oersi`) are excluded.

**Media byte ranges:** a download of an audio or video file (`audio/mp4`, `audio/mpeg`, `audio/x-m4a`, `video/mp4`) of at least 100 000 bytes with a single `Range: bytes=start-end` header is answered with **HTTP 206 Partial Content** straight from S3, so players can seek. Other downloads get the whole file. The old streaming URL `/stream/api/v1/material/{filename}` answers **HTTP 301** to `/api/v1/download/{filename}`.

**Authentication:** OIDC via Passport.js. Discovers the issuer at `PROXY_URI`, redirects users for login with `openid profile offline_access` scopes, handles the callback at `/api/secure/redirect`, and auto-creates new users in PostgreSQL.

**Scheduled jobs:**

Each job runs on one task only: the first task to insert the day's row into `scheduled_task_run` runs it, and the others log a skip. Each job can be turned off with `SCHEDULED_TASK_<NAME>_ENABLED=false` (on by default).

| Time (UTC) | Job | Switch |
|---|---|---|
| 1:00 AM | Clean temporary H5P and HTML directories | `SCHEDULED_TASK_DIRECTORY_CLEANING_ENABLED` |
| 1:15 AM | Generate URNs for unpublished materials | `SCHEDULED_TASK_PID_REGISTRATION_ENABLED` |
| 1:30 AM | Fully re-index the material and collection OpenSearch indices | `SCHEDULED_TASK_SEARCH_REINDEX_ENABLED` |
| 2:00 AM | Convert office files without a PDF and upload the PDFs to S3 | `SCHEDULED_TASK_OFFICE_PDF_CONVERSION_ENABLED` |
| 3:00 AM | Update reference data endpoints data into Redis | `SCHEDULED_TASK_REFERENCE_DATA_UPDATE_ENABLED` |
| 10:00 AM | Send expiration and rating notification emails via AWS SES | `SCHEDULED_TASK_NOTIFICATION_MAIL_ENABLED` |

On startup every task also updates the reference data into Redis and creates any missing OpenSearch index (`CREATE_ES_INDEX=1` recreates both; with more than one task, deploy with `min_count: 1` and `max_count: 1` first, so only one task recreates them).


#### Reference Data Endpoints

A metadata aggregation and caching layer. Fetches reference data from Finnish educational APIs, normalizes it into key-value pairs with multi-language labels (fi/sv/en), and caches everything in Redis. The frontend reads this cached data for all form dropdowns and search filters.

**External APIs called:**

| API | URL Base | Data Fetched |
|---|---|---|
| Opintopolku Koodistot | `virkailija.opintopolku.fi/koodisto-service/rest/json` | Upper secondary courses, science branches |
| Opintopolku ePerusteet | `virkailija.opintopolku.fi/eperusteet-service/api` | Curricula for basic education, upper secondary, vocational (subjects, objectives, modules, content areas) |
| Opintopolku Organisaatiot | `virkailija.opintopolku.fi/organisaatio-service/rest` | Educational organizations |
| Finto YSO | `api.finto.fi/rest/v1/yso/data` | Keywords/thesaurus (RDF+XML format) |
| Suomi.fi Koodistot | `koodistot.suomi.fi/codelist-api/api/v1/coderegistries` | Educational levels, accessibility features/hazards, educational roles, learning resource types, licenses, languages |

All external calls include a `Caller-Id` header with the organization's OID.

**Redis key pattern:** `{category}.{lang}` — e.g. `asiasanat.fi`, `koulutusasteet.en`, `lisenssit.sv`

**Data refresh:** Every Sunday at 3:00 AM UTC via node-cron, and once on startup when Redis connection becomes ready.

**Who calls it:** Only the frontend, via `koodistoUrl` (`/ref/api/v1`).

**REST endpoints** (all under `/ref/api/v1`):

Simple resources: `/asiasanat/{lang}`, `/organisaatiot/{lang}`, `/koulutusasteet/{lang}`, `/kielet/{lang}`, `/lisenssit/{lang}`, `/oppimateriaalityypit/{lang}`, `/kohderyhmat/{lang}`, `/kayttokohteet/{lang}`, `/saavutettavuudentukitoiminnot/{lang}`, `/saavutettavuudenesteet/{lang}`, `/tieteenalat/{lang}`

Hierarchical resources (with parent IDs): `/oppiaineet/{lang}`, `/tavoitteet/{ids}/{lang}`, `/sisaltoalueet/{ids}/{lang}`, `/lukio-oppiaineet/{lang}`, `/lukio-moduulit/{ids}/{lang}`, `/ammattikoulu-tutkinnot/{lang}`, `/ammattikoulu-tutkinnon-osat/{ids}/{lang}`, and more.

Combined filter endpoint: `/filters-oppiaineet-tieteenalat-tutkinnot/{lang}`

#### Statistics Endpoints

All under `/api/v2/statistics`, require authentication:

| Endpoint | Purpose |
|---|---|
| `POST /prod/materialactivity/{interval}/total` | Time-series of material interactions (interval: day/week/month) |
| `POST /prod/searchrequests/{interval}/total` | Time-series of search requests |
| `POST /prod/educationallevel/all` | Material count by educational level |
| `POST /prod/educationallevel/expired` | Expiring materials by educational level |
| `POST /prod/educationalsubject/all` | Material count by subject |
| `POST /prod/organization/all` | Material count by organization |

All endpoints accept date range parameters (`since`, `until`) and return aggregated results.

#### OAI-PMH Metadata Provider

An OAI-PMH (Open Archives Initiative Protocol for Metadata Harvesting) provider, exposing AOE material metadata in standardized XML so external library catalogs, institutional repositories, and metadata aggregators can harvest it. It calls the material-metadata query logic in-process (no internal HTTP hop).

**This is an outward-facing integration endpoint** — only external harvesters call it.

**Two endpoint variants:**

| Endpoint | Identifier Format | Behavior |
|---|---|---|
| `/meta/oaipmh` | `oai:<domain>:{id}` | Standard harvesting, includes deleted records |
| `/meta/v2/oaipmh` | `oai:<domain>:{id}-{date}` | URN-based, all versions, omits deleted records |

**OAI-PMH verbs supported:** `Identify`, `ListRecords`, `ListIdentifiers`, `GetRecords`

**Output format:** OAI-PMH XML wrapping DublinCore (`dc:`) and LRMI-FI (`lrmi_fi:`) metadata — titles, descriptions, authors, keywords, educational levels, accessibility features, licenses, curriculum alignments, language codes, and linked resources.

**Pagination:** 20 records per page via resumption tokens (plain page-index integers).

#### Future: Remove Redis

Instead of caching in Redis, the reference data would be stored in PostgreSQL — the data only refreshes once a week, so there is no need for an in-memory cache. The backend would expose the same `/ref/api/v1` endpoints so the frontend requires no changes.

**What this removes:** One CDK stack and the only consumer of Redis for non-session data.

**What this requires:** A new PostgreSQL table (or tables) for storing the normalized reference data.

---

## Technology Summary

| Service | Language | Framework | Port |
|---|---|---|---|
| web-frontend | TypeScript | Angular 21, static files on S3 | — |
| web-backend | TypeScript | Express 5 (Node.js) | 3000 |

## Shared Infrastructure

The backend service runs on an ECS Fargate cluster with:
- **Application Load Balancer** for path-based routing (see routing table above)
- **CloudWatch** monitoring with CPU, memory, health check and failed-deployment (circuit breaker) alarms
- **Service Discovery** via Cloud Map with private DNS namespace
- **Auto-scaling** based on CPU utilization
- **ECS Exec** for secure shell access (configurable per environment)
