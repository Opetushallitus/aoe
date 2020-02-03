package fi.csc.provider.model.response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class EducationalLevel {

    @JsonProperty
    private String id;

    @JsonProperty
    private String value;

    @JsonProperty
    private String educationalmaterialid;

    @JsonProperty
    private String educationallevelkey;

    public String getId() {
        return id;
    }

    public String getValue() {
        return value;
    }

    public String getEducationalmaterialid() {
        return educationalmaterialid;
    }

    public String getEducationallevelkey() {
        return educationallevelkey;
    }
}
