package fi.csc.data.repository;

import fi.csc.data.entity.EducationalMaterial;
import fi.csc.data.entity.Identifier;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.stream.Stream;

@Repository
public interface EducationalMaterialRepository extends CrudRepository<EducationalMaterial, Long> {

    @Query(value = "SELECT educational_material.id AS educationalMaterialId, material.id AS materialId, " +
        "record.original_file_name AS originalFileName FROM educational_material, material, record", nativeQuery = true)
    Stream<Identifier> loadIdentifiers();

}
