package fi.csc.data.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity(name = "EducationalMaterial")
@Table(name = "educational_material")
public class EducationalMaterial {

    @Id
    @Column(name = "id")
    private Long id;

    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "educationalMaterialMaterialFK", referencedColumnName = "id")
    private List<Material> materials = new ArrayList<>();

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    private OffsetDateTime publishedAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime archivedAt;
    private String timeRequired;
    private Integer ageRangeMin;
    private Integer ageRangeMax;
    private String licenseCode;
    private Integer obsoleted;
    private OffsetDateTime originalPublishedAt;
    private String usersUserName;
    private OffsetDateTime expires;

    public EducationalMaterial(Long id, OffsetDateTime createdAt, String usersUserName, List<Material> materials) {
        this.id = id;
        this.createdAt = createdAt;
        this.usersUserName = usersUserName;
        this.materials = materials;
    }
}
