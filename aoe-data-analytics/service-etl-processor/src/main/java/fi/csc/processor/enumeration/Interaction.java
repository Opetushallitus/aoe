package fi.csc.processor.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.stream.Stream;

public enum Interaction {
    VIEW("view"),
    SAVE("save"),
    LOAD("load"),
    EDIT("edit");

    private final String value;

    Interaction(String value) {
        this.value = value;
    }

    @JsonCreator
    public static Interaction decode(final String value) {
        return Stream.of(Interaction.values())
            .filter(targetEnum -> targetEnum.value.equalsIgnoreCase(value))
            .findFirst()
            .orElse(null);
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
