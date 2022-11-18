package fi.csc.processor.enumeration;

public enum Interaction {
    VIEW("view"),
    LOAD("load"),
    SAVE("save");

    private final String value;

    Interaction(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Interaction fromString(String string) {
        for (Interaction interaction : Interaction.values()) {
            if (interaction.value.equalsIgnoreCase(string)) {
                return interaction;
            }
        }
        return null;
    }
}
