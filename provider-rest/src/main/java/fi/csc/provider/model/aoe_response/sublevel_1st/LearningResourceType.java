package fi.csc.provider.model.aoe_response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class LearningResourceType {

    @JsonProperty
    private String id;

    @JsonProperty
    private String value;

    @JsonProperty
    private String educationalmaterialid;

    @JsonProperty
    private String learningresourcetypekey;

    public String getId() {
        return id;
    }

    public String getValue() {
        return value;
    }

    public String getEducationalmaterialid() {
        return educationalmaterialid;
    }

    public String getLearningresourcetypekey() {
        return learningresourcetypekey;
    }
}
