# AOE ECS Services Overview

AOE (Avoimet Oppimateriaalit - Library of Open Educational Resources) runs 6 microservices on AWS ECS Fargate. Four are built with Node.js/TypeScript and two with Java/Spring Boot.

## Request Routing

All traffic enters through an Application Load Balancer. Path-based rules route requests to the correct service, with the frontend as the catch-all fallback.

| Path Pattern | Service | Container Port | ALB Priority |
|---|---|---|---|
| `/api/*`, `/h5p/*`, `/embed/*`, `/content/*` | web-backend | 3000 | 120 |
| `/ref/api/v1*` | semantic-apis | 3002 | 100 |
| `/stream/api/v1*` | streaming-app | 3001 | 110 |
| `/meta/oaipmh*`, `/meta/v2/oaipmh*` | data-services | 8001 | 130 |
| `/analytics/api/*` | data-analytics | 8080 | 140 |
| `/*` (catch-all) | web-frontend | 8080 | 49000 |

## Services

### 1. aoe-web-frontend

**Angular 20** (TypeScript) | Served by OpenResty/Nginx on port 8080

The user-facing single-page application. Educators and learners use it to browse, search, publish, rate, and organize educational materials. Also provides an admin interface for moderation, analytics, and material management, and an embeddable material view for third-party sites. Supports Finnish, English, and Swedish.

**The frontend has no direct database access.** All data flows through HTTP calls to three backend services:

| Backend | URL Config | What it fetches |
|---|---|---|
| web-backend (v1) | `/api/v1` | Materials, collections, user data, ratings, file downloads, authentication |
| web-backend (v2) | `/api/v2` | Search, material uploads, thumbnails, notifications |
| semantic-apis | `/ref/api/v1` | Reference data for all form dropdowns and filters — educational levels, subjects, keywords, licenses, accessibility features, organizations, languages (30+ categories) |
| data-analytics (via proxy) | `/api/v2/statistics/prod` | Admin dashboard statistics — material activity and search request totals by time interval, distributions by educational level/subject/organization |
| web-backend (embed) | `/embed` | Material data for the embeddable iframe view |

