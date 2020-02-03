package fi.csc.resolver.model;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class LinkId implements Serializable {

    private Integer meta_id;
    private Integer material_id;
    private String version;

}
