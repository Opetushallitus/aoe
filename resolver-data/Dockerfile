FROM openjdk:13-alpine
MAINTAINER Mika Ropponen
ADD maven/resolver-data-0.0.1.jar app.jar
RUN sh -c 'touch /app.jar'
ENTRYPOINT ["java","-Xms512m","-Xmx512m","-Djava.security.egd=file:/dev/./urandom","-jar", "/app.jar"]
