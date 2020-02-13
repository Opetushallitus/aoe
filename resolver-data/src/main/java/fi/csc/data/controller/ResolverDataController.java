package fi.csc.data.controller;

import fi.csc.data.entity.EducationalMaterial;
import fi.csc.data.entity.Identifier;
import fi.csc.data.model.TimeIntervalRequest;
import fi.csc.data.repository.EducationalMaterialRepository;
import fi.csc.data.service.ResolverDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

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

    @PostMapping(value = "/identifiers", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<Identifier> getIdentifiers(@RequestBody TimeIntervalRequest timeIntervalRequest) {
        return this.resolverDataService.getMetadataIdentifiers(timeIntervalRequest);
    }

    public EducationalMaterialRepository getEducationalMaterialRepository() {
        return educationalMaterialRepository;
    }
}
