package fi.csc.provider.model.aoe_response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;
import fi.csc.provider.model.aoe_response.sublevel_1st.sublevel_2nd.IsBasedOnAuthor;
import lombok.Getter;

import java.util.List;

@Getter
@SuppressWarnings("unused")
public class IsBasedOn {

    @JsonProperty
    private String id;

    @JsonProperty
    private List<IsBasedOnAuthor> author;

    @JsonProperty
    private String url;

    @JsonProperty
    private String materialname;

    @JsonProperty
    private String educationalmaterialid;

}
