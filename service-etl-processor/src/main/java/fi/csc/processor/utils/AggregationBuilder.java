package fi.csc.processor.utils;

import fi.csc.processor.enumeration.Interval;
import fi.csc.processor.model.Metadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class AggregationBuilder {
    private static final Logger LOG = LoggerFactory.getLogger(AggregationBuilder.class.getSimpleName());

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

    public static void buildCriteriaByRequestConditions(List<Criteria> cumulative, Object object) throws NoSuchFieldException, IllegalAccessException {
        List<Criteria> orCriteria = new ArrayList<>();
        Class<?> cls = object.getClass();

        if (isFieldPresent(object, "metadata")) {
            Field field = cls.getDeclaredField("metadata");
            field.setAccessible(true);
            Metadata metadata = (Metadata) field.get(object);

            // Conditional (OR) criteria for organizations.
            if (metadata != null && metadata.getOrganizations() != null && metadata.getOrganizations().length > 0) {
                Arrays.stream(metadata.getOrganizations()).forEach(s -> orCriteria.add(
                    Criteria.where("metadata.organizations").is(s)));
            }

            // Conditional (OR) criteria for educational levels.
            if (metadata != null && metadata.getEducationalLevels() != null && metadata.getEducationalLevels().length > 0) {
                Arrays.stream(metadata.getEducationalLevels()).forEach(s -> orCriteria.add(
                    Criteria.where("metadata.educationalLevels").is(s)));
            }

            // Conditional (OR) criteria for educational subjects.
            if (metadata != null && metadata.getEducationalSubjects() != null && metadata.getEducationalSubjects().length > 0) {
                Arrays.stream(metadata.getEducationalSubjects()).forEach(s -> orCriteria.add(
                    Criteria.where("metadata.educationalSubjects").is(s)));
            }

            // Add criteria to the cumulative collection to be attached to the query aggregations.
            if (!orCriteria.isEmpty()) {
                cumulative.add(new Criteria().orOperator(orCriteria.toArray(Criteria[]::new)));
            }
        }
    }

    private static boolean isFieldPresent(Object object, String field) throws NoSuchFieldException {
        return object.getClass().getDeclaredField(field) != null;
    }
}
