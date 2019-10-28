package fi.csc.oaipmh.model.response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class MaterialName {

    @JsonProperty
    private String id;

    @JsonProperty
    private String materialname;

    @JsonProperty
    private String language;

    @JsonProperty
    private String slug;

    @JsonProperty
    private String educationalmaterialid;

    public String getId() {
        return id;
    }

    public String getMaterialname() {
        return materialname;
    }

    public String getLanguage() {
        return language;
    }

    public String getSlug() {
        return slug;
    }

    public String getEducationalmaterialid() {
        return educationalmaterialid;
    }
}
