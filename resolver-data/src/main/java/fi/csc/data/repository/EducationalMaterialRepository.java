package fi.csc.data.repository;

import fi.csc.data.entity.EducationalMaterial;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EducationalMaterialRepository extends CrudRepository<EducationalMaterial, Long> {

    EducationalMaterial findFirstByOrderById();

}
