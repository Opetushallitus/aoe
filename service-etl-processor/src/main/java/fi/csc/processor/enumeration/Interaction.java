package fi.csc.processor.enumeration;

public enum Interaction {
    VIEW("view"),
    LOAD("load"),
    SAVE("save");

    private String name;

    Interaction(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public static Interaction fromString(String string) {
        for (Interaction interaction : Interaction.values()) {
            if (interaction.name.equalsIgnoreCase(string)) {
                return interaction;
            }
        }
        return null;
    }

    @Override
    public String toString() {
        return name;
    }
}
