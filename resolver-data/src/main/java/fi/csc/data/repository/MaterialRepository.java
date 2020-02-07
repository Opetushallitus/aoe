package fi.csc.data.repository;

import fi.csc.data.entity.Material;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialRepository extends CrudRepository<Material, Long> {

    // Methods

}
