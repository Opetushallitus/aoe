package fi.csc.data.repository;

import fi.csc.data.entity.EducationalMaterial;
import fi.csc.data.entity.Identifier;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.stream.Stream;

@Repository
public interface EducationalMaterialRepository extends CrudRepository<EducationalMaterial, Long> {

    @Query("SELECT em.id AS educationalMaterialId, m.id AS materialId, r.originalFileName AS originalFileName " +
        "FROM EducationalMaterial AS em JOIN em.materials m JOIN m.record r")
    Stream<Identifier> loadIdentifiers();

}
