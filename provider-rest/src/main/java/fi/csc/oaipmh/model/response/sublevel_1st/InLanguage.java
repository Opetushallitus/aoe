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
}
