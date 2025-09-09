package fi.csc.processor.utils;

import fi.csc.processor.enumeration.Interval;
import fi.csc.processor.model.Metadata;
import fi.csc.processor.model.request.BaseRequest;
import fi.csc.processor.model.request.IntervalTotalRequest;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.aggregation.GroupOperation;
import org.springframework.data.mongodb.core.aggregation.ProjectionOperation;
import org.springframework.data.mongodb.core.aggregation.SortOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.test.context.TestPropertySource;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = { AggregationBuilder.class })
@TestPropertySource(locations = "classpath:test.properties")
class AggregationBuilderTest {

    @Test
    void buildProjectionByInterval_dayProjectionOperationReturned() {
        ProjectionOperation projectionOperation = AggregationBuilder.buildProjectionByInterval(Interval.DAY);
        assertNotNull(projectionOperation);
    }

    @Test
    void buildProjectionByInterval_weekProjectionOperationReturned() {
        ProjectionOperation projectionOperation = AggregationBuilder.buildProjectionByInterval(Interval.WEEK);
        assertNotNull(projectionOperation);
    }

    @Test
    void buildProjectionByInterval_monthProjectionOperationReturned() {
        ProjectionOperation projectionOperation = AggregationBuilder.buildProjectionByInterval(Interval.MONTH);
        assertNotNull(projectionOperation);
    }

    @Test
    void buildGroupByInterval_dayGroupOperationReturned() {
        GroupOperation groupOperation = AggregationBuilder.buildGroupByInterval(Interval.DAY);
        assertNotNull(groupOperation);
    }

    @Test
    void buildGroupByInterval_weekGroupOperationReturned() {
        GroupOperation groupOperation = AggregationBuilder.buildGroupByInterval(Interval.WEEK);
        assertNotNull(groupOperation);
    }

    @Test
    void buildGroupByInterval_monthGroupOperationReturned() {
        GroupOperation groupOperation = AggregationBuilder.buildGroupByInterval(Interval.MONTH);
        assertNotNull(groupOperation);
    }

    @Test
    void buildSortByInterval_daySortOperationReturned() {
        SortOperation sortOperation = AggregationBuilder.buildSortByInterval(Interval.DAY);
        assertNotNull(sortOperation);
    }

    @Test
    void buildSortByInterval_weekSortOperationReturned() {
        SortOperation sortOperation = AggregationBuilder.buildSortByInterval(Interval.WEEK);
        assertNotNull(sortOperation);
    }

    @Test
    void buildSortByInterval_monthSortOperationReturned() {
        SortOperation sortOperation = AggregationBuilder.buildSortByInterval(Interval.MONTH);
        assertNotNull(sortOperation);
    }

    @Test
    void buildCriteriaByRequestConditions_criteriaWithOrganizationsOnly() throws NoSuchFieldException, IllegalAccessException {
        List<Criteria> cumulativeCriteria = new ArrayList<>();
        Metadata metadata = new Metadata() {{
            setOrganizations(new String[]{"org1", "org2", "org3"});
        }};
        IntervalTotalRequest intervalTotalRequest = new IntervalTotalRequest();
        intervalTotalRequest.setMetadata(metadata);
        AggregationBuilder.buildCriteriaByRequestConditions(cumulativeCriteria, intervalTotalRequest);
        assertEquals(1, cumulativeCriteria.size());
    }

    @Test
    void buildCriteriaByRequestConditions_criteriaWithEducationalLevelsOnly() throws NoSuchFieldException, IllegalAccessException {
        List<Criteria> cumulativeCriteria = new ArrayList<>();
        Metadata metadata = new Metadata() {{
            setEducationalLevels(new String[]{"lev1", "lev2", "lev3"});
        }};
        IntervalTotalRequest intervalTotalRequest = new IntervalTotalRequest();
        intervalTotalRequest.setMetadata(metadata);
        AggregationBuilder.buildCriteriaByRequestConditions(cumulativeCriteria, intervalTotalRequest);
        assertEquals(1, cumulativeCriteria.size());
    }

    @Test
    void buildCriteriaByRequestConditions_criteriaWithEducationalSubjectsOnly() throws NoSuchFieldException, IllegalAccessException {
        List<Criteria> cumulativeCriteria = new ArrayList<>();
        Metadata metadata = new Metadata() {{
            setEducationalSubjects(new String[]{"sub1", "sub2", "sub3"});
        }};
        IntervalTotalRequest intervalTotalRequest = new IntervalTotalRequest();
        intervalTotalRequest.setMetadata(metadata);
        AggregationBuilder.buildCriteriaByRequestConditions(cumulativeCriteria, intervalTotalRequest);
        assertEquals(1, cumulativeCriteria.size());
    }

    @Test
    void buildCriteriaByRequestConditions_criteriaWithAllClassifications() throws NoSuchFieldException, IllegalAccessException {
        List<Criteria> cumulativeCriteria = new ArrayList<>();
        Metadata metadata = new Metadata() {{
            setOrganizations(new String[]{"org1", "org2", "org3"});
            setEducationalLevels(new String[]{"lev1", "lev2", "lev3"});
            setEducationalSubjects(new String[]{"sub1", "sub2", "sub3"});
        }};
        IntervalTotalRequest intervalTotalRequest = new IntervalTotalRequest();
        intervalTotalRequest.setMetadata(metadata);
        AggregationBuilder.buildCriteriaByRequestConditions(cumulativeCriteria, intervalTotalRequest);
        assertEquals(3, cumulativeCriteria.size());
    }

    @Test
    void buildCriteriaByRequestConditions_criteriaWithEmptyClassifications() throws NoSuchFieldException, IllegalAccessException {
        List<Criteria> cumulativeCriteria = new ArrayList<>();
        Metadata metadata = new Metadata();
        IntervalTotalRequest intervalTotalRequest = new IntervalTotalRequest();
        intervalTotalRequest.setMetadata(metadata);
        AggregationBuilder.buildCriteriaByRequestConditions(cumulativeCriteria, intervalTotalRequest);
        assertEquals(0, cumulativeCriteria.size());
    }

    @Test
    void buildCriteriaByRequestConditions_withoutMetadataNoSuchFieldException() {
        List<Criteria> cumulativeCriteria = new ArrayList<>();
        BaseRequest baseRequest = new BaseRequest();
        assertThrows(NoSuchFieldException.class, () ->
            AggregationBuilder.buildCriteriaByRequestConditions(cumulativeCriteria, baseRequest));
    }
}
