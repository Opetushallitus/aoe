package fi.csc.data.controller;

import fi.csc.data.entity.EducationalMaterial;
import fi.csc.data.repository.EducationalMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@SuppressWarnings("unused")
@RestController
public class ResolverDataController {

    private EducationalMaterialRepository educationalMaterialRepository;

    @Autowired
    public void setEducationalMaterialRepository(EducationalMaterialRepository educationalMaterialRepository) {
        this.educationalMaterialRepository = educationalMaterialRepository;
    }

    @GetMapping(value = "/health")
    public ResponseEntity<String> healthCheck() {
        return new ResponseEntity<>("UP", HttpStatus.OK);
    }

    @GetMapping(value = "/data")
    public ResponseEntity<Iterable<EducationalMaterial>> getData() {
        Iterable<EducationalMaterial> educationalMaterials = this.educationalMaterialRepository.findAll();
        return new ResponseEntity<>(educationalMaterials, HttpStatus.OK);
    }

    @GetMapping(value = "/data/{name}")
    public ResponseEntity<EducationalMaterial> saveDate(@PathVariable String name) {
        EducationalMaterial em = new EducationalMaterial();
        em.setName(name);
        return new ResponseEntity<>(this.educationalMaterialRepository.save(em), HttpStatus.OK);
    }
}
