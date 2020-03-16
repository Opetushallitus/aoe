package fi.csc.data.repository;

import fi.csc.data.entity.EducationalMaterial;
import fi.csc.data.entity.Identifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;

@Repository
public interface EducationalMaterialRepository extends CrudRepository<EducationalMaterial, Long> {

    @Query("SELECT em.id AS educationalMaterialId, m.id AS materialId, r.originalFileName AS originalFileName, " +
            "r.fileKey AS fileKey FROM EducationalMaterial em JOIN em.materials m JOIN m.record r " +
            "WHERE em.createdAt > :from AND em.createdAt <= :until")
    Page<Identifier> loadIdentifiers(
            @Param("from") OffsetDateTime from,
            @Param("until") OffsetDateTime until,
            Pageable pageRequest);

}
