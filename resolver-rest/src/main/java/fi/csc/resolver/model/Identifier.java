package fi.csc.resolver.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Identifier {

    private Long educationalMaterialId;
    private Long materialId;
    private String originalFileName;
    private String fileKey;

}
