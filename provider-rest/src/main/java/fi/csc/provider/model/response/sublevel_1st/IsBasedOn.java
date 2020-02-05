package fi.csc.provider.model.response.sublevel_1st;

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

    public String getId() {
        return id;
    }

    public String getAuthor() {
        return author;
    }

    public String getUrl() {
        return url;
    }

    public String getMaterialname() {
        return materialname;
    }

    public String getEducationalmaterialid() {
        return educationalmaterialid;
    }
}
