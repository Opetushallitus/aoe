package fi.csc.oaipmh.model.response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class InLanguage {

    @JsonProperty
    private String id;

    @JsonProperty
    private String inlanguage;

    @JsonProperty
    private String url;

    @JsonProperty
    private String educationalmaterialid;

    public String getId() {
        return id;
    }

    public String getInlanguage() {
        return inlanguage;
    }

    public String getUrl() {
        return url;
    }

    public String getEducationalmaterialid() {
        return educationalmaterialid;
    }
}
