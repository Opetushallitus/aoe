package fi.csc.processor.repository.primary;

import fi.csc.processor.model.document.MaterialActivityDocument;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialActivityPrimaryRepository extends MongoRepository<MaterialActivityDocument, ObjectId> {
//    "{'$project':  {'timestamp': 1, day: {$day: '$timestamp'}}}",
//    "{'$group': {'_id': {day: '$day'}, dayTotal: {'$sum':  1}}}"
//    @Aggregation(pipeline = {
//        "{$project: {total:  1}}",
//        "{$match: {timestamp: {$gte: ?0, $lt: ?1}}}",
//        "{$group: {_id: {year: {$year: 'timestamp'}, month: {$month: 'timestamp'}, day: {$day: 'timestamp'}}, total: {$sum: 1}}}"
//    })
//    List<SumInterface> getDailySums(LocalDateTime since, LocalDateTime until);
//    List<MaterialActivityDocument> getDailySums(LocalDateTime since, LocalDateTime until);
//    List<SumInterface> findByTimestampBetweenOrderByTimestampAsc(LocalDateTime since, LocalDateTime until);
}
