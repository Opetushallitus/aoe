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

    public static Language fromString(String text) {
        for (Language language : Language.values()) {
            if (language.abbr.equalsIgnoreCase(text)) {
                return language;
            }
        }
        return null;
    }

    @Override
    public String toString() {
        return abbr;
    }
}
