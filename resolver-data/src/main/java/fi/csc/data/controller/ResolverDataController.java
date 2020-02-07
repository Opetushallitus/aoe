package fi.csc.data.controller;

import fi.csc.data.entity.EducationalMaterial;
import fi.csc.data.repository.EducationalMaterialRepository;
import fi.csc.data.entity.Identifier;
import fi.csc.data.service.ResolverDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@SuppressWarnings("unused")
@RestController
public class ResolverDataController {

    private EducationalMaterialRepository educationalMaterialRepository;
    private ResolverDataService resolverDataService;

    @Autowired
    public ResolverDataController(
        EducationalMaterialRepository educationalMaterialRepository,
        ResolverDataService resolverDataService) {
        this.educationalMaterialRepository = educationalMaterialRepository;
        this.resolverDataService = resolverDataService;
    }

    @GetMapping(value = "/health")
    public ResponseEntity<String> healthCheck() {
        return new ResponseEntity<>("UP", HttpStatus.OK);
    }

    @GetMapping(value = "/materials")
    public ResponseEntity<Iterable<EducationalMaterial>> getMaterials() {
        Iterable<EducationalMaterial> educationalMaterials = this.educationalMaterialRepository.findAll();
        return new ResponseEntity<>(educationalMaterials, HttpStatus.OK);
    }

    @GetMapping(value = "/identifiers")
    public ResponseEntity<List<Identifier>> getIdentifiers() {
        List<Identifier> identifierList = this.resolverDataService.getMetadataIdentifiers();
        return new ResponseEntity<>(identifierList, HttpStatus.OK);
    }
}
