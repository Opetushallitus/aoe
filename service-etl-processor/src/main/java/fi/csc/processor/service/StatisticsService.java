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
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

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

    public StatisticsMeta<IntervalTotal> getTotalByInterval(
        Interval interval,
        IntervalTotalRequest intervalTotalRequest,
        Class<?> targetCollection) {
        Aggregation aggregation = Aggregation.newAggregation(
            Aggregation.match(Criteria.where("timestamp")
                .gte(intervalTotalRequest.getSince())
                .lt(intervalTotalRequest.getUntil())
            ),
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
