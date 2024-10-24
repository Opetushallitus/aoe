package fi.csc.provider.model.aoe_response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
@SuppressWarnings("unused")
public class Publisher {

    @JsonProperty
    private String id;

    @JsonProperty
    private String name;

    @JsonProperty
    private String educationalmaterialid;

    @JsonProperty
    private String publisherkey;

}
