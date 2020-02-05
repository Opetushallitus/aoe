package fi.csc.resolver.repository;

import fi.csc.resolver.model.Link;
import fi.csc.resolver.model.LinkId;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LinkRepository extends CrudRepository<Link, LinkId> {

    List<Link> findByHash(String hash);

}
