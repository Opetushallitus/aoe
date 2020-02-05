package fi.csc.resolver.model;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class LinkId implements Serializable {

    private Integer metaId;
    private Integer materialId;
    private String version;

}
