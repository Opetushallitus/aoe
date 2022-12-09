package fi.csc.analytics.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@NoArgsConstructor
@Entity(name = "Author")
@Table(name = "Author")
public class Author {

    @Id
    @Column(name = "Id")
    private Long id;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "EducationalMaterialId", referencedColumnName = "Id", insertable = false, updatable = false)
    private EducationalMaterial educationalMaterial;

    @Column(name = "EducationalMaterialId")
    private Long educationalMaterialId;

    @Column(name = "AuthorName")
    private String authorName;

    @Column(name = "Organization")
    private Integer organization;

    @Column(name = "OrganizationKey")
    private Integer organizationKey;

}

