package fi.csc.processor.repository;

import fi.csc.processor.model.document.SearchRequestDocument;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SearchRequestRepository extends MongoRepository<SearchRequestDocument, ObjectId> {

    // No custom methods

}
