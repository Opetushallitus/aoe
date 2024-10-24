package fi.csc.provider.service.impl;

import fi.csc.provider.enumeration.Language;
import fi.csc.provider.model.aoe_response.AoeMetadata;
import fi.csc.provider.model.aoe_response.sublevel_1st.AccessibilityFeature;
import fi.csc.provider.model.aoe_response.sublevel_1st.AccessibilityHazard;
import fi.csc.provider.model.aoe_response.sublevel_1st.LearningResourceType;
import fi.csc.provider.model.aoe_response.sublevel_1st.Publisher;
import fi.csc.provider.model.xml_lrmi.LrmiMetadata;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.*;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.sublevel_2nd.GeneralType;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.sublevel_2nd.IsBasedOnAuthor;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.sublevel_2nd.Url;
import fi.csc.provider.service.MigrationService;
import jakarta.xml.bind.JAXBElement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.xml.namespace.QName;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MigrationServiceImpl implements MigrationService {
    private Environment env;

    @Value("#{'${metadata.lrmi.learning-resource.types}'.split(',')}")
    private List<String> learningResourceTypes;

    @Autowired
    public MigrationServiceImpl(Environment env) {
        this.env = env;
    }

    /**
     * Parent method for the metadata conversion from the AOE metadata to LRMI metadata. Basic information provided in
     * DublinCore metadata format. Descriptive information provided in LRMI metadata format.
     *
     * @param amd AOE metadata source
     * @return Resulting LRMI metadata
     */
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

        // ID set temporarily to be moved to the header block after the metadata migration.
        // lrmi.setIdentifier("oai:aoe.fi:" + amd.getId());
        lrmi.setIdentifier("oai:" + env.getProperty("aoe.oai-identifier.repository-identifier") + ":" + amd.getId());

        // dc:identifier
        // URN identifier provided if already registered.
        lrmi.setIdentifierURN(amd.getUrn());

        // dc:title
        // Titles (headers) of the educational material.
        lrmi.setTitle(amd.getMaterialname() != null ? amd.getMaterialname().stream()
            .filter(d -> !d.getMaterialname().isEmpty())
            .map(d -> new LangValue(d.getLanguage(), d.getMaterialname()))
            .collect(Collectors.toList()) : null);

        // dc:date
        lrmi.setDate(amd.getCreatedat()); // updated ???

        // dc:description
        // Descriptions of the educational material.
        lrmi.setDescription(amd.getMaterialdescription() != null ? amd.getMaterialdescription().stream()
            .filter(d -> !d.getDescription().isEmpty())
            .map(d -> new LangValue(d.getLanguage(), d.getDescription()))
            .collect(Collectors.toList()) : null);

        // dc:description
        // Description for the thumbnail image.
        // Append thumbnail description to descriptions collection.
        if (amd.getThumbnail() != null) {

            if (amd.getThumbnail().getFilepath() != null && amd.getThumbnail().getMimetype() != null &&
                !amd.getThumbnail().getFilepath().isEmpty() && !amd.getThumbnail().getMimetype().isEmpty()) {
                lrmi.setThumbnail(new Thumbnail(amd.getThumbnail().getFilepath(), amd.getThumbnail().getMimetype()));
            }
        }

        // dc:rights
        // Licences attached to the educational material publishing.
        lrmi.setRights(amd.getLicensecode());

        // dc:publisher
        // Person or organization responsible for the eucational material publishing.
        lrmi.setPublisher(amd.getPublisher() != null && !amd.getPublisher().isEmpty() ? amd.getPublisher().stream()
            .filter(p -> !p.getName().isEmpty())
            .map(Publisher::getName)
            .collect(Collectors.toList()) : null);

        // dc:type
        // Material types like video or audio.
        lrmi.setType(amd.getLearningresourcetype() != null ? amd.getLearningresourcetype().stream()
            .filter(l -> !l.getValue().isEmpty())
            .map(LearningResourceType::getValue)
            .collect(Collectors.toList()) : null);

        // dc:valid
        // At expiration time the educational material is archived and not available for the users anymore.
        lrmi.setValid(amd.getExpires());
    }

    /**
     * Convert AOE data model into LRMI metadata for the OAI-PMH harvesting interface. Set explicit null value for XML
     * parser to avoid empty XML elements in harvesting results.
     *
     * @param amd  Source data from AOE service.
     * @param lrmi Target LRMI data model.
     */
    private void setLrmiData(AoeMetadata amd, LrmiMetadata lrmi) {

        // Temporary deleted status based on AOE obsoleted field and expires date/time - dropped out from the final LRMI results.
        lrmi.setDeleted(amd.getObsoleted() || (amd.getExpires() != null && amd.getExpires().isBefore(LocalDateTime.now(ZoneOffset.UTC))));

        // lrmi_fi:dateCreated
        // Original creation time for the educational material (first upload).
        lrmi.setDateCreated(amd.getCreatedat());

        // lrmi_fi:dateUpdated
        // Last modification time for the educational material.
        lrmi.setDateModified(amd.getUpdatedat());

        // Invisible field (always null) for specifying the attribute status="deleted"
        lrmi.setArchivedAt(amd.getArchivedat());

        // An estimate for the user's time consumed with the educational material.
        lrmi.setTimeRequired(amd.getTimerequired().isEmpty() ? null : amd.getTimerequired());

        // lrmi_fi:author
        // Authors can be persons or organizations (or mixed).
        // Different LRMI metadata model for both types.
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

        // lrmi_fi:about > lrmi_fi:thing (dc:subject)
        setLrmiAboutThing(amd, lrmi);

        // lrmi_fi:material
        // Educational material file or link.
        lrmi.setMaterial(amd.getMaterials() == null ? null : amd.getMaterials().stream()
            // .filter(m -> !m.getOriginalfilename().isEmpty() && !m.getFilepath().isEmpty() && !m.getMimetype().isEmpty())
            .map(m -> {
                Material material = new Material();

                // File material (majority)
                if (m.getLink() == null || m.getLink().isEmpty()) {
                    material.setDisplayNames(m.getMaterialdisplayname() == null ? null : m.getMaterialdisplayname().stream()
                        .filter(n -> !n.getDisplayname().isEmpty() && !n.getLanguage().isEmpty())
                        .map(n -> new LangValue(Language.fromString(n.getLanguage()), n.getDisplayname()))
                        .collect(Collectors.toList()));
                    material.setUrl(m.getFilepath());
                    material.setPdfUrl(m.getPdfpath() != null && !m.getPdfpath().isEmpty() ?
                        new Url(m.getPdfpath(), "application/pdf") : null);
                    material.setPosition(m.getPriority());
                    material.setFormat(m.getMimetype());
                    material.setFileSize(m.getFilesize());
                    material.setInLanguage(m.getLanguage());
                    return material;
                }

                // Link material (minority)
                material.setDisplayNames(m.getMaterialdisplayname() == null ? null : m.getMaterialdisplayname().stream()
                    .filter(n -> !n.getDisplayname().isEmpty() && !n.getLanguage().isEmpty())
                    .map(n -> new LangValue(Language.fromString(n.getLanguage()), n.getDisplayname()))
                    .collect(Collectors.toList()));
                material.setUrl(m.getLink());
                material.setFormat(m.getMimetype() == null || m.getMimetype().isEmpty() ? "text/html" : m.getMimetype());
                return material;
            })
            .collect(Collectors.toList()));

        // lrmi_fi:educationalAudience
        // Target audience of the educational material.
        lrmi.setEducationalAudience(amd.getEducationalaudience() == null ? null : amd.getEducationalaudience().stream()
            .filter(e -> !e.getEducationalrole().isEmpty())
            .map(e -> {
                EducationalAudience educationalAudience = new EducationalAudience();
                educationalAudience.setEducationalRole(e.getEducationalrole());
                return educationalAudience;
            })
            .collect(Collectors.toList()));

        // lrmi_fi:accessibilityFeature
        // Any accessibility feature worth mention.
        lrmi.setAccessibilityFeature(amd.getAccessibilityfeature() == null ? null : amd.getAccessibilityfeature().stream()
            .filter(a -> !a.getValue().isEmpty())
            .map(AccessibilityFeature::getValue)
            .toArray(String[]::new));

        // lrmi_fi:accessibilityHazard
        // Accessibility restrictions or warnings for the user's disabilities.
        lrmi.setAccessibilityHazard(amd.getAccessibilityhazard() == null ? null : amd.getAccessibilityhazard().stream()
            .filter(a -> !a.getValue().isEmpty())
            .map(AccessibilityHazard::getValue)
            .toArray(String[]::new));

        // lrmi_fi:isBasedOn
        // Sources the education material is based on.
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

        // lrmi_fi:inLanguage
        // Collect unique inLanguage root object values from the material languages.
        // Languages used in the educational material files and links.
        lrmi.setInLanguage(amd.getMaterials() == null ? null : amd.getMaterials().stream()
            .filter(m -> !m.getLanguage().isEmpty())
            .map(fi.csc.provider.model.aoe_response.sublevel_1st.Material::getLanguage)
            .collect(Collectors.toSet()));

        // LearningResource: EducationalLevel
        // Level of an educational institution the educational material is meant for.
        lrmi.setLearningResources(amd.getEducationallevel() == null ? null : amd.getEducationallevel().stream()
            .filter(e -> !e.getValue().isEmpty())
            .map(e -> {
                GeneralType generalType = new GeneralType();
                generalType.setValue(e.getValue());
                return new JAXBElement<>(new QName("lrmi_fi:educationalLevel"), GeneralType.class, generalType);
            })
            .collect(Collectors.toCollection(lrmi.getLearningResources() == null ? ArrayList::new : lrmi::getLearningResources))
        );

        // LearningResource: EducationalUse
        // Purpose of the educational material like "course material".
        lrmi.setLearningResources(amd.getEducationaluse() == null && lrmi.getLearningResources() == null ? null : amd.getEducationaluse().stream()
            .filter(e -> !e.getValue().isEmpty())
            .map(e -> {
                GeneralType generalType = new GeneralType();
                generalType.setValue(e.getValue());
                return new JAXBElement<>(new QName("lrmi_fi:educationalUse"), GeneralType.class, generalType);
            })
            .collect(Collectors.toCollection(lrmi.getLearningResources() == null ? ArrayList::new : lrmi::getLearningResources))
        );

        // LearningResource: EducationalAlignment, Teaches, etc.
        // AlignmentObject > educationalSubject converted to educationalAlignment.
        // NOTE: Exception in EducationalSubject structure in the LearningResource element.
        lrmi.setLearningResources(amd.getAlignmentobject() == null && lrmi.getLearningResources() == null ?
            null : amd.getAlignmentobject().stream()
            .filter(a -> learningResourceTypes.stream().anyMatch(a.getAlignmenttype()::equalsIgnoreCase))
            .map(a -> {
                GeneralType generalType = new GeneralType();
                generalType.setValue(a.getTargetname());

                if (a.getAlignmenttype().equalsIgnoreCase("educationalSubject")) {
                    EducationalAlignment educationalAlignment = new EducationalAlignment();
                    educationalAlignment.setEducationalSubject(generalType);
                    educationalAlignment.setEducationalFramework(a.getEducationalframework().isEmpty() ? null : a.getEducationalframework());
                    return new JAXBElement<>(new QName("lrmi_fi:educationalAlignment"), EducationalAlignment.class, educationalAlignment);
                }
                return new JAXBElement<>(new QName("lrmi_fi:" + a.getAlignmenttype()), GeneralType.class, generalType);
            })
            .collect(Collectors.toCollection(lrmi.getLearningResources() == null ? ArrayList::new : lrmi::getLearningResources))
        );

        // AlignmentObjects
        // Alignment types NOT found in learningResourceTypes (list) are converted into alignment objects.
        lrmi.setAlignmentObject(amd.getAlignmentobject() == null ? null : amd.getAlignmentobject().stream()
            //.filter(a -> !learningResourceTypes.contains(a.getAlignmenttype()))
            .filter(a -> learningResourceTypes.stream().noneMatch(a.getAlignmenttype()::equalsIgnoreCase))
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

    /**
     * Migrate descriptive keywords of an educational material with a semantic link. Keyword LRMI/XML presentation as
     * {@code <lrmi_fi:about><lrmi_fi:thing>...</lrmi_fi:thing></lrmi_fi:about>}.
     *
     * @param amd  AOE metadata source
     * @param lrmi LRMI metadata target
     * @see AoeMetadata
     * @see LrmiMetadata
     */
    void setLrmiAboutThing(AoeMetadata amd, LrmiMetadata lrmi) {
        lrmi.setAbouts(amd.getKeyword() == null ? null : amd.getKeyword().stream()
            .filter(k -> !k.getValue().isEmpty() && !k.getKeywordkey().isEmpty())
            .map(k -> {
                Thing thing = new Thing();
                thing.setName(k.getValue());
                thing.setIdentifier("https:" + k.getKeywordkey());

                About about = new About();
                about.setThing(thing);
                return about;
            })
            .collect(Collectors.toList()));
    }
}
