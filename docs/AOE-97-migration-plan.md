# AOE-97: Migrate aoe-data-analytics to aoe-web-backend

## Context

The `aoe-data-analytics` Java service acts as an intermediary: `aoe-web-backend` produces events to Kafka, `aoe-data-analytics` consumes them and stores in DocumentDB (MongoDB), then answers statistics queries from the frontend. The frontend calls `/api/v2/statistics/prod/*` which `aoe-web-backend` proxies to `aoe-data-analytics`.

This migration eliminates the service entirely by writing analytics events directly to PostgreSQL from `aoe-web-backend` and implementing the statistics endpoints there. Kafka (MSK) and DocumentDB are decommissioned as a result.

**Current data flow:**
`aoe-web-backend` → Kafka → `aoe-data-analytics` → MongoDB (events) / PostgreSQL (published material stats)

**Target data flow:**
`aoe-web-backend` → PostgreSQL (all analytics, directly)

---

## Architectural Decision: Drop DocumentDB?

The full plan assumes DocumentDB is dropped entirely. This section challenges that assumption.

### Pros of dropping DocumentDB (moving events to PostgreSQL)

- **Simpler operations:** One fewer database cluster to monitor, patch, and back up
- **Cost reduction:** DocumentDB cluster pricing is expensive; eliminating it saves ongoing cost
- **Unified data store:** All AOE data in one PostgreSQL instance — simpler queries, single toolchain, no cross-DB joins needed
- **No new dependencies:** `aoe-web-backend` already has PostgreSQL access; no additional driver or connection management needed
- **Aligns with Kafka removal:** Both changes simplify the architecture toward the same goal

### Cons of dropping DocumentDB / risks

- **Historical data migration risk:** All existing analytics events must be migrated from DocumentDB to PostgreSQL. If the migration script has bugs or the process fails mid-way, historical analytics data could be lost or corrupted. This data is years old and irreplaceable.
- **Schema migration risk:** Adding new PostgreSQL tables requires manual DDL execution in each environment (dev, qa, prod) with no automated tooling. A missed step means the service deploys against tables that don't exist yet.
- **Limited time:** The data migration and verification (built into Task 2 as a Knex migration) add complexity and startup time to the first deploy.
- **Array query ergonomics:** MongoDB natively handles array fields; PostgreSQL TEXT[] with `= ANY()` works but is less idiomatic and harder to extend later if the analytics schema needs to evolve.

### Alternative: Remove Kafka but keep DocumentDB

Instead of migrating events to PostgreSQL, `aoe-web-backend` could write directly to DocumentDB using the `mongodb` driver, skipping Kafka entirely. `aoe-data-analytics` continues to serve the statistics API.

