package fi.csc.provider.model.aoe_response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;
import fi.csc.provider.enumeration.Language;

@SuppressWarnings("unused")
public class MaterialName {

    @JsonProperty
    private String id;

    @JsonProperty
    private String materialname;

    @JsonProperty
    private Language language;

    @JsonProperty
    private String slug;

    @JsonProperty
    private String educationalmaterialid;

    public String getId() {
        return id;
    }

    public String getMaterialname() {
        return materialname;
    }

    public Language getLanguage() {
        return language;
    }

    public String getSlug() {
        return slug;
    }

    public String getEducationalmaterialid() {
        return educationalmaterialid;
    }
}
