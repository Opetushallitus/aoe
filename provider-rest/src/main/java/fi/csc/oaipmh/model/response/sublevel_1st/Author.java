package fi.csc.oaipmh.model.response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class Author {

    @JsonProperty
    private String id;

    @JsonProperty
    private String authorname;

    @JsonProperty
    private String organization;

    @JsonProperty
    private String educationalmaterialid;

    @JsonProperty
    private String organizationkey;
}
