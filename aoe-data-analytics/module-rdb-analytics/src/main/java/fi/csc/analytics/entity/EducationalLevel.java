package fi.csc.analytics.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@NoArgsConstructor
@Entity(name = "EducationalLevel")
@Table(name = "EducationalLevel")
public class EducationalLevel {

    @Id
    @Column(name = "Id")
    private Long id;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "EducationalMaterialId", referencedColumnName = "Id", insertable = false, updatable = false)
    private EducationalMaterial educationalMaterial;

    @Column(name = "Value")
    private String value;

    @Column(name = "EducationalLevelKey")
    private String educationalLevelKey;

}