- **Reduces scope:** Historical data migration and verification (built into Task 2's Knex migration) would be eliminated
- **Eliminates data migration risk:** No historical data to move
- **Still removes Kafka:** The primary complexity reduction is achieved
- **Drawback:** DocumentDB remains in the infrastructure (cost, operational overhead) and `aoe-data-analytics` remains in the codebase (Java service to maintain)
- **Drawback:** Does not fully achieve the goal of removing `aoe-data-analytics`

> **Recommendation:** If time is the primary constraint, consider splitting the work: Phase 1 removes Kafka (write directly to DocumentDB from `aoe-web-backend`, keep `aoe-data-analytics` as the statistics API), Phase 2 (separate ticket) migrates DocumentDB to PostgreSQL and decommissions `aoe-data-analytics` entirely. This trades off cleanup completeness for delivery risk.

---

## Statistics Endpoints to Re-implement

All six endpoints currently served by `aoe-data-analytics` at `/analytics/api/statistics/prod/`:

| Endpoint | Data Source |
|---|---|
| `POST /educationallevel/all` | PostgreSQL `EducationalMaterial` + `EducationalLevel` tables (already exists) |
| `POST /educationallevel/expired` | PostgreSQL (already exists) |
| `POST /educationalsubject/all` | PostgreSQL `EducationalMaterial` + `AlignmentObject` (already exists) |
| `POST /organization/all` | PostgreSQL `EducationalMaterial` + `Author` (already exists) |
| `POST /materialactivity/{interval}/total` | MongoDB → migrate to new PostgreSQL table |
| `POST /searchrequests/{interval}/total` | MongoDB → migrate to new PostgreSQL table |

---

## New PostgreSQL Schema

Two new tables appended to `/docker/init-scripts/aoe-init.sql`:

```sql
CREATE TABLE AnalyticsMaterialActivity
(
    Id                      BIGSERIAL                NOT NULL,
    SessionId               TEXT,
    Timestamp               TIMESTAMP WITH TIME ZONE NOT NULL,
    EduMaterialId           TEXT,
    Interaction             TEXT,
    MetaCreated             TIMESTAMP WITH TIME ZONE,
    MetaUpdated             TIMESTAMP WITH TIME ZONE,
    MetaOrganizations       TEXT[],
    MetaEducationalLevels   TEXT[],
    MetaEducationalSubjects TEXT[],
    PRIMARY KEY (Id)
);
CREATE INDEX idx_analytics_material_activity_timestamp ON AnalyticsMaterialActivity (Timestamp);
CREATE INDEX idx_analytics_material_activity_interaction ON AnalyticsMaterialActivity (Interaction);
CREATE INDEX idx_analytics_material_activity_edu_material_id ON AnalyticsMaterialActivity (EduMaterialId);

CREATE TABLE AnalyticsSearchRequest
(
    Id                           BIGSERIAL                NOT NULL,
    SessionId                    TEXT,
    Timestamp                    TIMESTAMP WITH TIME ZONE NOT NULL,
    Keywords                     TEXT,
    FiltersEducationalLevels     TEXT[],
    FiltersEducationalSubjects   TEXT[],
    FiltersLearningResourceTypes TEXT[],
    PRIMARY KEY (Id)
);
CREATE INDEX idx_analytics_search_request_timestamp ON AnalyticsSearchRequest (Timestamp);
```

**Design rationale:** TEXT[] arrays (not junction tables) match how the data is stored in MongoDB and how it is queried — array membership checks (`= ANY($array)`) are simpler than joins for append-only event logs.

---

## Feature Flags

Two optional env vars added to `config.ts` under `FEATURES` (not mandatory — default to disabled):

```typescript
FEATURES: {
  dataRunScheduled: true,
  analyticsPostgresRead: (process.env.ANALYTICS_READ_FROM_POSTGRES === 'true')
} as const
```

`analyticsPostgresRead` is **not** added to the mandatory env var check — it defaults to disabled, so the service starts safely without it set. PostgreSQL writes are always active once Task 2 is deployed; no flag guards them.

---

## Task 1: Playwright Tests for the Analytics Pipeline

Establish end-to-end coverage of the full analytics pipeline without any mocking. These tests run against the real local stack and will serve as the primary verification gate for Tasks 3 and 4.

`bryssel.spec.ts` already contains three relevant tests:
- `oppimateriaalin katselu näkyy analytiikassa` — view event recorded
- `uusi oppimateriaali näkyy julkaisumäärissä` — published material count
- `vanhentuneet oppimateriaalit näkyvät analytiikassa` — expired material count

**Missing coverage — add to `bryssel.spec.ts` or a new `/playwright/tests/analytiikka.spec.ts`:**

```
test('hakutapahtuma tallentuu analytiikkaan')
  // 1. Navigate to analytics admin page, record baseline search request dayTotal
  //    by intercepting the /searchrequests/day/total response
  // 2. Perform a keyword search from the frontend (via Etusivu.hae())
  // 3. Navigate back to analytics, query searchrequests/day/total again
  // 4. Assert total is greater than the baseline

test('haun suodattimet tallentuvat analytiikkaan')
  // 1. Apply an educational level filter on the search page and perform a search
  // 2. Verify search request dayTotal increased in analytics
```

The page object `BrysselAnalyytiikka` (`/playwright/tests/pages/BrysselAnalytiikka.ts`) already has all needed locators. Use `page.waitForResponse` to intercept API responses (same pattern as existing tests in `bryssel.spec.ts`).

**Validation:** `./run-tests.sh` passes — all analytics tests green, including the two new search tests.

---

## Task 2: Write Analytics Events to PostgreSQL (Parallel with Kafka)

Add a parallel PostgreSQL write path alongside the existing Kafka production. The Kafka path is **not modified**.

**Files to modify:**

`/docker/init-scripts/aoe-init.sql` — append the two new tables (schema above). This keeps the local Docker setup in sync.

`/aoe-web-backend/package.json` — add `knex` and `@types/knex` (dev) as dependencies.

`/aoe-web-backend/src/config.ts` — add the two feature flags to `FEATURES` (see above).

`/aoe-web-backend/src/services/analyticsService.ts` — after the Kafka send in `publishAnalyticsEvent`, add an unconditional fire-and-forget call to the new PostgreSQL insert functions. Errors are caught and logged, never propagated to the HTTP response.

**Files to create:**

`/aoe-web-backend/knexfile.ts` — Knex configuration importing the PostgreSQL connection from the existing `config.ts` (`POSTGRESQL_OPTIONS`) so there is a single source of truth:

```typescript
import type { Knex } from 'knex'
import { config } from './src/config'

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: config.POSTGRESQL_OPTIONS.host,
    port: Number(config.POSTGRESQL_OPTIONS.port),
    user: config.POSTGRESQL_OPTIONS.user,
    password: config.POSTGRESQL_OPTIONS.pass,
    database: config.POSTGRESQL_OPTIONS.data
  },
  migrations: {
    directory: './migrations',
    extension: 'js'
  }
}

export default knexConfig
```

`/aoe-web-backend/migrations/<timestamp>_create_analytics_tables.js` — Knex migration creating the two new tables, using JSDoc type hints:

```js
/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  await knex.schema.createTable('AnalyticsMaterialActivity', (table) => { ... })
  await knex.schema.createTable('AnalyticsSearchRequest', (table) => { ... })
  // indexes
}

exports.down = () => Promise.resolve()
```

`/aoe-web-backend/migrations/<timestamp>_migrate_analytics_data.js` — runs immediately after the schema migration in the same startup. Historical DocumentDB data is migrated into the newly created tables before the server begins accepting traffic, so PostgreSQL is fully populated from the first deploy:

```js
/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI not set, skipping DocumentDB data migration')
    return
  }

  const { MongoClient } = require('mongodb')
  const cutoff = new Date()

  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db()

  // migrate material_activity in batches
  // migrate search_requests in batches
  // log progress every 1000 rows

  // verify counts match before closing
  const mongoActivityCount = await db.collection('material_activity').countDocuments({ timestamp: { $lt: cutoff } })
  const mongoSearchCount = await db.collection('search_requests').countDocuments({ timestamp: { $lt: cutoff } })
  const [{ count: pgActivityCount }] = await knex('AnalyticsMaterialActivity').count('* as count')
  const [{ count: pgSearchCount }] = await knex('AnalyticsSearchRequest').count('* as count')

  if (Number(pgActivityCount) !== mongoActivityCount) {
    throw new Error(`material_activity count mismatch: MongoDB ${mongoActivityCount}, PostgreSQL ${pgActivityCount}`)
  }
  if (Number(pgSearchCount) !== mongoSearchCount) {
    throw new Error(`search_requests count mismatch: MongoDB ${mongoSearchCount}, PostgreSQL ${pgSearchCount}`)
  }

  // spot-check: 5 random material_activity documents
  const sampleActivity = await db.collection('material_activity').aggregate([{ $sample: { size: 5 } }]).toArray()
  for (const doc of sampleActivity) {
    const row = await knex('AnalyticsMaterialActivity').where({ SessionId: doc.sessionId, Interaction: doc.interaction }).whereRaw('Timestamp = ?', [doc.timestamp]).first()
    if (!row) throw new Error(`material_activity spot-check failed for sessionId ${doc.sessionId}`)
  }

  // spot-check: 5 random search_requests documents
  const sampleSearch = await db.collection('search_requests').aggregate([{ $sample: { size: 5 } }]).toArray()
  for (const doc of sampleSearch) {
    const row = await knex('AnalyticsSearchRequest').where({ SessionId: doc.sessionId, Keywords: doc.keywords }).whereRaw('Timestamp = ?', [doc.timestamp]).first()
    if (!row) throw new Error(`search_requests spot-check failed for sessionId ${doc.sessionId}`)
  }

  await client.close()
}

exports.down = () => Promise.resolve()
```

Add `MONGODB_URI` to the mandatory env var check in `config.ts` for the duration of Tasks 2–5, then remove it in Task 6. Add `mongodb` to `package.json` as a regular dependency; remove it in Task 8.

`/aoe-web-backend/src/server.ts` — run migrations automatically before the server starts listening. `startServer()` calls `knex.migrate.latest()` before `initApp()`:

```typescript
import knex from 'knex'
import knexConfig from '../knexfile'

async function startServer() {
  const db = knex(knexConfig)
  await db.migrate.latest()

  const app = await initApp()
  app.listen(...)
}
```

Migrations run on every startup; Knex is idempotent and skips already-applied migrations. No manual DDL step needed in any environment.

`/aoe-web-backend/src/query/analyticsInsertQueries.ts` — two INSERT functions using `db` from `postgresClient.ts`:
- `insertMaterialActivityEvent(event: TypeMaterialActivity): Promise<void>`
- `insertSearchRequestEvent(event: TypeSearchRequest): Promise<void>`

**Validation:** Deploy to dev — server logs confirm both migrations ran at startup. Rows appearing in `AnalyticsMaterialActivity` and `AnalyticsSearchRequest`, including historical data pre-dating the deployment.

---

## Task 3: Verify Analytics Events and Statistics Output Are Equal in Both Paths

The goal is twofold: confirm analytics events are written identically to both stores, and confirm the statistics endpoints return the same output whether reading from MongoDB or PostgreSQL.

### Unit tests

**Files to create:**

`/aoe-web-backend/src/services/analyticsService.test.ts` — using Node.js native `node:test` runner. Mock `db` from `postgresClient.ts` to avoid real database connections:

```
describe('PostgreSQL write path', () => {
  it('inserts a material activity event to PostgreSQL')
  it('inserts a search request event to PostgreSQL')
  it('continues Kafka publish even when PostgreSQL insert throws')
  it('does not throw when both Kafka and PostgreSQL writes fail')
})
```

### Comparison script

**Files to create:**

`/aoe-web-backend/src/scripts/compareStatisticsSources.ts` — standalone script that calls both statistics sources with identical query parameters and asserts the responses match:

1. For each of the six statistics endpoints, send the same POST request body to:
   - The old path: `{ANALYTICS_URL}/analytics/api/statistics/prod/...` (aoe-data-analytics, reading from MongoDB)
   - The new path: `{WEB_BACKEND_URL}/api/v2/statistics/prod/...` with `ANALYTICS_READ_FROM_POSTGRES=true` active
2. Compare `values` arrays: same keys, same counts (or within an acceptable delta for time-series endpoints that may have new events between the two calls)
3. Print a diff for any mismatches, exit 1 if counts differ beyond the delta threshold

Run this script after a period of dual writes to confirm parity.

### Playwright parity test

Add to `bryssel.spec.ts` or `analytiikka.spec.ts`:

```
test('molemmat lähteet palauttavat saman materiaalikäyttömäärän')
  // 1. Trigger a material view to produce an event on both paths
  // 2. Query materialactivity/day/total via the statistics endpoint (reads from MongoDB via proxy)
  //    and capture the dayTotal for today
  // 3. Query directly against the internal statistics endpoint with postgres source
  //    (call /api/v2/statistics/prod/materialactivity/day/total with an Authorization header)
  // 4. Assert the two dayTotals match
```

Note: Step 3 requires the postgres statistics endpoint to be registered at a distinct URL during the transition period (e.g., `/api/v2/statistics-pg/...`) so both paths can be queried in the same test without toggling env vars. Alternatively, the comparison script approach above covers this without needing a separate URL.

**Validation:** Unit tests pass (`npm test`). Comparison script exits 0 (`npx tsx src/scripts/compareStatisticsSources.ts`). Row counts match expected traffic volume.

---

## Task 4: Implement Statistics Endpoints in aoe-web-backend (with Feature Flag)

**Files to create:**

`/aoe-web-backend/src/models/statisticsModels.ts` — TypeScript interfaces mirroring the Java request models:

```typescript
interface EducationalLevelTotalRequest { educationalLevels: string[]; since?: string; until?: string; expiredBefore?: string }
interface EducationalSubjectTotalRequest { educationalSubjects: string[]; since?: string; until?: string }
interface OrganizationTotalRequest { organizations: string[]; since?: string; until?: string }
interface IntervalTotalRequest { since: string; until: string; interaction?: string; metadata?: { organizations?: string[]; educationalLevels?: string[]; educationalSubjects?: string[] }; filters?: { ... } }
```

`/aoe-web-backend/src/services/statisticsService.ts` — four PostgreSQL-backed functions querying existing tables:
- `getEducationalLevelDistribution(req)` — JOIN `EducationalMaterial` + `EducationalLevel`, filter by `EducationalLevelKey`, optional `PublishedAt` range
- `getEducationalLevelExpired(req)` — same join, filter by `Expires < expiredBefore`
- `getEducationalSubjectDistribution(req)` — JOIN `EducationalMaterial` + `AlignmentObject`, filter by `ObjectKey`
- `getOrganizationDistribution(req)` — JOIN `EducationalMaterial` + `Author`, filter by `organizationkey`

Response shape: `{ interval, since, until, values: [{ key, value }] }` — must match the Java `StatisticsMeta<RecordKeyValue>` JSON exactly (frontend `StatisticsService` parses this).

`/aoe-web-backend/src/services/timeSeriesService.ts` — two time-series functions querying the new analytics tables:
- `getMaterialActivityTotalByInterval(req, interval)` — queries `AnalyticsMaterialActivity`, groups by DAY/WEEK/MONTH using PostgreSQL `EXTRACT`. Array filters use `= ANY($array)`. ISO week uses `EXTRACT(ISOYEAR)` + `EXTRACT(WEEK)` (same as MongoDB `isoWeek()`).
- `getSearchRequestsTotalByInterval(req, interval)` — same pattern on `AnalyticsSearchRequest`.

Response shape: `{ interval, since, until, values: [{ year, month?, week?, day?, dayTotal?, weekTotal?, monthTotal? }] }` — must match Java `StatisticsMeta<IntervalTotal>` JSON exactly.

`/aoe-web-backend/src/api/routes-v2/statistics.ts` — Express router with all six POST endpoints calling the service functions.

**Files to modify:**

`/aoe-web-backend/src/app.ts` — replace the proxy block (lines 129–138) with a conditional:

```typescript
if (config.FEATURES.analyticsPostgresRead) {
  app.use('/api/v2/statistics', checkAuthenticated, statisticsRouter)
} else {
  app.use(
    '/api/v2/statistics',
    checkAuthenticated,
    createProxyMiddleware({ target: ..., pathRewrite: ... })
  )
}
```

Both branches mount at `/api/v2/statistics`. Route handlers inside `statistics.ts` include `/prod/` in their paths (e.g., `router.post('/prod/educationallevel/all', ...)`) — `/prod` is baked into `statisticsBackendUrl` in every Angular environment file, so the proxy always receives paths starting with `/prod/...`.

The registration happens **before body parsers** (same position as the current proxy) because the proxy path must intercept the raw request before body parsing.

**Test files to create:**

`/aoe-web-backend/src/services/statisticsService.test.ts`
`/aoe-web-backend/src/services/timeSeriesService.test.ts`

Cover each function: no date range, with date range, empty input arrays, interval types (day/week/month), array filter matching.

**Validation:** Set `ANALYTICS_READ_FROM_POSTGRES=true` on dev. Open the admin analytics view in the browser. Confirm all charts render with data equivalent to what the old proxy returned.

---


## Task 5: Clean AWS Infrastructure (MANUAL, env by env: dev → qa → prod)

No code automation. Each step must be executed manually and confirmed before the next.

For each environment:

**Step 1 — Drain aoe-data-analytics ECS service:**
- In `aoe-infra`, set `desiredCount: 0` for `DataAnalyticsEcsService`, deploy: `npx cdk deploy DataAnalyticsEcsService -c environment=<env> --profile aoe-<env>`
- Confirm ECS tasks terminated in AWS console

**Step 2 — Destroy aoe-data-analytics ECS stack:**
- Remove the `DataAnalyticsEcsService` stack definition from `aoe-infra/bin/infra.ts`
- `npx cdk destroy DataAnalyticsEcsService -c environment=<env> --profile aoe-<env>`
- Confirm stack gone in CloudFormation

**Step 3 — Clear and destroy ECR repository:**
- Manually delete all images from the `aoe-data-analytics` ECR repository in AWS console
- Remove `DataAnalyticsEcrStack` from `aoe-infra/bin/infra.ts`
- `npx cdk destroy DataAnalyticsEcrStack -c environment=<env> --profile aoe-<env>`
- Confirm ECR repo gone

**Step 4 — Destroy DocumentDB stack:**
- Confirm no other service connects to DocumentDB
- Remove `AOEDocumentDB` stack from `aoe-infra/bin/infra.ts`
- `npx cdk destroy AOEDocumentDB -c environment=<env> --profile aoe-<env>`

**Step 5 — Destroy MSK Kafka stack:**
- Confirm no other service produces/consumes from MSK
- Remove `AOEMskKafka` stack from `aoe-infra/bin/infra.ts`
- `npx cdk destroy AOEMskKafka -c environment=<env> --profile aoe-<env>`

**Step 6 — Clean up Secrets Manager:**
- Manually delete `ANALYTICS_DOCDB_PASSWORD`, `ANALYTICS_TRUST_STORE_PASSWORD`, `ANALYTICS_PG_PASS` secrets in AWS console for the environment

Repeat all steps for the next environment.

---

## Task 6: Remove aoe-data-analytics from the Repository

Only after Task 5 is complete across all environments.

**Delete entirely:**
- `/aoe-data-analytics/` directory
- `/aoe-web-backend/src/resource/kafkaClient.ts`
- `/docker/init-scripts/init-mongo.js`

**Modify `/aoe-web-backend/src/app.ts`:**
- Remove the `if/else` feature flag block; keep only the statistics router mount (unconditional)
- Remove `createProxyMiddleware` import
- Remove `http-proxy-middleware` import

**Modify `/aoe-web-backend/src/services/analyticsService.ts`:**
- Remove all Kafka imports (`kafkaProducer`, Kafka types)
- Remove `ensureConnected`/`producerConnected` logic
- Remove Kafka send from `publishAnalyticsEvent`; PostgreSQL write becomes the only write path (unconditional, no flag guard)
- Keep bot exclusion logic (`hasExcludedAgents`)

**Modify `/aoe-web-backend/src/config.ts`:**
- Remove entire `MESSAGE_QUEUE_OPTIONS` section
- Remove all Kafka mandatory env var checks (lines 17–25 in current `config.ts`)
- Remove `SERVER_CONFIG_OPTIONS.oaipmhAnalyticsURL` and its mandatory check (lines 34–35)
- Remove `MONGODB_URI` mandatory env var check
- Remove `analyticsPostgresRead` from `FEATURES` (now permanent behavior)
- Move excluded agent identifiers out of Kafka config if still needed (rename env var to `ANALYTICS_EXCLUDED_AGENT_IDENTIFIERS`)

**Modify `/aoe-web-backend/package.json`:**
- Remove `kafkajs`, `aws-msk-iam-sasl-signer-js`, and `mongodb` from dependencies

**Modify `/docker-compose.yml`:**
- Remove services: `aoe-data-analytics`, `mongo`, `zookeeper`, `kafka`, `kafka2`
- Remove `kafka`/`mongo` dependencies from `aoe-web-backend` service

**Modify `/aoe-infra/environments/dev.ts`, `qa.ts`, `prod.ts`:**
- Remove `data_analytics` service config block
- Remove `document_db` and `msk` config sections
- Remove `SERVER_CONFIG_OAIPMH_ANALYTICS_URL` and all `KAFKA_*` env vars from web_backend section

**Modify `/aoe-infra/bin/infra.ts`:**
- Remove all references to the decommissioned stacks (already destroyed in Task 7)
- Remove Kafka IAM policy attachments from `WebBackendEcsService`

**Validation:** `npm run build` and `npm test` pass in `aoe-web-backend`. Local `./start-local-env.sh` starts successfully. No remaining references to `kafka`, `mongo`, `documentdb`, or `aoe-data-analytics` in active code (`grep -r` to verify).

---

## Task 7: Document Changes in Confluence

Document the following:
- New `AnalyticsMaterialActivity` and `AnalyticsSearchRequest` table schemas and their purpose
- Decommissioned components: Kafka (MSK), DocumentDB, `aoe-data-analytics` ECS service and ECR repo
- New statistics endpoint implementation location (`aoe-web-backend/src/services/statisticsService.ts`, `timeSeriesService.ts`)
- Migration procedure and how to verify it was correct (built into Task 2 Knex migration)
- Updated architecture diagram showing direct PostgreSQL write path

---

## Sequencing and Gates

```
Task 1 (Playwright analytics pipeline tests)
  → gate: ./run-tests.sh passes (including new search request tests)
Task 2 (dual write: Kafka + Postgres; historical data migration and verification run on same startup via Knex)
  → gate: server logs confirm both migrations ran; rows in both tables including historical data
Task 3 (verify analytics event write parity + statistics output parity)
  → gate: unit tests pass; compareStatisticsSources.ts exits 0; Playwright analytics tests pass
Task 4 (statistics endpoints + feature flag)
  → gate: flip ANALYTICS_READ_FROM_POSTGRES=true on dev, analytics UI works with full historical data
--- only proceed after Tasks 1–4 stable on all environments ---
Task 5 (manual AWS infra cleanup, env by env)
  → gate: each CDK destroy confirmed in CloudFormation
Task 6 (repo cleanup)
  → gate: CI green, no kafka/mongo references in active code
Task 7 (Confluence docs)
  → gate: page published
```

---

## Critical Files

| File | Tasks |
|---|---|
| `/docker/init-scripts/aoe-init.sql` | 2 |
| `/aoe-web-backend/src/config.ts` | 2, 8 |
| `/aoe-web-backend/src/services/analyticsService.ts` | 1, 2, 3, 8 |
| `/aoe-web-backend/src/query/analyticsInsertQueries.ts` (new) | 2 |
| `/aoe-web-backend/src/services/statisticsService.ts` (new) | 4 |
| `/aoe-web-backend/src/services/timeSeriesService.ts` (new) | 4 |
| `/aoe-web-backend/src/api/routes-v2/statistics.ts` (new) | 4 |
| `/aoe-web-backend/src/app.ts` | 4, 6 |
| `/aoe-web-backend/migrations/<timestamp>_migrate_analytics_data.js` (new) | 2 |
| `/aoe-infra/bin/infra.ts` | 5, 6 |
| `/aoe-infra/environments/dev.ts`, `qa.ts`, `prod.ts` | 6 |
| `/docker-compose.yml` | 6 |
| `/aoe-data-analytics/` (entire directory) | 6 |
