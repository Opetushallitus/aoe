package fi.csc.provider.model.aoe_response.sublevel_1st.sublevel_2nd;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@SuppressWarnings("unused")
public class IsBasedOnAuthor {

    @JsonProperty
    private Long id;

    @JsonProperty
    private String authorname;

    @JsonProperty
    private Long isbasedonid;

}
