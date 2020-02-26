package fi.csc.data.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@NoArgsConstructor
@Entity(name = "Material")
@Table(name = "Material")
public class Material {

    @Id
    @Column(name = "Id")
    private Long id;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "EducationalMaterialId", referencedColumnName = "Id", insertable = false, updatable = false)
    private EducationalMaterial educationalMaterial;

    @JsonIgnore
    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "Id", referencedColumnName = "MaterialId", insertable = false, updatable = false)
    private Record record;

    @Column(name = "EducationalMaterialId")
    private Long educationalMaterialId;

    @Column(name = "Link")
    private String link;

    @Column(name = "Obsoleted")
    private Integer obsoleted;

    @Column(name = "Priority")
    private Integer priority;

    @Column(name = "MaterialLanguageKey")
    private String materialLanguageKey;

}
