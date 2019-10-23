package fi.csc.oaipmh.model.response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class IsBasedOn {

    @JsonProperty
    private String id;

    @JsonProperty
    private String author;

    @JsonProperty
    private String url;

    @JsonProperty
    private String materialname;

    @JsonProperty
    private String educationalmaterialid;
}