The statistics calls go to `/api/v2/statistics/prod` which the web-backend proxies through to data-analytics (the frontend doesn't know about data-analytics directly).

#### Future: Replace ECS with S3 + CloudFront

This service doesn't need to run as a container. The Nginx config does almost nothing — it serves static files with no URL rewrites, no proxy rules, no custom headers, and no Lua scripting. The only dynamic behavior is that `entrypoint.sh` writes a `/assets/config/config.json` file at startup with an environment variable (`ENV`). This config file tells the Angular app which environment it's running in.

To move to S3 + CloudFront, the config file would need to be generated as part of the build/deploy pipeline per environment instead of at container startup. Once that's handled, the frontend is purely static files and can be served from S3 behind CloudFront, removing one ECS service, one container image, and the OpenResty dependency entirely.

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

**Kafka — publishes analytics events to two topics:**

| Topic | Trigger | Payload |
|---|---|---|
| `prod_material_activity` | User views, edits, loads, or downloads a material | `{timestamp, eduMaterialId, interaction, metadata: {organizations, educationalLevels, educationalSubjects}}` |
| `prod_search_requests` | User performs a search | `{timestamp, keywords, filters}` |

Events are published asynchronously via worker threads. User-agents matching `KAFKA_EXCLUDED_AGENT_IDENTIFIERS` (e.g. `oersi`) are excluded.

**Connections to other AOE services:**

| Service | How |
|---|---|
| **streaming-app** | When a file download has a `Range` header and the file meets streaming criteria (enabled, MIME type in `[audio/mp4, audio/mpeg, audio/x-m4a, video/mp4]`, file size >= `STREAM_FILESIZE_MIN`), the backend first does a HEAD request to the streaming service to check it's alive (1s timeout). If yes, it responds with **HTTP 302** redirecting the browser to `/stream/api/v1/material/{filename}`. Otherwise it serves the file directly from S3. |
| **data-analytics** | The path `/api/v2/statistics` is proxied via `http-proxy-middleware` to `http://aoe-data-analytics:8080/analytics/api`. The frontend calls this for admin dashboard statistics. |
| **data-services** | No direct calls. Data-services calls the backend, not the other way around. |
| **semantic-apis** | No direct calls. Only the frontend calls semantic-apis. |

**Authentication:** OIDC via Passport.js. Discovers the issuer at `PROXY_URI`, redirects users for login with `openid profile offline_access` scopes, handles the callback at `/api/secure/redirect`, and auto-creates new users in PostgreSQL.

**Scheduled jobs:**

| Time (UTC) | Job |
|---|---|
| 1:00 AM | Clean temporary H5P and HTML directories |
| 1:15 AM | Generate URNs for unpublished materials (if enabled) |
| 1:30 AM | Re-index OpenSearch with recent material changes |
| 10:00 AM | Send expiration and rating notification emails via AWS SES |
| On startup (+10s) | Convert pending office files to PDF and upload to S3 |

---

### 3. aoe-streaming-app

**Node.js / Express 5** (TypeScript) | Port 3001

A stateless media streaming proxy between S3 and the browser. It exists to separate I/O-heavy streaming from the main backend and to support HTTP Range requests for video/audio seeking.

**The browser never calls this service directly.** The flow is:

1. Browser requests a file download from web-backend
2. Web-backend checks: is streaming enabled, is there a `Range` header, is the MIME type audio/video, is the file large enough?
3. If all criteria pass, web-backend responds with **HTTP 302** → `/stream/api/v1/material/{filename}`
4. Browser follows the redirect to the streaming service
5. Streaming service does a HEAD to S3 for file metadata, then streams the file back with Range support

**Range handling:** Client sends `Range: bytes=start-end`. The service caps chunks at `STORAGE_MAX_RANGE` (default 5MB). If the requested range exceeds the limit, the end is adjusted down. Response is HTTP 206 Partial Content with `Content-Range` header.

**Only connection:** AWS S3 (read-only, GET and HEAD). No databases, no caches, no queues.

**Endpoints:**
- `GET /stream/api/v1/material/:filename` — stream a file from S3
- `HEAD /stream/api/v1/material/:filename` — return file metadata (used by web-backend's health check)
- `GET /health` — health check

---

### 4. aoe-semantic-apis

**Node.js / Express 5** (TypeScript) | Port 3002

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

**Who calls it:** Only the frontend, via `koodistoUrl` (`/ref/api/v1`). The backend does not call semantic-apis.

**REST endpoints** (all under `/ref/api/v1`):

Simple resources: `/asiasanat/{lang}`, `/organisaatiot/{lang}`, `/koulutusasteet/{lang}`, `/kielet/{lang}`, `/lisenssit/{lang}`, `/oppimateriaalityypit/{lang}`, `/kohderyhmat/{lang}`, `/kayttokohteet/{lang}`, `/saavutettavuudentukitoiminnot/{lang}`, `/saavutettavuudenesteet/{lang}`, `/tieteenalat/{lang}`

Hierarchical resources (with parent IDs): `/oppiaineet/{lang}`, `/tavoitteet/{ids}/{lang}`, `/sisaltoalueet/{ids}/{lang}`, `/lukio-oppiaineet/{lang}`, `/lukio-moduulit/{ids}/{lang}`, `/ammattikoulu-tutkinnot/{lang}`, `/ammattikoulu-tutkinnon-osat/{ids}/{lang}`, and more.

Combined filter endpoint: `/filters-oppiaineet-tieteenalat-tutkinnot/{lang}`

#### Future: Merge into web-backend

This service is a candidate for removal. The goal is to simplify the architecture by reducing the number of independently deployed services and eliminating Java from the stack entirely.

The plan is to move the reference data fetching and serving logic into the web-backend. The external API integrations (Opintopolku, Finto, Suomi.fi) would become a scheduled job in the backend, similar to the existing nightly OpenSearch reindex. Instead of caching in Redis, the reference data would be stored in PostgreSQL — the data only refreshes once a week, so there is no need for an in-memory cache. The backend would expose the same `/ref/api/v1` endpoints so the frontend requires no changes.

**What this removes:** One ECS service, one CDK stack, one container image, one deployment pipeline, and the only consumer of Redis for non-session data.

**What this requires:** Reimplementing the external API fetching (including RDF+XML parsing for Finto) and the REST endpoints in TypeScript within the backend. A new PostgreSQL table (or tables) for storing the normalized reference data.

---

### 5. aoe-data-analytics

**Java 17 / Spring Boot 3.5** | Port 8080 | Context path `/analytics/api`

An analytics ETL processor. Consumes usage events from Kafka, persists them in MongoDB, and exposes REST endpoints for querying aggregated statistics. The web-backend proxies `/api/v2/statistics` requests here.

**Kafka consumption:**

| Topic | Consumer Group | Content |
|---|---|---|
| `prod_material_activity` | `group-prod-material-activity` | Material view/edit/load/download events with educational metadata |
| `prod_search_requests` | `group-prod-search-requests` | Search queries with keywords and filters |

Events arrive as JSON, are deserialized, and stored as documents in MongoDB.

**MongoDB collections:**

| Collection | Document Content |
|---|---|
| `material_activity` | `{sessionId, timestamp, eduMaterialId, interaction, metadata: {organizations, educationalLevels, educationalSubjects}}` |
| `search_requests` | `{sessionId, timestamp, keywords, filters: {educationalLevels, educationalSubjects, learningResourceTypes}}` |

**PostgreSQL (read-only):** Queries the `EducationalMaterial` table (joined with `EducationalLevel`, `AlignmentObject`, `Author`) to count materials by educational level, subject, and organization. This is used for the "published materials" statistics, not the time-series activity data.

**REST endpoints** (called by frontend via web-backend proxy):

| Endpoint | Purpose |
|---|---|
| `POST /statistics/prod/materialactivity/{interval}/total` | Time-series of material interactions (interval: DAY/WEEK/MONTH) |
| `POST /statistics/prod/searchrequests/{interval}/total` | Time-series of search requests |
| `POST /statistics/prod/educationallevel/all` | Material count by educational level |
| `POST /statistics/prod/educationallevel/expired` | Expiring materials by educational level |
| `POST /statistics/prod/educationalsubject/all` | Material count by subject |
| `POST /statistics/prod/organization/all` | Material count by organization |

All endpoints accept date range parameters and return aggregated results. 512MB JVM heap.

---

### 6. aoe-data-services

**Java 17 / Spring Boot 3.5** | Port 8001 | Context path `/meta`

An OAI-PMH (Open Archives Initiative Protocol for Metadata Harvesting) provider. Exposes AOE material metadata in standardized XML format so external library catalogs, institutional repositories, and metadata aggregators can harvest it.

**This is an outward-facing integration service.** No AOE service calls it — only external harvesters do.

**Data flow:** External harvester → data-services → web-backend → PostgreSQL

When a harvester sends an OAI-PMH request, data-services POSTs to `https://aoe.fi/api/v1/oaipmh/metadata` on the web-backend with date range and pagination parameters. The web-backend queries PostgreSQL (joining across material, record, attachment, and all metadata tables) and returns JSON. Data-services then transforms this into LRMI/DublinCore XML.

**Two endpoint variants:**

| Endpoint | Identifier Format | Behavior |
|---|---|---|
| `/meta/oaipmh` | `oai:aoe.fi:{id}` | Standard harvesting, includes deleted records |
| `/meta/v2/oaipmh` | `oai:aoe.fi:{id}-{date}` | URN-based, all versions, omits deleted records |

**OAI-PMH verbs supported:** `Identify`, `ListRecords`, `ListIdentifiers`, `GetRecords`

**Output format:** OAI-PMH XML wrapping DublinCore (`dc:`) and LRMI-FI (`lrmi_fi:`) metadata — titles, descriptions, authors, keywords, educational levels, accessibility features, licenses, curriculum alignments, language codes, and linked resources.

**Pagination:** 20 records per page via resumption tokens.

Stateless — no direct database connections. 512MB JVM heap.

#### Future: Merge into web-backend

This service is a candidate for removal for the same reason as semantic-apis: simplify the architecture and eliminate Java from the stack.

The backend already has the OAI-PMH query logic that data-services calls (`/api/v1/oaipmh/metadata`). The only thing data-services adds is the JSON-to-XML transformation into LRMI/DublinCore format. This transformation would be reimplemented in TypeScript and the OAI-PMH endpoints served directly from the backend.

**The XML output must be identical to the current Java implementation.** External harvesters depend on the exact format. Integration tests should compare the new TypeScript output against the existing Java service's responses to verify byte-level correctness before cutover.

**What this removes:** One ECS service, one CDK stack, one container image, one deployment pipeline, and one of the two Java/Spring Boot services.

**What this requires:** Reimplementing the JAXB-based XML serialization (OAI-PMH envelope, DublinCore, LRMI-FI metadata) in TypeScript, and integration tests that validate output parity.

---

## Technology Summary

| Service | Language | Framework | Port |
|---|---|---|---|
| web-frontend | TypeScript | Angular 20 + OpenResty/Nginx | 8080 |
| web-backend | TypeScript | Express 5 (Node.js) | 3000 |
| streaming-app | TypeScript | Express 5 (Node.js) | 3001 |
| semantic-apis | TypeScript | Express 5 (Node.js) | 3002 |
| data-analytics | Java 17 | Spring Boot 3.5 | 8080 |
| data-services | Java 17 | Spring Boot 3.5 | 8001 |

## Shared Infrastructure

All services run on a shared ECS Fargate cluster with:
- **Application Load Balancer** for path-based routing (see routing table above)
- **CloudWatch** monitoring with CPU, memory, and health check alarms
- **Service Discovery** via Cloud Map with private DNS namespace
- **Auto-scaling** based on CPU utilization
- **ECS Exec** for secure shell access (configurable per environment)
