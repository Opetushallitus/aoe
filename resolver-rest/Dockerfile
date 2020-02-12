FROM openjdk:13-alpine
MAINTAINER Mika Ropponen
RUN apk update && apk upgrade
ADD maven/resolver-rest-0.0.1.jar app.jar
RUN sh -c 'touch /app.jar'
ENTRYPOINT ["java","-Xms512m","-Xmx512m","-Djava.security.egd=file:/dev/./urandom","-Dspring.profiles.active=prod","-jar","/app.jar"]
