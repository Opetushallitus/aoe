package fi.csc.provider.model.response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class EducationalAudience {

    @JsonProperty
    private String id;

    @JsonProperty
    private String educationalrole;

    @JsonProperty
    private String educationalmaterialid;

    @JsonProperty
    private String educationalrolekey;

    public String getId() {
        return id;
    }

    public String getEducationalrole() {
        return educationalrole;
    }

    public String getEducationalmaterialid() {
        return educationalmaterialid;
    }

    public String getEducationalrolekey() {
        return educationalrolekey;
    }
}
