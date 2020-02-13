package fi.csc.provider.model.aoe_response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;
import fi.csc.provider.enumeration.Language;

@SuppressWarnings("unused")
public class MaterialDescription {

    @JsonProperty
    private String id;

    @JsonProperty
    private String description;

    @JsonProperty
    private Language language;

    @JsonProperty
    private String educationalmaterialid;

    public String getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public Language getLanguage() {
        return language;
    }

    public String getEducationalmaterialid() {
        return educationalmaterialid;
    }
}
