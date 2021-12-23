# AOE Data Services

## OAI-PMH Provider
- Module: provider-rest
- Running on ports: 8001 (prod), 8002 (test)
- Java version: OpenJDK 17
- Spring Boot version: 2.2.4.RELEASE
- Built on Docker image: maven:3.8.4-openjdk-17-slim

### Description
Integration service for metadata harvesting from external systems.
Service interface implements [OAI-PMH protocol](https://www.openarchives.org/OAI/2.0/openarchivesprotocol.htm).

### Management

#### Build and run test instance
```
$ sudo docker-compose -f docker-compose.demo.yml build
$ sudo docker-compose -f docker-compose.demo.yml up
```
#### Build and run prod instance
```
$ sudo docker-compose -f docker-compose.prod.yml build
$ sudo docker-compose -f docker-compose.prod.yml up
```
