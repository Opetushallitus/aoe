package fi.csc.processor.model;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MaterialActivity extends BaseEvent {
    private String eduMaterialId;
    private String interaction;

    public void setInteraction(String interaction) {
        this.interaction = interaction;
    }
}
