package fi.csc.processor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ServiceEtlProcessorApplication {

    private static final Logger LOG = LoggerFactory.getLogger(ServiceEtlProcessorApplication.class.getSimpleName());

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(ServiceEtlProcessorApplication.class);
        app.setBannerMode(Banner.Mode.OFF);
        app.run(args);
    }

}
