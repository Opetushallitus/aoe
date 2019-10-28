package fi.csc.oaipmh.service.impl;

import fi.csc.oaipmh.model.response.AoeMetadata;
import fi.csc.oaipmh.model.response.sublevel_1st.Keyword;
import fi.csc.oaipmh.model.xml_lrmi.LrmiMetadata;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.Author;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.LangValue;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.Material;
import fi.csc.oaipmh.service.MigrationService;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class MigrationServiceImpl implements MigrationService {

    @Override
    public LrmiMetadata migrateAoeToLrmi(AoeMetadata amd) {
        LrmiMetadata lrmi = new LrmiMetadata();

        lrmi.setIdentifier("oai:aoe.fi:" + amd.getId());

        lrmi.setTitle(amd.getMaterialname() != null ? amd.getMaterialname().stream()
            .filter(d -> !d.getMaterialname().isEmpty() && !d.getLanguage().isEmpty())
            .map(d -> new LangValue(d.getLanguage(), d.getMaterialname()))
            .collect(Collectors.toList()) : null);

        lrmi.setAuthor(amd.getAuthor() != null ? amd.getAuthor().stream()
            .filter(a -> !a.getAuthorname().isEmpty() && !a.getOrganization().isEmpty())
            .map(a -> new Author(a.getAuthorname(), a.getOrganization()))
            .collect(Collectors.toList()) : null);

        lrmi.setDate(amd.getCreatedat()); // updated ???

        lrmi.setDescription(amd.getMaterialdescription() != null ? amd.getMaterialdescription().stream()
            .filter(d -> !d.getDescription().isEmpty() && !d.getLanguage().isEmpty())
            .map(d -> new LangValue(d.getLanguage(), d.getDescription()))
            .collect(Collectors.toList()) : null);

        lrmi.setKeyword(amd.getKeyword() != null ? amd.getKeyword().stream()
            .filter(k -> !k.getValue().isEmpty())
            .map(Keyword::getValue)
            .toArray(String[]::new) : null);

        lrmi.setMaterial(amd.getMaterials() != null ? amd.getMaterials().stream()
            .filter(m -> !m.getOriginalfilename().isEmpty() && !m.getFilepath().isEmpty() && !m.getMimetype().isEmpty())
            .map(m -> new Material(m.getOriginalfilename(), m.getFilepath(), m.getPriority(), m.getMimetype(),
                m.getFilesize(), m.getLanguage()))
            .collect(Collectors.toList()) : null);

        return lrmi;
    }
}
