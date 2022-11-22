package fi.csc.processor.model.document;

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
    private String interaction;
}
