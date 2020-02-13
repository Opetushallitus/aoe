package fi.csc.data.service.impl;

import fi.csc.data.entity.Identifier;
import fi.csc.data.model.TimeIntervalRequest;
import fi.csc.data.repository.EducationalMaterialRepository;
import fi.csc.data.service.ResolverDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.ZoneOffset;

@Service
public class ResolverDataServiceImpl implements ResolverDataService {

    private EducationalMaterialRepository educationalMaterialRepository;

    @Autowired
    public void setIdentifierStreamRepository(EducationalMaterialRepository educationalMaterialRepository) {
        this.educationalMaterialRepository = educationalMaterialRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Identifier> getMetadataIdentifiers(TimeIntervalRequest timeIntervalRequest) {
        ZoneOffset zoneOffSetFrom = ZoneId.of("UTC").getRules().getOffset(timeIntervalRequest.getFrom());
        ZoneOffset zoneOffSetUntil = ZoneId.of("UTC").getRules().getOffset(timeIntervalRequest.getUntil());

        return this.educationalMaterialRepository.loadIdentifiers(
            timeIntervalRequest.getFrom().atOffset(zoneOffSetFrom),
            timeIntervalRequest.getUntil().atOffset(zoneOffSetUntil),
            PageRequest.of(timeIntervalRequest.getPage(), timeIntervalRequest.getSize(), Sort.by("id").ascending()));
    }
}
