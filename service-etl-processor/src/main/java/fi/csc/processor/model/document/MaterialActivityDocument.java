package fi.csc.processor.model.document;

import fi.csc.processor.enumeration.Interaction;
import fi.csc.processor.model.Metadata;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "material_activity")
public class MaterialActivityDocument extends BaseCollection {
    private String eduMaterialId;
    private Interaction interaction;
    private Metadata metadata;

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
