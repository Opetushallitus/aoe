FROM maven:3.8.4-openjdk-17-slim
MAINTAINER Mika Ropponen
RUN mkdir -p /opt/provider-rest-demo
WORKDIR /opt/provider-rest-demo
ADD . /opt/provider-rest-demo
RUN mvn clean package -DskipTests
RUN sh -c 'touch ./target/provider-rest-0.0.1.jar'
ENTRYPOINT ["java","-Xms512m","-Xmx512m","-Djava.security.egd=file:/dev/./urandom","-jar","./target/provider-rest-1.0.0.jar"]
