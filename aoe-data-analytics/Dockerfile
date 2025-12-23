FROM maven:3.8.5-openjdk-17-slim@sha256:502e781d39f0b40fbd02eb23f5b7663618b76ba52034da218c64e92f6c5647be as build

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y curl openssl --no-install-recommends && \
    apt-get clean

COPY ./import_rds_certs.sh /certs/import_rds_certs.sh
#COPY import_rds_certs.sh /certs/import_rds_certs.sh

RUN --mount=type=secret,id=trust_store_password,required=true \
    TRUST_STORE_PASSWORD=$(cat /run/secrets/trust_store_password) \
    /certs/import_rds_certs.sh

WORKDIR /app
ADD . .
RUN mvn package -DskipTests

FROM openjdk:17.0.2-slim@sha256:aaa3b3cb27e3e520b8f116863d0580c438ed55ecfa0bc126b41f68c3f62f9774

# Copy the certs folder from the build stage
COPY --from=build /certs /certs

WORKDIR /app
COPY --from=build /app/target/aoe-data-analytics-0.0.1.jar aoe-data-analytics.jar
ENTRYPOINT ["sh", "-c", "java -Xms512m -Xmx512m -Djavax.net.ssl.trustStorePassword=$TRUST_STORE_PASS -Djavax.net.ssl.trustStore=/certs/rds-truststore.jks -Djava.security.egd=file:/dev/./urandom -jar aoe-data-analytics.jar"]
