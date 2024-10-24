package fi.csc.processor.service;

import fi.csc.processor.enumeration.Interval;
import fi.csc.processor.enumeration.TargetEnv;
import fi.csc.processor.model.request.IntervalTotalRequest;
import fi.csc.processor.model.statistics.IntervalTotal;
import fi.csc.processor.model.statistics.StatisticsMeta;
import fi.csc.processor.utils.AggregationBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TimeSeriesService {
    private static final Logger LOG = LoggerFactory.getLogger(TimeSeriesService.class.getSimpleName());
    private final MongoTemplate mongoPrimaryTemplate;
    private final MongoTemplate mongoSecondaryTemplate;

    @Autowired
    TimeSeriesService(
        @Qualifier("primaryMongoTemplate") MongoTemplate mongoPrimaryTemplate,
        @Qualifier("secondaryMongoTemplate") MongoTemplate mongoSecondaryTemplate) {
        this.mongoPrimaryTemplate = mongoPrimaryTemplate;
        this.mongoSecondaryTemplate = mongoSecondaryTemplate;
    }

    /**
     * Statistics Classification Query Criteria Logic (production):
     * <p>
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
     * @param interval             - enum Interval: DAY | WEEK | MONTH.
     * @param intervalTotalRequest - metadata for request criteria.
     * @param targetCollection     - class for target database document collection.
     * @return statistics query results wrapped by statistics metadata.
     */
    public StatisticsMeta<IntervalTotal> getTotalByInterval(
        Interval interval,
        IntervalTotalRequest intervalTotalRequest,
        Class<?> targetCollection,
        TargetEnv targetEnv) {
        MongoTemplate mongoTemplate = switch (targetEnv) {
            case PROD -> this.mongoPrimaryTemplate;
            case TEST -> this.mongoSecondaryTemplate;
        };
        AggregationResults<IntervalTotal> result = mongoTemplate.aggregate(
            buildAggregationConfiguration(interval, intervalTotalRequest),
            targetCollection,
            IntervalTotal.class);
        return new StatisticsMeta<>() {{
            setInterval(interval);
            setSince(intervalTotalRequest.getSince());
            setUntil(intervalTotalRequest.getUntil());
            setValues(result.getMappedResults());
        }};
    }

    private Aggregation buildAggregationConfiguration(Interval interval, IntervalTotalRequest intervalTotalRequest) {
        List<Criteria> cumulativeCriteria = new ArrayList<>();
        cumulativeCriteria.add(Criteria.where("timestamp").gte(intervalTotalRequest.getSince()));
        cumulativeCriteria.add(Criteria.where("timestamp").lt(intervalTotalRequest.getUntil()));
        if (intervalTotalRequest.getInteraction() != null) {
            cumulativeCriteria.add(Criteria.where("interaction").is(intervalTotalRequest.getInteraction()));
        }
        try {
            AggregationBuilder.buildCriteriaByRequestConditions(cumulativeCriteria, intervalTotalRequest);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException(e);
        }
        Criteria criteria = new Criteria().andOperator(cumulativeCriteria.toArray(Criteria[]::new));
        return Aggregation.newAggregation(
            Aggregation.match(criteria),
            AggregationBuilder.buildProjectionByInterval(interval),
            AggregationBuilder.buildGroupByInterval(interval),
            AggregationBuilder.buildSortByInterval(interval)
        );
    }
}
