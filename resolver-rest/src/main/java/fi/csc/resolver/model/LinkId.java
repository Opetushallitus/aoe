package fi.csc.resolver.model;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class LinkId implements Serializable {

    private Long metaId;
    private Long materialId;
    private String version;

}
