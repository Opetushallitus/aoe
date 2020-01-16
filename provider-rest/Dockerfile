FROM openjdk:13-alpine
ADD maven/provider-rest-0.0.1.jar app.jar
RUN sh -c 'touch /app.jar'
ENTRYPOINT ["java","-Xms512m","-Xmx512m","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]

# FROM maven:3.6.3-jdk-13-alpine

# MAINTAINER Mika Ropponen

# COPY pom.xml /build/
# COPY src /build/src/

# WORKDIR /build/
# RUN mvn package -DskipTests

# ADD /target/provider-rest-0.0.1.jar app.jar
# RUN sh -c 'touch /app.jar'
# ENTRYPOINT ["java","-Xms512m","-Xmx512m","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]
