package fi.csc.provider.model.aoe_response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;
import fi.csc.provider.enumeration.Language;
import lombok.Getter;

@Getter
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

}
