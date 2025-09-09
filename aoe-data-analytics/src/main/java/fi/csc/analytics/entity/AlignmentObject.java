package fi.csc.analytics.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity(name = "AlignmentObject")
@Table(name = "AlignmentObject")
public class AlignmentObject {

    @Id
    @Column(name = "Id")
    private Long id;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "EducationalMaterialId", referencedColumnName = "Id", insertable = false, updatable = false)
    private EducationalMaterial educationalMaterial;

    @Column(name = "AlignmentType")
    private String alignmentType;

    @Column(name = "TargetName")
    private String targetName;

    @Column(name = "TargetUrl")
    private String targetUrl;

    @Column(name = "Source")
    private String source;

    @Column(name = "educationalFramework")
    private String educationalFramework;

    @Column(name = "objectKey")
    private String objectKey;

}

