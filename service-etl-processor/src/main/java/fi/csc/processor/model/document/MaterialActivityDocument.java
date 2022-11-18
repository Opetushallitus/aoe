package fi.csc.processor.model.document;

import fi.csc.processor.enumeration.Interaction;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "material_activity")
public class MaterialActivityDocument extends BaseCollection {
    private String eduMaterialId;
    private Interaction interaction;
}
