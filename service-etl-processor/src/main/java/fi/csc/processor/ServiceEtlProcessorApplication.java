package fi.csc.processor;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ServiceEtlProcessorApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(ServiceEtlProcessorApplication.class);
        app.setBannerMode(Banner.Mode.OFF);
        app.run(args);
    }
}
