FROM maven:3.8.5-openjdk-17-slim AS build
WORKDIR /app
ADD . .
RUN mvn clean package -DskipTests

FROM openjdk:17-slim
WORKDIR /app
COPY --from=build /app/oaipmh-provider/target/oaipmh-provider.jar oaipmh-provider.jar
RUN sh -c "touch oaipmh-provider.jar"
ENTRYPOINT ["java", "-Xms512m", "-Xmx512m", "-Djava.security.egd=file:/dev/./urandom", "-jar", "oaipmh-provider.jar"]
