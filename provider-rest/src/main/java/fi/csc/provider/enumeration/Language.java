package fi.csc.provider.enumeration;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public enum Language {

    @JsonProperty("fi")
    FI("fi"),

    @JsonProperty("en")
    EN("en"),

    @JsonProperty("sv")
    SV("sv");

    private String abbr;

    Language(String abbr) {
        this.abbr = abbr;
    }

    public String getAbbr() {
        return abbr;
    }

    @Override
    public String toString() {
        return abbr;
    }
}
