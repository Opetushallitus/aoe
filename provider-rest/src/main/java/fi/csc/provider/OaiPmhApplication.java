package fi.csc.provider;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OaiPmhApplication {

    public static void main(String[] args) {
        // SpringApplication.run(OaiPmhApplication.class, args);
        SpringApplication app = new SpringApplication(OaiPmhApplication.class);
        app.setBannerMode(Banner.Mode.OFF);
        app.run(args);
    }
}
