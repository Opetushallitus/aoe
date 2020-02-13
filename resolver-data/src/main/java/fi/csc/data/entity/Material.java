package fi.csc.data.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity(name = "Material")
@Table(name = "material")
public class Material {

    @Id
    @Column(name = "id")
    private Long id;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "materialEducationalMaterialFK", referencedColumnName = "id")
    private EducationalMaterial educationalMaterial;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "materialRecordFK", referencedColumnName = "id")
    private Record record = new Record();

    @Column(name = "educational_material_id")
    private Long educationalMaterialId;

    private String link;
    private Integer obsoleted;
    private Integer priority;
    private String materialLanguageKey;

    public Material(Long id, Long educationalMaterialId, String link, Record record) {
        this.id = id;
        this.educationalMaterialId = educationalMaterialId;
        this.link = link;
        this.record = record;
    }

}
