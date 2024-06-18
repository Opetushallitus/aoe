FROM maven:3.8.4-openjdk-17-slim as build
WORKDIR /app
ADD . .
RUN mvn package -DskipTests && \
    sh -c "touch ./service-etl-processor/target/service-etl-processor-0.0.1-exec.jar"

FROM openjdk:17-slim
WORKDIR /app
COPY --from=build /app/service-etl-processor/target/service-etl-processor-0.0.1-exec.jar service-etl-processor.jar
ENTRYPOINT ["java", "-Xms512m", "-Xmx512m", "-Djava.security.egd=file:/dev/./urandom", "-jar", "service-etl-processor.jar"]
