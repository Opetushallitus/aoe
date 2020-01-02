FROM openjdk:13

ENV JVM_OPTS="-Xms512m -Xmx512m"
ADD maven/provider-rest-0.0.1.jar app.jar
RUN sh -c 'touch /app.jar'
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]
