package fi.csc.processor.utils;

import fi.csc.processor.enumeration.Interval;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.aggregation.*;

public class AggregationBuilder {

    public static ProjectionOperation buildProjectionByInterval(Interval interval) {
        return switch (interval) {
            case DAY -> Aggregation.project()
                .and("timestamp").extractYear().as("year")
                .and("timestamp").extractMonth().as("month")
                .and("timestamp").extractDayOfMonth().as("day");
            case WEEK -> Aggregation.project()
                .and("timestamp").extractYear().as("year")
                .and(DateOperators.dateOf("timestamp").isoWeek()).as("week");
            case MONTH -> Aggregation.project()
                .and("timestamp").extractYear().as("year")
                .and("timestamp").extractMonth().as("month");
        };
    }

    public static GroupOperation buildGroupByInterval(Interval interval) {
        return switch (interval) {
            case DAY -> Aggregation.group("year", "month", "day")
                .last("year").as("year")
                .last("month").as("month")
                .last("day").as("day")
                .count().as("dayTotal");
            case WEEK -> Aggregation.group("year", "week")
                .last("year").as("year")
                .last("week").as("week")
                .count().as("weekTotal");
            case MONTH -> Aggregation.group("year", "month")
                .last("year").as("year")
                .last("month").as("month")
                .count().as("monthTotal");
        };
    }

    public static SortOperation buildSortByInterval(Interval interval) {
        return switch (interval) {
            case DAY -> Aggregation.sort(Sort.Direction.ASC, "year", "month", "day");
            case WEEK -> Aggregation.sort(Sort.Direction.ASC, "year", "week");
            case MONTH -> Aggregation.sort(Sort.Direction.ASC, "year", "month");
        };
    }
}
