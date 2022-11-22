package fi.csc.processor.model.document;

import fi.csc.processor.enumeration.Interaction;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@ToString
@Document(collection = "material_activity")
public class MaterialActivityDocument extends BaseCollection {
    private String eduMaterialId;
    private Interaction interaction;

    public Interaction getInteraction() {
        return interaction;
    }

    public void setInteraction(String interaction) {
        this.interaction = Interaction.fromString(interaction);
    }

    public void setInteraction(Interaction interaction) {
        this.interaction = interaction;
    }
}
