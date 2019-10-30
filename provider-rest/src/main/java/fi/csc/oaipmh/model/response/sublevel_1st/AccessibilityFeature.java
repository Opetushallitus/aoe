package fi.csc.oaipmh.model.response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class AccessibilityFeature {

    @JsonProperty
    private String id;

    @JsonProperty
    private String value;

    @JsonProperty
    private String educationalmaterialid;

    @JsonProperty
    private String accessibilityfeaturekey;

    public String getId() {
        return id;
    }

    public String getValue() {
        return value;
    }

    public String getEducationalmaterialid() {
        return educationalmaterialid;
    }

    public String getAccessibilityfeaturekey() {
        return accessibilityfeaturekey;
    }
}
