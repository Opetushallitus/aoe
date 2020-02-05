package fi.csc.provider.model.response.sublevel_1st;

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

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEducationalmaterialid() {
        return educationalmaterialid;
    }

    public String getPublisherkey() {
        return publisherkey;
    }
}
