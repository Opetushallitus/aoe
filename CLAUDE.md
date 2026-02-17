# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AOE (Avoimet Oppimateriaalit - Library of Open Educational Resources) is a microservices-based web application for managing and distributing educational resources. The system consists of multiple Node.js/TypeScript and Spring Boot services with Angular frontend, orchestrated through Docker Compose.

## Architecture

### Service Components

The system is organized as a monorepo with the following services:

- **aoe-web-backend**: Main Node.js/Express backend API serving frontend and handling authentication
  - TypeScript with Express 5
  - PostgreSQL for primary data storage
  - OpenSearch for search functionality
  - Redis for caching and sessions
  - Kafka for event streaming
  - OIDC authentication via openid-client and Passport

- **aoe-web-frontend**: Angular 20 SPA
  - Uses Angular CLI for builds
  - CoreUI components
  - TypeScript

- **aoe-semantic-apis**: Node.js service providing semantic API endpoints
  - Express-based
  - Redis integration
  - Provides swagger documentation via express-swagger-generator

- **aoe-streaming-app**: Node.js streaming service
  - Handles S3/LocalStack interactions
  - Express-based

- **aoe-data-analytics**: Spring Boot 3 Kafka Streams consumer
  - Java 17, built with Maven
  - Processes analytics events from Kafka
  - Writes to MongoDB and PostgreSQL
  - Uses Kafka Streams API

- **aoe-data-services**: Spring Boot service (OAI-PMH provider)
  - Java-based, built with Maven

- **aoe-infra**: AWS CDK infrastructure as code
  - TypeScript-based CDK stacks
  - Defines ECS services, Aurora databases, networking, monitoring

### Data Stores

- **PostgreSQL**: Primary relational database (Aurora in production)
- **MongoDB**: Document store for analytics data (DocumentDB in production)
- **OpenSearch**: Full-text search engine for educational materials
- **Redis**: Session storage and caching (ElastiCache in production)
- **Kafka**: Event streaming (AWS MSK in production)
- **S3/LocalStack**: Object storage for files and media

### Infrastructure

- Deployed to AWS ECS Fargate
- NGINX reverse proxy for HTTPS termination
- Infrastructure managed via AWS CDK (in aoe-infra/)
- Local development uses Docker Compose

## Common Development Commands

### Local Development Environment

Start entire stack locally (requires .env files):
```bash
./start-local-env.sh
```

This script:
- Fetches .env files from AWS S3 if needed (requires AWS SSO login)
- Generates self-signed certificate for NGINX
- Starts all services via docker-compose.yml

Access local environment at: https://demo.aoe.fi/ (requires host file entries)

Mock OIDC credentials:
- aoeuser/password123
- tuomas.jukola/password123

### Environment Setup

Fetch .env files from AWS S3:
```bash
./scripts/fetch_secrets.sh
```

Update .env files in AWS S3 (after editing local .env files):
```bash
./scripts/update_secrets.sh
```

### Linting All Services

```bash
./scripts/fix-lint.sh      # Fix lint across all services with Biome
```

### Backend (aoe-web-backend)

```bash
cd aoe-web-backend
npm run build          # Compile TypeScript (tsc + tsc-alias)
npm run build-ts       # Same as build
npm start              # Run compiled server
npm run watch-start    # Run with --watch flag
npm run watch-ts       # Watch mode compilation
npm run lint           # Check with Biome
npm run fix-lint       # Fix linting issues with Biome
npm run knip           # Find unused dependencies
```

Entry point: src/server.ts → src/app.ts
Port: 3000 (configurable via PORT_LISTEN env var)

### Frontend (aoe-web-frontend)

```bash
cd aoe-web-frontend
npm start              # ng serve (development server)
npm run build          # ng build (production build)
npm run lint           # Check with Biome
npm run fix-lint       # Fix linting issues with Biome
```

### Semantic APIs (aoe-semantic-apis)

```bash
cd aoe-semantic-apis
npm run build          # Compile TypeScript
npm run build-ts       # Compile TypeScript only
npm start              # Run compiled server
npm run lint           # Check with Biome
npm run fix-lint       # Fix linting issues
npm run knip           # Find unused dependencies
```

### Streaming App (aoe-streaming-app)

```bash
cd aoe-streaming-app
npm run build          # Compile TypeScript and lint
npm run build-ts       # Compile TypeScript only
npm start              # Run compiled server
npm run lint           # Check with Biome
npm run fix-lint       # Fix linting issues
npm run knip           # Find unused dependencies
```

