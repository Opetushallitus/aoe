FROM openjdk:13-alpine
MAINTAINER Mika Ropponen
RUN apk update && apk upgrade
VOLUME /tmp
EXPOSE 8003
RUN mkdir -p /app/
RUN mkdir -p /app/logs/
ADD maven/resolver-rest-0.0.1.jar app.jar
RUN sh -c 'touch /app.jar'
ENTRYPOINT ["java","-Xms512m","-Xmx512m","-Djava.security.egd=file:/dev/./urandom","-Dspring.profiles.active=prod","-jar","/app.jar"]
