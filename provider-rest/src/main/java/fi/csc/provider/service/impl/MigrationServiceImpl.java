package fi.csc.provider.service.impl;

import fi.csc.provider.model.aoe_response.AoeMetadata;
import fi.csc.provider.model.aoe_response.sublevel_1st.*;
import fi.csc.provider.model.xml_lrmi.LrmiMetadata;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.AlignmentObject;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.EducationalAudience;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.InLanguage;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.IsBasedOn;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.Material;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.*;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.sublevel_2nd.IsBasedOnAuthor;
import fi.csc.provider.service.MigrationService;
import org.springframework.stereotype.Service;

import javax.xml.bind.JAXBElement;
import javax.xml.namespace.QName;
import java.util.ArrayList;
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

    /**
     * Collect basic information from the AOE data model and convert into DublinCore metadata for the OAI-PMH harvesting
     * interface.
     *
     * @param amd  Source data from AOE service.
     * @param lrmi Target LRMI data model.
     */
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

    /**
     * Convert AOE data model into LRMI metadata for the OAI-PMH harvesting interface.
     * Set explicit null value for XML parser to avoid empty XML elements in harvesting results.
     *
     * @param amd Source data from AOE service.
     * @param lrmi Target LRMI data model.
     */
    private void setLrmiData(AoeMetadata amd, LrmiMetadata lrmi) {

        // lrmi_fi:dateCreated
        lrmi.setDateCreated(amd.getCreatedat());

        // lrmi_fi:dateUpdated
        lrmi.setDateModified(amd.getUpdatedat());

        // Invisible field for specifying the attribute status="deleted"
        lrmi.setArchivedAt(amd.getArchivedat());

        lrmi.setTimeRequired(amd.getTimerequired().isEmpty() ? null : amd.getTimerequired());

        // lrmi_fi:author
        lrmi.setAuthors(amd.getAuthor() == null ? null : amd.getAuthor().stream()
            .filter(a -> !a.getAuthorname().isEmpty() || !a.getOrganization().isEmpty())
            .map(a -> {
                if (a.getAuthorname().isEmpty()) {
                    return new JAXBElement<>(new QName("lrmi_fi:organization"), Organization.class, new Organization() {{
                        setLegalName(a.getOrganization());
                    }});
                }
                return new JAXBElement<>(new QName("lrmi_fi:person"), Person.class, new Person() {{
                    setName(a.getAuthorname());
                    setAffiliation(a.getOrganization().isEmpty() ? null : a.getOrganization());
                }});
            })
            .collect(Collectors.toList()));

        // lrmi_fi:material
        lrmi.setMaterial(amd.getMaterials() == null ? null : amd.getMaterials().stream()
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
            .collect(Collectors.toList()));

        // lrmi_fi:educationalAudience
        lrmi.setEducationalAudience(amd.getEducationalaudience() == null ? null : amd.getEducationalaudience().stream()
            .filter(e -> !e.getEducationalrole().isEmpty())
            .map(e -> {
                EducationalAudience educationalAudience = new EducationalAudience();
                educationalAudience.setEducationalRole(e.getEducationalrole());
                return educationalAudience;
            })
            .collect(Collectors.toList()));

        // lrmi_fi:accessibilityFeature
        lrmi.setAccessibilityFeature(amd.getAccessibilityfeature() == null ? null : amd.getAccessibilityfeature().stream()
            .filter(a -> !a.getValue().isEmpty())
            .map(AccessibilityFeature::getValue)
            .toArray(String[]::new));

        // lrmi_fi:accessibilityHazard
        lrmi.setAccessibilityHazard(amd.getAccessibilityhazard() == null ? null : amd.getAccessibilityhazard().stream()
            .filter(a -> !a.getValue().isEmpty())
            .map(AccessibilityHazard::getValue)
            .toArray(String[]::new));

        // EducationalLevel => lrmi_fi:alignmentObject
        // If EducationalLevel is present, append new AlignmentObject with alignmentType value "educationalLevel".
        lrmi.setAlignmentObject(amd.getEducationallevel() == null ? null : amd.getEducationallevel().stream()
            .filter(e -> !e.getValue().isEmpty())
            .map(e -> {
                AlignmentObject alignmentObject = new AlignmentObject();
                alignmentObject.setAlignmentType("educationalLevel");
                alignmentObject.setTargetName(e.getValue());
                return alignmentObject;
            })
            .collect(Collectors.toCollection(ArrayList::new)));

        // lrmi_fi:educationalUse
        lrmi.setEducationalUse(amd.getEducationaluse() == null ? null : amd.getEducationaluse().stream()
            .filter(a -> !a.getValue().isEmpty())
            .map(EducationalUse::getValue)
            .toArray(String[]::new));

        // lrmi_fi:isBasedOn
        lrmi.setIsBasedOn(amd.getIsbasedon() == null ? null : amd.getIsbasedon().stream()
            .filter(i -> !i.getMaterialname().isEmpty() && !i.getUrl().isEmpty())
            .map(i -> {
                IsBasedOn isBasedOn = new IsBasedOn();
                isBasedOn.setUrl(i.getUrl());
                isBasedOn.setName(i.getMaterialname());
                isBasedOn.setIsBasedOnAuthors(i.getAuthor() != null ? i.getAuthor().stream()
                    .map(a -> new IsBasedOnAuthor() {{
                        setAuthorName(a.getAuthorname());
                    }})
                    .collect(Collectors.toList()) : null);
                return isBasedOn;
            })
            .collect(Collectors.toList()));

        // TODO: Collect languages from sub-materials
        // lrmi_fi:inLanguage
        lrmi.setInLanguage(amd.getMaterials() == null ? null : amd.getMaterials().stream()
            .filter(m -> !m.getLanguage().isEmpty())
            .map(fi.csc.provider.model.aoe_response.sublevel_1st.Material::getLanguage)
            .collect(Collectors.toSet()));

        // lrmi_fi:alignmentObject
        // Always append new AlignmentObjects - data collected from multiple sources.
        lrmi.setAlignmentObject(amd.getAlignmentobject() == null ? null : amd.getAlignmentobject().stream()
            .filter(a -> !a.getAlignmenttype().isEmpty() && !a.getTargetname().isEmpty())
            .map(a -> {
                AlignmentObject alignmentObject = new AlignmentObject();
                alignmentObject.setAlignmentType(a.getAlignmenttype());
                alignmentObject.setTargetName(a.getTargetname());
                alignmentObject.setTargetUrl(a.getTargeturl());
                alignmentObject.setEducationalFramework(a.getEducationalframework().isEmpty() ? null : a.getEducationalframework());
                return alignmentObject;
            })
            .collect(Collectors.toCollection(lrmi.getAlignmentObject() == null ? ArrayList::new : lrmi::getAlignmentObject)));
    }
}
