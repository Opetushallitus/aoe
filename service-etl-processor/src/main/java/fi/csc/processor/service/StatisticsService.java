package fi.csc.processor.service;

import fi.csc.processor.enumeration.Interval;
import fi.csc.processor.model.request.IntervalTotalRequest;
import fi.csc.processor.model.statistics.IntervalTotal;
import fi.csc.processor.model.statistics.StatisticsMeta;
import fi.csc.processor.repository.MaterialActivityRepository;
import fi.csc.processor.repository.SearchRequestRepository;
import fi.csc.processor.utils.AggregationBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StatisticsService {
    private static final Logger LOG = LoggerFactory.getLogger(StatisticsService.class.getSimpleName());
    private MaterialActivityRepository materialActivityRepository;
    private SearchRequestRepository searchRequestRepository;
    private final MongoTemplate mongoTemplate;

    @Autowired
    StatisticsService(
        MaterialActivityRepository materialActivityRepository,
        SearchRequestRepository searchRequestRepository,
        MongoTemplate mongoTemplate) {
        this.materialActivityRepository = materialActivityRepository;
        this.searchRequestRepository = searchRequestRepository;
        this.mongoTemplate = mongoTemplate;
    }

    /**
     * Statistics Classification Query Criteria Logic:
     *
     * time1 (inclusive greater than)
     * AND
     * time2 (exclusive less than)
     * AND
     * keyA1 OR keyA2 OR keyA3 OR ... (organizations)
     * AND
     * keyB1 OR keyB2 OR keyB3 OR ... (educationalLevels)
     * AND
     * keyC1 OR keyC2 OR keyC3 OR ... (educationalSubjects)
     *
     * @param interval - enum Interval: DAY | WEEK | MONTH.
     * @param intervalTotalRequest - metadata for request criteria.
     * @param targetCollection - class for target database document collection.
     * @return statistics query results wrapped by statistics metadata.
     */
    public StatisticsMeta<IntervalTotal> getTotalByInterval(
        Interval interval,
        IntervalTotalRequest intervalTotalRequest,
        Class<?> targetCollection) {
        List<Criteria> cumulativeCriteria = new ArrayList<>();
        cumulativeCriteria.add(Criteria.where("timestamp").gte(intervalTotalRequest.getSince()));
        cumulativeCriteria.add(Criteria.where("timestamp").lt(intervalTotalRequest.getUntil()));
        try {
            AggregationBuilder.buildCriteriaByRequestConditions(cumulativeCriteria, intervalTotalRequest);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException(e);
        }
        Criteria criteria = new Criteria().andOperator(cumulativeCriteria.toArray(Criteria[]::new));

        Aggregation aggregation = Aggregation.newAggregation(
            Aggregation.match(criteria),
            AggregationBuilder.buildProjectionByInterval(interval),
            AggregationBuilder.buildGroupByInterval(interval),
            AggregationBuilder.buildSortByInterval(interval)
        );
        AggregationResults<IntervalTotal> result = mongoTemplate.aggregate(
            aggregation,
            targetCollection,
            IntervalTotal.class);
        return new StatisticsMeta<>() {{
             setInterval(interval);
             setSince(intervalTotalRequest.getSince());
             setUntil(intervalTotalRequest.getUntil());
             setValues(result.getMappedResults());
        }};
    }
}
