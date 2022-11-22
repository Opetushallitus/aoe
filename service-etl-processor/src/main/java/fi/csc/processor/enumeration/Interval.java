package fi.csc.processor.enumeration;

public enum Interval {
    DAY("day"),
    WEEK("week"),
    MONTH("month");

    private final String value;

    Interval(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Interval fromValue(String string) {
        for (Interval interval : Interval.values()) {
            if (interval.value.equalsIgnoreCase(string)) {
                return interval;
            }
        }
        return null;
    }
}
