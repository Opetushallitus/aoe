package fi.csc.provider.model.aoe_response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
@SuppressWarnings("unused")
public class Owner {

    @JsonProperty
    private String firstname;

    @JsonProperty
    private String lastname;

}
