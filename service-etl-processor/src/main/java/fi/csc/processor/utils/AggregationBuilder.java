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

    public static void buildCriteriaByRequestConditions(
        List<Criteria> cumulativeCriteria,
        Object object) throws NoSuchFieldException, IllegalAccessException {
        Metadata finalMetadata = null;
        String metadataPrefix = "";

        // Check if metadata field (metadata or filters) is present in a generic object and get the content if exists.
        if (isFieldPresent(object, "metadata")) {
            Field field = object.getClass().getDeclaredField("metadata");
            field.setAccessible(true);
            finalMetadata = (Metadata) field.get(object);
            metadataPrefix = finalMetadata != null ? "metadata.": "";
        }

        if (isFieldPresent(object, "filters") && finalMetadata == null) {
            Field field = object.getClass().getDeclaredField("filters");
            field.setAccessible(true);
            finalMetadata = (Metadata) field.get(object);
            metadataPrefix = finalMetadata != null ? "filters.": "";
        }

        // If the metadata content in not empty proceed to criteria building using the metadata provided.
        if (finalMetadata != null) {
            List<Criteria> andCriteriaCumulative = new ArrayList<>();

            // Conditional (OR) criteria inside the classification of organizations - one match (or more) required.
            if (finalMetadata.getOrganizations() != null && finalMetadata.getOrganizations().length > 0) {
                List<Criteria> orCriteriaOrganizations = new ArrayList<>();
                String finalMetadataPrefix = metadataPrefix;
                Arrays.stream(finalMetadata.getOrganizations()).forEach(s -> orCriteriaOrganizations.add(
                    Criteria.where(finalMetadataPrefix + "organizations").is(s)));
                andCriteriaCumulative.add(new Criteria().orOperator(orCriteriaOrganizations.toArray(Criteria[]::new)));
            }

            // Conditional (OR) criteria inside the classification of educational levels - one match (or more) required.
            if (finalMetadata.getEducationalLevels() != null && finalMetadata.getEducationalLevels().length > 0) {
                List<Criteria> orCriteriaEducationalLevels = new ArrayList<>();
                String finalMetadataPrefix = metadataPrefix;
                Arrays.stream(finalMetadata.getEducationalLevels()).forEach(s -> orCriteriaEducationalLevels.add(
                    Criteria.where(finalMetadataPrefix + "educationalLevels").is(s)));
                andCriteriaCumulative.add(new Criteria().orOperator(orCriteriaEducationalLevels.toArray(Criteria[]::new)));
            }

            // Conditional (OR) criteria inside the classification of educational subjects - one match (or more) required.
            if (finalMetadata.getEducationalSubjects() != null && finalMetadata.getEducationalSubjects().length > 0) {
                List<Criteria> orCriteriaEducationalSubjects = new ArrayList<>();
                String finalMetadataPrefix = metadataPrefix;
                Arrays.stream(finalMetadata.getEducationalSubjects()).forEach(s -> orCriteriaEducationalSubjects.add(
                    Criteria.where(finalMetadataPrefix + "educationalSubjects").is(s)));
                andCriteriaCumulative.add(new Criteria().orOperator(orCriteriaEducationalSubjects.toArray(Criteria[]::new)));
            }

            // Unconditional (AND) criteria between the classifications - one match (or more) required in each given classification.
            if (!andCriteriaCumulative.isEmpty()) {
                cumulativeCriteria.addAll(andCriteriaCumulative);
            }
        }
    }

    private static boolean isFieldPresent(Object object, String field) throws NoSuchFieldException {
        return object.getClass().getDeclaredField(field) != null;
    }
}