### Data Analytics (aoe-data-analytics)

```bash
cd aoe-data-analytics
mvn clean install      # Build JAR
mvn test               # Run tests
mvn spring-boot:run    # Run locally
```

Entry point: fi.csc.processor.ServiceEtlProcessorApplication
Java version: 17

### Data Services (aoe-data-services)

```bash
cd aoe-data-services
mvn clean install      # Build JAR
mvn test               # Run tests
./mvnw spring-boot:run # Run with Maven wrapper
```

### Playwright Tests

```bash
./run-tests.sh           # Run Playwright tests from repo root
cd playwright
npm run playwright:test  # Run Playwright tests
npm run codegen          # Generate test code interactively
npm run lint             # Check with Biome
npm run fix-lint         # Fix linting issues
```

### Infrastructure (aoe-infra)

Deploy all stacks to environment:
```bash
cd aoe-infra
aws sso login --sso-session oph-federation
npx cdk deploy -c environment=dev --all --profile aoe-dev
```

Deploy specific stack:
```bash
npx cdk deploy -c environment=dev WebBackendAuroraStack --profile aoe-dev
```

Other commands:
```bash
npx cdk diff                # Compare deployed vs current state
npx cdk synth               # Synthesize CloudFormation
npx cdk destroy -c environment=dev --all  # Destroy stacks
npm run build               # Compile TypeScript
```

## Code Structure Patterns

### Backend API Routes (aoe-web-backend)

Routes are versioned and organized by domain:
- `/api/routes-root/`: Root-level routes (h5p, embed)
- `/api/routes-v1/`: V1 API routes
- `/api/routes-v2/`: V2 API routes

Common patterns:
- Controllers in `/controllers/` handle business logic
- Queries in `/query/` contain database operations
- Services in `/services/` provide reusable functionality
- Resources in `/resource/` manage external connections (DB clients, Redis, Kafka, OIDC)
- Domain models in `/domain/aoeModels.ts`

### Frontend Structure (aoe-web-frontend)

Angular application organized by:
- `/views/`: Page-level components
- `/components/`: Reusable UI components
- `/containers/`: Container components
- `/services/`: Angular services
- `/models/`: TypeScript interfaces/types
- `/guards/`: Route guards
- `/pipes/`: Custom pipes
- `/directives/`: Custom directives

### Infrastructure (aoe-infra)

CDK stacks in `/lib/` directory:
- Environment-specific config in `/environments/<env>.json`
- Sensitive config in AWS Parameter Store with prefix `/<environment>/<serviceName>/`
- Security groups defined in `security-groups.ts`
- Database secrets in AWS Secrets Manager

## Key Technologies

### Backend
- Express 5 (aoe-web-backend, aoe-semantic-apis, aoe-streaming-app)
- TypeScript 5.9
- PostgreSQL with pg-promise
- OpenSearch client
- Redis client v4 (backend) / v3 (semantic-apis)
- KafkaJS for Kafka integration
- AWS SDK for S3 interactions
- Spring Boot 3 with Java 17 (data-analytics, data-services)

### Frontend
- Angular 20
- RxJS 7
- ngx-translate for i18n
- Bootstrap 4.6
- CoreUI components

### DevOps
- Docker & Docker Compose
- AWS CDK for infrastructure
- Biome for linting (all services)
- Playwright for E2E testing
- Jest for unit testing

## Testing

Run tests in individual service directories:
- Node.js services: `npm test` (Jest)
- Spring Boot services: `mvn test` (JUnit)
- E2E tests: `./run-tests.sh` (from repo root)

## AWS Environments

Three environments configured:
- **dev**: Account 339713180834
- **qa**: Account 058264216444
- **prod**: Account 381492241240

All use AWS SSO via oph-federation session in eu-west-1 region.

## Docker Compose

Three compose files:
- `docker-compose.yml`: Base configuration
- `docker-compose.local-dev.yml`: Local development overrides
- `docker-compose.ci-playwright.yml`: CI/Playwright testing

Services include: postgres, mongo, opensearch, redis, zookeeper, kafka (2 brokers), localstack (S3), aoe-oidc-server (mock OIDC)

## Database Migrations

Database schema is managed through SQL initialization scripts:
- PostgreSQL init: `/docker/init-scripts/aoe-init.sql`
- MongoDB init: `/docker/init-scripts/init-mongo.js`

No formal migration tool is used; schema changes should be applied manually or via init scripts.
