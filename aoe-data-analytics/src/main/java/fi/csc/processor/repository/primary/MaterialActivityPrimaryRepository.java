package fi.csc.processor.repository.primary;

import fi.csc.processor.model.document.MaterialActivityDocument;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialActivityPrimaryRepository extends MongoRepository<MaterialActivityDocument, ObjectId> {
}
