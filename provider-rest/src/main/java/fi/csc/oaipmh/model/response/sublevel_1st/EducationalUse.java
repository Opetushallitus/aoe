package fi.csc.oaipmh.model.response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class EducationalUse {

    @JsonProperty
    private String id;

    @JsonProperty
    private String value;

    @JsonProperty
    private String educationalmaterialid;

    @JsonProperty
    private String educationalusekey;
}
