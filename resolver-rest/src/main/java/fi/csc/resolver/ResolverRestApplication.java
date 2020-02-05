package fi.csc.resolver;

import fi.csc.resolver.model.Link;
import fi.csc.resolver.repository.LinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.annotation.PostConstruct;

@SpringBootApplication
public class ResolverRestApplication {

    private LinkRepository linkRepository;

    @Autowired
    public void setLinkRepository(LinkRepository linkRepository) {
        this.linkRepository = linkRepository;
    }

    public static void main(String[] args) {
        SpringApplication.run(ResolverRestApplication.class, args);
    }

    @PostConstruct
    public void populateH2() {
        Link link = new Link(2, 1, "latest", (short) 1, "85e7ab0180b6b0e09a54c7a750cc91e73776b94b", "https://demo.aoe.fi");
        // this.linkRepository.save(link);
    }

}
