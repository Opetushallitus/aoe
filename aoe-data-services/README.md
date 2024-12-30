# AOE Data Services

## OAI-PMH Provider
- Module: oaipmh-provider
- Running on ports: 8001 (prod), 8002 (test)
- Java version: OpenJDK 17
- Spring Boot version: 3.2.4
- Build with Docker image: maven:3.8.5-openjdk-17-slim
- Run with Docker image: openjdk:17-slim

### Description
Integration service for metadata harvesting from external systems.
Service interface implements [OAI-PMH protocol](https://www.openarchives.org/OAI/2.0/openarchivesprotocol.htm).
