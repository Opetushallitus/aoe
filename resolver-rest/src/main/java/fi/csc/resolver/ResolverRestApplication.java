package fi.csc.resolver;

import fi.csc.resolver.service.ResolverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.annotation.PostConstruct;

@SpringBootApplication
public class ResolverRestApplication {

    private ResolverService resolverService;

    @Autowired
    public void setResolverService(ResolverService resolverService) {
        this.resolverService = resolverService;
    }

    public static void main(String[] args) {
        SpringApplication.run(ResolverRestApplication.class, args);
    }

    @PostConstruct
    private void populateResources() {
        this.resolverService.populateLinkResources();
    }
}
