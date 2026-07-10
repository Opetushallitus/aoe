# CLAUDE.md

## Project Overview

AOE (Avoimet Oppimateriaalit - Library of Open Educational Resources) is a microservices-based web application for managing and distributing educational resources. The monorepo contains Node.js/TypeScript services (aoe-web-backend, aoe-web-frontend, aoe-streaming-app) and AWS CDK infrastructure (aoe-infra).

## Local Development

Start the entire stack:
```bash
./start-local-env.sh
```

This generates a self-signed cert for NGINX and starts all services via Docker Compose in a tmux session.

Access at: https://demo.aoe.fi/ (requires host file entry)

Mock OIDC credentials:
- aoeuser/password123
- tuomas.jukola/password123

### Linting

```bash
./scripts/fix-lint.sh         # Fix lint across all services with Biome
```

### Playwright Tests

```bash
./run-tests.sh                # Run from repo root
```

#### Creating materials in tests

Use `taytaJaTallennaUusiMateriaali(nimi, opts)` to create a material — don't hand-walk the wizard. Pass what the test needs through `opts`, and add a new `opts` field if a case isn't covered. Only walk the steps manually when the test *is* about the walk itself (per-step a11y scans, keyboard-only completion, or stopping mid-flow).

#### `pressSequentially()` vs `fill()`

Some Angular inputs use `(keyup)` handlers for logic (e.g. debounced lookups). Playwright's `fill()` doesn't fire keyboard events, so these handlers won't trigger. **Use `pressSequentially()` instead of `fill()`** for inputs with `(keyup)`, `(keydown)`, or `(keypress)` bindings.

Known affected inputs:
- `#materialId` in `admin/remove-material/` — `(keyup)="getMaterialInfo($event)"`
- `#materialId` in `admin/change-material-owner/` — `(keyup)="getMaterialInfo($event)"`

## AWS Environments

- **dev**: Account 339713180834, profile `aoe-dev`
- **qa**: Account 058264216444, profile `aoe-qa`
- **prod**: Account 381492241240, profile `aoe-prod`

All use AWS SSO via `oph-federation` session in `eu-west-1`.

### CDK Deployment

```bash
cd aoe-infra
aws sso login --sso-session oph-federation
npx cdk deploy -c environment=dev --all --profile aoe-dev
```

## Database Migrations

PostgreSQL base schema: `docker/init-scripts/aoe-init.sql`. Schema changes use Knex migrations in `aoe-web-backend/migrations/`.

## Infrastructure

- Production: AWS ECS Fargate, Aurora (PostgreSQL), ElastiCache (Redis), OpenSearch
- Sensitive config in AWS Parameter Store (`/<environment>/<serviceName>/`), database secrets in Secrets Manager
- Local: Docker Compose with LocalStack for S3, mock OIDC server

## AWS SDK v3 (S3) — always free the socket

`GetObjectCommand.Body` is a stream (v2 buffered it) and the pool defaults to `maxSockets: 50`.
An unconsumed `Body` holds its socket; 50 leaks wedge the pool (`socket usage at capacity=50 ... enqueued`).
Unlike v2, destroying the stream is not enough on its own and a client disconnect does not cancel the request — cancellation is decoupled from the stream.
Reference: `downloadFromStorage()` in `aoe-web-backend/src/query/fileHandling.ts` (AOE-115).

- Always fully consume or destroy the `Body` so its socket is released, even on error or early exit.
- Wire the client disconnect to cancel the S3 request itself, not just tear down the stream — this also releases requests still queued waiting for a socket.
- Treat a client-cancel error as benign, not a server error (no 500, no alarm).

## code style
- Use Zod to validate incoming requests and database query results