package fi.csc.resolver.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import java.io.Serializable;

@Entity
@Getter
@Setter
@NoArgsConstructor
@IdClass(LinkId.class)
public class Link implements Serializable {

    @Id
    private Integer meta_id;

    @Id
    private Integer material_id;

    @Id
    private String version;

    private Short latest;
    private String hash;
    private String target_url;

}
