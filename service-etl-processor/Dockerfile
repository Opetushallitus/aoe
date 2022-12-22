FROM maven:3.8.4-openjdk-17-slim
# RUN mkdir -p /opt/aoe-data-analytics
WORKDIR /opt/aoe-data-analytics
ADD . .
RUN mvn package -DskipTests && \
    sh -c "touch ./service-etl-processor/target/service-etl-processor-0.0.1-exec.jar"
ENTRYPOINT ["java","-Xms512m","-Xmx512m","-Djava.security.egd=file:/dev/./urandom","-jar","./service-etl-processor/target/service-etl-processor-0.0.1-exec.jar"]
