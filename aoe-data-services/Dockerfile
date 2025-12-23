FROM maven:3.8.5-openjdk-17-slim@sha256:502e781d39f0b40fbd02eb23f5b7663618b76ba52034da218c64e92f6c5647be AS build
WORKDIR /app
ADD . .
RUN mvn clean package -DskipTests

FROM openjdk:17.0.2-slim@sha256:aaa3b3cb27e3e520b8f116863d0580c438ed55ecfa0bc126b41f68c3f62f9774
WORKDIR /app
COPY --from=build /app/target/aoe-data-services-0.0.1.jar aoe-data-services.jar
ENTRYPOINT ["java", "-Xms512m", "-Xmx512m", "-Djava.security.egd=file:/dev/./urandom", "-jar", "aoe-data-services.jar"]
