package fi.csc.provider.service.impl;

import fi.csc.provider.model.response.AoeMetadata;
import fi.csc.provider.model.response.sublevel_1st.*;
import fi.csc.provider.model.xml_lrmi.LrmiMetadata;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.AlignmentObject;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.Author;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.EducationalAudience;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.InLanguage;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.IsBasedOn;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.Material;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.*;
import fi.csc.provider.service.MigrationService;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class MigrationServiceImpl implements MigrationService {

    @Override
    public LrmiMetadata migrateAoeToLrmi(AoeMetadata amd) {
        LrmiMetadata lrmi = new LrmiMetadata();
        setDublinCoreData(amd, lrmi);
        setLrmiData(amd, lrmi);
        return lrmi;
    }

    private void setDublinCoreData(AoeMetadata amd, LrmiMetadata lrmi) {

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
    }

    private void setLrmiData(AoeMetadata amd, LrmiMetadata lrmi) {

        // lrmi_fi:dateCreated
        lrmi.setDateCreated(amd.getCreatedat());

        // lrmi_fi:dateUpdated
        lrmi.setDateModified(amd.getUpdatedat());

        // Invisible field for specifying the attribute status="deleted"
        lrmi.setArchivedAt((amd.getArchivedat()));

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
            // .filter(m -> !m.getOriginalfilename().isEmpty() && !m.getFilepath().isEmpty() && !m.getMimetype().isEmpty())
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

        // lrmi_fi:educationalAlignment
        lrmi.setEducationalLevel(amd.getEducationallevel() != null ? amd.getEducationallevel().stream()
            .filter(a -> !a.getValue().isEmpty())
            .map(EducationalLevel::getValue)
            .toArray(String[]::new) : null);

        // lrmi_fi:educationalUse
        lrmi.setEducationalUse(amd.getEducationaluse() != null ? amd.getEducationaluse().stream()
            .filter(a -> !a.getValue().isEmpty())
            .map(EducationalUse::getValue)
            .toArray(String[]::new) : null);

        // lrmi_fi:isBasedOn
        lrmi.setIsBasedOn(amd.getIsbasedon() != null ? amd.getIsbasedon().stream()
            .filter(i -> !i.getMaterialname().isEmpty() && !i.getUrl().isEmpty())
            .map(i -> {
                IsBasedOn isBasedOn = new IsBasedOn();
                isBasedOn.setUrl(i.getUrl());
                isBasedOn.setName(i.getMaterialname());
                isBasedOn.setAuthor(i.getAuthor());
                return isBasedOn;
            })
            .collect(Collectors.toList()) : null);

        // lrmi_fi:inLanguage
        lrmi.setInLanguage(amd.getInlanguage() != null ? amd.getInlanguage().stream()
            .filter(i -> !i.getInlanguage().isEmpty())
            .map(i -> new InLanguage() {{
                setInLanguage(i.getInlanguage());
                setUrl(i.getUrl());
            }})
            .collect(Collectors.toList()) : null);

        // lrmi_fi:alignmentObject
        lrmi.setAlignmentObject(amd.getAlignmentobject() != null ? amd.getAlignmentobject().stream()
            .filter(a -> !a.getAlignmenttype().isEmpty() && !a.getTargetname().isEmpty())
            .map(a -> {
                AlignmentObject alignmentObject = new AlignmentObject();
                alignmentObject.setAlignmentType(a.getAlignmenttype());
                alignmentObject.setTargetName(a.getTargetname());
                alignmentObject.setTargetUrl(a.getTargeturl());
                alignmentObject.setEducationalFramework(a.getEducationalframework().isEmpty() ? null : a.getEducationalframework());
                return alignmentObject;
            })
            .collect(Collectors.toList()) : null);
    }
}
