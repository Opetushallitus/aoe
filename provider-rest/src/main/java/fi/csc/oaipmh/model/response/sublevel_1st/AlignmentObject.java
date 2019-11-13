package fi.csc.oaipmh.model.response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class AlignmentObject {

    @JsonProperty
    private String id;

    @JsonProperty
    private String educationalmaterialid;

    @JsonProperty
    private String alignmenttype;

    @JsonProperty
    private String targetname;

    @JsonProperty
    private String source;

    @JsonProperty
    private String educationalframework;

    @JsonProperty
    private String objectkey;

    public String getId() {
        return id;
    }

    public String getEducationalmaterialid() {
        return educationalmaterialid;
    }

    public String getAlignmenttype() {
        return alignmenttype;
    }

    public String getTargetname() {
        return targetname;
    }

    public String getSource() {
        return source;
    }

    public String getEducationalframework() {
        return educationalframework;
    }

    public String getObjectkey() {
        return objectkey;
    }
}
