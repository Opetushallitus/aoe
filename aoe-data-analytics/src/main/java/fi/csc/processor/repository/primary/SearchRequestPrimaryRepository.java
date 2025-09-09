package fi.csc.processor.repository.primary;

import fi.csc.processor.model.document.SearchRequestDocument;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SearchRequestPrimaryRepository extends MongoRepository<SearchRequestDocument, ObjectId> {
}
