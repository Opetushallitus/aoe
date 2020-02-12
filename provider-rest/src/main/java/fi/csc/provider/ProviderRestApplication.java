package fi.csc.provider;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProviderRestApplication {

    public static void main(String[] args) {
        // SpringApplication.run(ProviderRestApplication.class, args);
        SpringApplication app = new SpringApplication(ProviderRestApplication.class);
        app.setBannerMode(Banner.Mode.OFF);
        app.run(args);
    }
}
