package fi.csc.data;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ResolverDataApplication {

    public static void main(String[] args) {
        // SpringApplication.run(ResolverDataApplication.class, args);
        SpringApplication app = new SpringApplication(ResolverDataApplication.class);
        app.setBannerMode(Banner.Mode.OFF);
        app.run(args);
    }
}
