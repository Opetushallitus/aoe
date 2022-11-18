package fi.csc.processor.model;

import fi.csc.processor.enumeration.Interaction;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MaterialActivity extends BaseEvent {
    private String eduMaterialId;
    private Interaction interaction;

    public void setInteraction(String interaction) {
        this.interaction = Interaction.fromString(interaction);
    }
}
