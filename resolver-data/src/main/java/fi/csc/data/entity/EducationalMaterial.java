package fi.csc.data.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity(name = "EducationalMaterial")
@Table(name = "EducationalMaterial")
public class EducationalMaterial {

    @Id
    @Column(name = "Id")
    private Long id;

    @JsonIgnore
    @OneToMany(fetch = FetchType.EAGER, mappedBy = "educationalMaterial")
    private List<Material> materials;

    @Column(name = "CreatedAt", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @Column(name = "PublishedAt", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime publishedAt;

    @Column(name = "UpdatedAt", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    @Column(name = "ArchivedAt", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime archivedAt;

    @Column(name = "TimeRequired")
    private String timeRequired;

    @Column(name = "AgeRangeMin")
    private Integer ageRangeMin;

    @Column(name = "AgeRangeMax")
    private Integer ageRangeMax;

    @Column(name = "LicenseCode")
    private String licenseCode;

    @Column(name = "Obsoleted")
    private Integer obsoleted;

    @Column(name = "OriginalPublishedAt")
    private OffsetDateTime originalPublishedAt;

    @Column(name = "UsersUserName")
    private String usersUserName;

    @Column(name = "Expires")
    private OffsetDateTime expires;

    public EducationalMaterial(Long id, OffsetDateTime createdAt, String usersUserName, List<Material> materials) {
        this.id = id;
        this.createdAt = createdAt;
        this.usersUserName = usersUserName;
        this.materials = materials;
    }
}
