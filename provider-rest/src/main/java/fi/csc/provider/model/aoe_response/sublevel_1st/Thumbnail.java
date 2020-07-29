package fi.csc.provider.model.aoe_response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
@SuppressWarnings("unused")
public class Thumbnail {

    @JsonProperty
    private String filepath;

    @JsonProperty
    private String mimetype;

}
