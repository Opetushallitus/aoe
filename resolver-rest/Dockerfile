FROM maven:3.6.3-jdk-13
MAINTAINER Mika Ropponen
RUN mkdir -p /opt/resolver-rest
WORKDIR /opt/resolver-rest
ADD . /opt/resolver-rest
RUN mvn clean package -DskipTests
RUN sh -c 'touch ./target/resolver-rest-0.0.1.jar'
ENTRYPOINT ["java","-Xms512m","-Xmx512m","-Djava.security.egd=file:/dev/./urandom","-jar","./target/resolver-rest-0.0.1.jar"]
