package fi.csc.provider.model.aoe_response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;
import fi.csc.provider.enumeration.Language;
import lombok.Getter;

@Getter
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

}
