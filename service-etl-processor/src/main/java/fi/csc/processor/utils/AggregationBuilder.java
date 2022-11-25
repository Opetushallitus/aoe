package fi.csc.processor.utils;

import fi.csc.processor.enumeration.Interval;
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

    public static void buildCriteriaByRequestConditions(List<Criteria> cumulative, Object conditions) throws NoSuchFieldException, IllegalAccessException {
        List<Criteria> orCriteria = new ArrayList<>();
        Class<?> cls = conditions.getClass();
        if (isFieldPresent(conditions, "organizations")) {
            Field field = cls.getDeclaredField("organization");
            String[] organizations = Arrays.stream((String[]) field.get(conditions)).toArray(String[]::new);
            if (organizations.length > 0) {
                Arrays.stream(organizations).forEach(s -> orCriteria.add(Criteria
                    .where("metadata.organization").is(s)));
            }
        }
        if (isFieldPresent(conditions, "educationalLevels")) {
            Field field = cls.getDeclaredField("educationalLevels");
            String[] educationalLevels = Arrays.stream((String[]) field.get(conditions)).toArray(String[]::new);
            if (educationalLevels.length > 0) {
                Arrays.stream(educationalLevels).forEach(s -> orCriteria.add(Criteria
                    .where("metadata.educationalLevels").is(s)));
            }
        }
        if (isFieldPresent(conditions, "educationalSubjects")) {
            Field field = cls.getDeclaredField("educationalSubjects");
            String[] educationalSubjects = Arrays.stream((String[]) field.get(conditions)).toArray(String[]::new);
            if (educationalSubjects.length > 0) {
                Arrays.stream(educationalSubjects).forEach(s -> orCriteria.add(Criteria
                    .where("metadata.educationalSubjects").is(s)));
            }
        }
        if (!orCriteria.isEmpty()) {
            LOG.debug("Amount orCriteria: " + orCriteria.size());
            cumulative.add(new Criteria().orOperator(orCriteria));
        }
    }

    private static boolean isFieldPresent(Object object, String field) {
        return Arrays.stream(object.getClass().getFields())
            .anyMatch(f -> f.getName().equalsIgnoreCase(field));
    }

//    public static boolean isEmptyCriteria(Criteria criteria){
//        return criteria.equals(new Criteria());
//    }
}
