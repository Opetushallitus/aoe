package fi.csc.data;

import fi.csc.data.entity.EducationalMaterial;
import fi.csc.data.entity.Material;
import fi.csc.data.entity.Record;
import fi.csc.data.repository.EducationalMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.annotation.PostConstruct;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class ResolverDataApplication {

    private EducationalMaterialRepository educationalMaterialRepository;

    @Autowired
    public void setEducationalMaterialRepository(EducationalMaterialRepository educationalMaterialRepository) {
        this.educationalMaterialRepository = educationalMaterialRepository;
    }

    public static void main(String[] args) {
        SpringApplication.run(ResolverDataApplication.class, args);
    }

    @PostConstruct
    private void populateDatabase() {
        Record record1 = new Record(1L, 1L, "14tekijanoikeudetvirtuaaliluokassaopettajanoikeudet-1580209524845.pptx");
        Record record2 = new Record(2L, 2L, "Johdatustekolyyn-1572942352112.pdf");
        Material material1 = new Material(1L, 5L, "material-1", record1);
        Material material2 = new Material(2L, 8L, "material-2", record2);
        List<Material> materials1 = new ArrayList<>() {{
            add(material1);
        }};
        List<Material> materials2 = new ArrayList<>() {{
            add(material2);
        }};
        OffsetDateTime dateTime1 = OffsetDateTime.now(ZoneId.of("UTC")).minusDays(10L);
        OffsetDateTime dateTime2 = OffsetDateTime.now(ZoneId.of("UTC")).minusDays(20L);
        EducationalMaterial educationalMaterial1 = new EducationalMaterial(5L, dateTime1, "admin", materials1);
        EducationalMaterial educationalMaterial2 = new EducationalMaterial(8L, dateTime2, "admin", materials2);
        this.educationalMaterialRepository.save(educationalMaterial1);
        this.educationalMaterialRepository.save(educationalMaterial2);
    }
}
