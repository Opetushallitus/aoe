# Infrastructure

- Production: AWS ECS Fargate, Aurora (PostgreSQL), ElastiCache (Redis), OpenSearch
- The frontend is not on ECS: it is static files in `aoe-frontend-<env>`, served by CloudFront's default behavior over Origin Access Control, with an explicit behavior forwarding each backend path to the ALB. See [ecs-services-overview.md](ecs-services-overview.md).
- Sensitive config in AWS Parameter Store (`/<environment>/<serviceName>/`), database secrets in Secrets Manager
- Local: Docker Compose with LocalStack for S3, mock OIDC server — locally and in CI the frontend still runs in a container, so CloudFront routing is only exercised in a deployed environment
