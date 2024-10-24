package fi.csc.processor.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.stream.Stream;

public enum Interval {
    DAY("day"),
    WEEK("week"),
    MONTH("month");

    private final String value;

    Interval(String value) {
        this.value = value;
    }

    @JsonCreator
    public static Interval decode(final String value) {
        return Stream.of(Interval.values())
            .filter(targetEnum -> targetEnum.value.equalsIgnoreCase(value))
            .findFirst()
            .orElse(null);
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
