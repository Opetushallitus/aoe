package fi.csc.processor.model.request;

import fi.csc.processor.model.BaseEvent;
import fi.csc.processor.model.Metadata;
import lombok.*;

@Getter
@Setter
public class MaterialActivity extends BaseEvent {
    private String eduMaterialId;
    private String interaction;
    private Metadata metadata;

    public void setInteraction(String interaction) {
        this.interaction = interaction;
    }
}
