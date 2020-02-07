package fi.csc.data;

import fi.csc.data.entity.EducationalMaterial;
import fi.csc.data.entity.Material;
import fi.csc.data.entity.Record;
import fi.csc.data.repository.EducationalMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.annotation.PostConstruct;
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
        Material material1 = new Material(1L, 1L, "material-1", record1);
        List<Material> materials1 = new ArrayList<>() {{
            add(material1);
        }};
        EducationalMaterial educationalMaterial1 = new EducationalMaterial(5L, "admin", materials1);
        this.educationalMaterialRepository.save(educationalMaterial1);
    }
}
