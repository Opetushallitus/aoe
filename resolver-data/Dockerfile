FROM maven:3.6.3-jdk-13
MAINTAINER Mika Ropponen
RUN mkdir -p /opt/resolver-data
WORKDIR /opt/resolver-data
ADD . /opt/resolver-data
RUN mvn clean package -DskipTests
RUN sh -c 'touch ./target/resolver-data-0.0.1.jar'
ENTRYPOINT ["java","-Xms512m","-Xmx512m","-Djava.security.egd=file:/dev/./urandom","-jar","./target/resolver-data-0.0.1.jar"]
