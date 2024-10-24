package fi.csc.processor.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.stream.Stream;

public enum TargetEnv {
    PROD("prod"),
    TEST("test");

    private final String value;

    TargetEnv(String value) {
        this.value = value;
    }

    @JsonCreator
    public static TargetEnv decode(final String value) {
        return Stream.of(TargetEnv.values())
            .filter(targetEnum -> targetEnum.value.equalsIgnoreCase(value))
            .findFirst()
            .orElse(null);
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
