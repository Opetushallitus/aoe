package fi.csc.oaipmh.model.response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class MaterialDescription {

    @JsonProperty
    private String id;

    @JsonProperty
    private String description;

    @JsonProperty
    private String language;

    @JsonProperty
    private String educationalmaterialid;

    public String getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public String getLanguage() {
        return language;
    }

    public String getEducationalmaterialid() {
        return educationalmaterialid;
    }
}
