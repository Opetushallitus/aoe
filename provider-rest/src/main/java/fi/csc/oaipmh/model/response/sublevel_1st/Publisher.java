package fi.csc.oaipmh.model.response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class Publisher {

    @JsonProperty
    private String id;

    @JsonProperty
    private String name;

    @JsonProperty
    private String educationalmaterialid;

    @JsonProperty
    private String publisherkey;
}
