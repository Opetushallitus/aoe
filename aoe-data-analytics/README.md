# AOE Data Analytics

Microservices for querying analytics and statistics from databases.

Logical application components are separated in the modular structure of the project.

## Status Check
Status check endpoint provided by Actuator at
<pre>[api]/actuator/health</pre>

## Compile Project
Compile the project with all its modules at root
<pre>mvn package</pre>
OR repackage
<pre>mvn clean package spring-boot:repackage</pre>

## Run Project
Run the project with all its modules at root
<pre>mvn spring-boot:run</pre>
OR individually
<pre>mvn spring-boot:run -pl [module]</pre>
