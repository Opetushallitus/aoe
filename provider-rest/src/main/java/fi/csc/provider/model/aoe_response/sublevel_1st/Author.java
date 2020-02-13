package fi.csc.provider.model.aoe_response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class Author {

    @JsonProperty
    private String id;

    @JsonProperty
    private String authorname;

    @JsonProperty
    private String organization;

    @JsonProperty
    private String educationalmaterialid;

    @JsonProperty
    private String organizationkey;

    public String getId() {
        return id;
    }

    public String getAuthorname() {
        return authorname;
    }

    public String getOrganization() {
        return organization;
    }

    public String getEducationalmaterialid() {
        return educationalmaterialid;
    }

    public String getOrganizationkey() {
        return organizationkey;
    }
}
