package fi.csc.provider.model.aoe_response.sublevel_1st.sublevel_2nd;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
@SuppressWarnings("unused")
public class MaterialDisplayName {

    @JsonProperty
    private Long id;

    @JsonProperty
    private String displayname;

    @JsonProperty
    private String language;

    @JsonProperty
    private String materialid;
}
