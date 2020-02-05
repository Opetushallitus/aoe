package fi.csc.resolver.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@IdClass(LinkId.class)
@Table(name = "link")
public class Link implements Serializable {

    @Id
    @Column(name = "meta_id")
    private Integer metaId;

    @Id
    @Column(name = "material_id")
    private Integer materialId;

    @Id
    @Column(name = "version")
    private String version;

    @Column(name = "latest")
    private Short latest;

    @Column(name = "hash")
    private String hash;

    @Column(name = "target_url")
    private String targetUrl;

}
