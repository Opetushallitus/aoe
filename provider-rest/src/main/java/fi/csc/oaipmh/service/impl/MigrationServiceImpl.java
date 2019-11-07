package fi.csc.oaipmh.service.impl;

import fi.csc.oaipmh.model.response.AoeMetadata;
import fi.csc.oaipmh.model.response.sublevel_1st.*;
import fi.csc.oaipmh.model.xml_lrmi.LrmiMetadata;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.Author;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.EducationalAudience;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.InLanguage;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.IsBasedOn;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.Material;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.*;
import fi.csc.oaipmh.service.MigrationService;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class MigrationServiceImpl implements MigrationService {

    @Override
    public LrmiMetadata migrateAoeToLrmi(AoeMetadata amd) {
        LrmiMetadata lrmi = new LrmiMetadata();

        /**
         * DCMI - Dublin Core Metadata Initiative
         */
        // dc:id
        lrmi.setIdentifier("oai:aoe.fi:" + amd.getId());

        // dc:title
        lrmi.setTitle(amd.getMaterialname() != null ? amd.getMaterialname().stream()
            .filter(d -> !d.getMaterialname().isEmpty())
            .map(d -> new LangValue(d.getLanguage(), d.getMaterialname()))
            .collect(Collectors.toList()) : null);

        // dc:date
        lrmi.setDate(amd.getCreatedat()); // updated ???

        // dc:description
        lrmi.setDescription(amd.getMaterialdescription() != null ? amd.getMaterialdescription().stream()
            .filter(d -> !d.getDescription().isEmpty())
            .map(d -> new LangValue(d.getLanguage(), d.getDescription()))
            .collect(Collectors.toList()) : null);

        // dc:subject
        lrmi.setKeyword(amd.getKeyword() != null && amd.getKeyword().size() > 0 ? amd.getKeyword().stream()
            .filter(k -> !k.getValue().isEmpty())
            .map(Keyword::getValue)
            .toArray(String[]::new) : null);

        // dc:rights
        lrmi.setRights(amd.getLicensecode());

        // dc:publisher
        lrmi.setPublisher(amd.getPublisher() != null && !amd.getPublisher().isEmpty() ? amd.getPublisher().stream()
            .filter(p -> !p.getName().isEmpty())
            .map(Publisher::getName)
            .collect(Collectors.toList()) : null);

        // dc:type
        lrmi.setType(amd.getLearningresourcetype() != null ? amd.getLearningresourcetype().stream()
            .filter(l -> !l.getValue().isEmpty())
            .map(LearningResourceType::getValue)
            .collect(Collectors.toList()) : null);

        // dc:valid
        lrmi.setValid(amd.getExpires());

        /**
         * LRMI - Learning Resource Metadata Initiative
         */
        lrmi.setDateCreated(amd.getCreatedat());
        lrmi.setDateModified(amd.getUpdatedat());
        lrmi.setArchivedAt(amd.getArchivedat());

        // lrmi_fi:author
        lrmi.setAuthor(amd.getAuthor() != null ? amd.getAuthor().stream()
            .filter(a -> !a.getAuthorname().isEmpty() && !a.getOrganization().isEmpty())
            .map(a -> {
                Author author = new Author();
                author.setName(a.getAuthorname());
                author.setAffiliation(a.getOrganization());
                return author;
            })
            .collect(Collectors.toList()) : null);

        // lrmi_fi:material
        lrmi.setMaterial(amd.getMaterials() != null ? amd.getMaterials().stream()
            .filter(m -> !m.getOriginalfilename().isEmpty() && !m.getFilepath().isEmpty() && !m.getMimetype().isEmpty())
            .map(m -> {
                Material material = new Material();
                material.setName(m.getOriginalfilename());
                material.setUrl(m.getFilepath());
                material.setPosition(m.getPriority());
                material.setFormat(m.getMimetype());
                material.setFileSize(m.getFilesize());
                material.setInLanguage(m.getLanguage());
                return material;
            })
            .collect(Collectors.toList()) : null);

        // lrmi_fi:educationalAudience
        lrmi.setEducationalAudience(amd.getEducationalaudience() != null ? amd.getEducationalaudience().stream()
            .filter(e -> !e.getEducationalrole().isEmpty())
            .map(e -> {
                EducationalAudience educationalAudience = new EducationalAudience();
                educationalAudience.setEducationalRole(e.getEducationalrole());
                return educationalAudience;
            })
            .collect(Collectors.toList()) : null);

        // lrmi_fi:isBasedOn
        lrmi.setIsBasedOn(amd.getIsbasedon() != null ? amd.getIsbasedon().stream()
            .filter(i -> !i.getMaterialname().isEmpty() && !i.getUrl().isEmpty())
            .map(i -> {
                IsBasedOn isBasedOn = new IsBasedOn();
                isBasedOn.setTitle(i.getMaterialname());
                isBasedOn.setContributor(i.getAuthor());
                isBasedOn.setIdentifier(i.getUrl());
                return isBasedOn;
            })
            .collect(Collectors.toList()) : null);

        // lrmi_fi:accessibilityFeature
        lrmi.setAccessibilityFeature(amd.getAccessibilityfeature() != null ? amd.getAccessibilityfeature().stream()
            .filter(a -> !a.getValue().isEmpty())
            .map(AccessibilityFeature::getValue)
            .toArray(String[]::new) : null);

        // lrmi_fi:accessibilityHazard
        lrmi.setAccessibilityHazard(amd.getAccessibilityhazard() != null ? amd.getAccessibilityhazard().stream()
            .filter(a -> !a.getValue().isEmpty())
            .map(AccessibilityHazard::getValue)
            .toArray(String[]::new) : null);

        // lrmi_fi:inLanguage
        lrmi.setInLanguage(amd.getInlanguage() != null ? amd.getInlanguage().stream()
            .filter(i -> !i.getInlanguage().isEmpty())
            .map(i -> new InLanguage() {{
                setInLanguage(i.getInlanguage());
                setUrl(i.getUrl());
            }})
            .collect(Collectors.toList()) : null);

        return lrmi;
    }
}
