package fi.csc.provider.model.aoe_response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@SuppressWarnings("unused")
public class IsBasedOn {

    @JsonProperty
    private String id;

    @JsonProperty
    private String[] author;

    @JsonProperty
    private String url;

    @JsonProperty
    private String materialname;

    @JsonProperty
    private String educationalmaterialid;

}
