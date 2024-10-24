package fi.csc.processor.service;

import fi.csc.analytics.repository.primary.EducationalMaterialRepositoryPrimary;
import fi.csc.analytics.repository.secondary.EducationalMaterialRepositorySecondary;
import fi.csc.processor.enumeration.TargetEnv;
import fi.csc.processor.model.request.EducationalLevelTotalRequest;
import fi.csc.processor.model.request.EducationalSubjectTotalRequest;
import fi.csc.processor.model.request.OrganizationTotalRequest;
import fi.csc.processor.model.statistics.RecordKeyValue;
import fi.csc.processor.model.statistics.StatisticsMeta;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class StatisticsService {
    private final EducationalMaterialRepositoryPrimary educationalMaterialRepositoryPrimary;
    private final EducationalMaterialRepositorySecondary educationalMaterialRepositorySecondary;

    @Autowired
    public StatisticsService(
        EducationalMaterialRepositoryPrimary educationalMaterialRepositoryPrimary,
        EducationalMaterialRepositorySecondary educationalMaterialRepositorySecondary) {
        this.educationalMaterialRepositoryPrimary = educationalMaterialRepositoryPrimary;
        this.educationalMaterialRepositorySecondary = educationalMaterialRepositorySecondary;
    }

    public StatisticsMeta<RecordKeyValue> getEducationalLevelDistribution(
        EducationalLevelTotalRequest educationalLevelTotalRequest,
        TargetEnv targetEnv) {
        List<RecordKeyValue> values = null;

        if (educationalLevelTotalRequest.getSince() != null &&
            educationalLevelTotalRequest.getUntil() != null &&
            educationalLevelTotalRequest.getEducationalLevels() != null &&
            educationalLevelTotalRequest.getEducationalLevels().length > 0) {
            values = Arrays.stream(educationalLevelTotalRequest.getEducationalLevels())
                .map(e -> {
                    Long total = switch (targetEnv) {
                        case PROD -> this.educationalMaterialRepositoryPrimary.countByEducationalLevelBetweenPublishDates(
                            e, educationalLevelTotalRequest.getSince(), educationalLevelTotalRequest.getUntil());
                        case TEST -> this.educationalMaterialRepositorySecondary.countByEducationalLevelBetweenPublishDates(
                            e, educationalLevelTotalRequest.getSince(), educationalLevelTotalRequest.getUntil());
                    };
                    return new RecordKeyValue(e, total);
                })
                .toList();
        } else if (educationalLevelTotalRequest.getEducationalLevels() != null &&
            educationalLevelTotalRequest.getEducationalLevels().length > 0) {
            values = Arrays.stream(educationalLevelTotalRequest.getEducationalLevels())
                .map(e -> {
                    Long total = switch (targetEnv) {
                        case PROD -> this.educationalMaterialRepositoryPrimary.countByEducationalLevelKey(e);
                        case TEST -> this.educationalMaterialRepositorySecondary.countByEducationalLevelKey(e);
                    };
                    return new RecordKeyValue(e, total);
                })
                .toList();
        }
        List<RecordKeyValue> finalValues = values;
        return new StatisticsMeta<>() {{
            setSince(educationalLevelTotalRequest.getSince() != null ? educationalLevelTotalRequest.getSince().toLocalDate() : null);
            setUntil(educationalLevelTotalRequest.getUntil() != null ? educationalLevelTotalRequest.getUntil().toLocalDate() : null);
            setValues(finalValues != null ? finalValues : Collections.emptyList());
        }};
    }

    public StatisticsMeta<RecordKeyValue> getEducationalLevelExpired(
        EducationalLevelTotalRequest educationalLevelTotalRequest,
        TargetEnv targetEnv) {
        List<RecordKeyValue> values = Arrays.stream(educationalLevelTotalRequest.getEducationalLevels())
            .map(e -> {
                Long total = switch (targetEnv) {
                    case PROD -> this.educationalMaterialRepositoryPrimary.countByEducationalLevelExpiresBefore(
                        e, educationalLevelTotalRequest.getExpiredBefore());
                    case TEST -> this.educationalMaterialRepositorySecondary.countByEducationalLevelExpiresBefore(
                        e, educationalLevelTotalRequest.getExpiredBefore());
                };
                return new RecordKeyValue(e, total);
            })
            .toList();
        return new StatisticsMeta<>() {{
            setUntil(educationalLevelTotalRequest.getExpiredBefore() != null ? educationalLevelTotalRequest.getExpiredBefore().toLocalDate() : null);
            setValues(values);
        }};
    }

    public StatisticsMeta<RecordKeyValue> getEducationalSubjectDistribution(
        EducationalSubjectTotalRequest educationalSubjectTotalRequest,
        TargetEnv targetEnv) {
        List<RecordKeyValue> values;

        if (educationalSubjectTotalRequest.getSince() != null && educationalSubjectTotalRequest.getUntil() != null) {
            values = Arrays.stream(educationalSubjectTotalRequest.getEducationalSubjects())
                .map(e -> {
                    Long total = switch (targetEnv) {
                        case PROD -> this.educationalMaterialRepositoryPrimary.countByEducationalSubjectBetweenPublishDates(
                            e, educationalSubjectTotalRequest.getSince(), educationalSubjectTotalRequest.getUntil());
                        case TEST -> this.educationalMaterialRepositorySecondary.countByEducationalSubjectBetweenPublishDates(
                            e, educationalSubjectTotalRequest.getSince(), educationalSubjectTotalRequest.getUntil());
                    };
                    return new RecordKeyValue(e, total);
                })
                .toList();
        } else {
            values = Arrays.stream(educationalSubjectTotalRequest.getEducationalSubjects())
                .map(e -> {
                    Long total = switch (targetEnv) {
                        case PROD -> this.educationalMaterialRepositoryPrimary.countByEducationalSubjectKey(e);
                        case TEST -> this.educationalMaterialRepositorySecondary.countByEducationalSubjectKey(e);
                    };
                    return new RecordKeyValue(e, total);
                })
                .toList();
        }
        return new StatisticsMeta<>() {{
            setSince(educationalSubjectTotalRequest.getSince() != null ? educationalSubjectTotalRequest.getSince().toLocalDate() : null);
            setUntil(educationalSubjectTotalRequest.getUntil() != null ? educationalSubjectTotalRequest.getUntil().toLocalDate() : null);
            setValues(values);
        }};
    }

    public StatisticsMeta<RecordKeyValue> getOrganizationDistribution(
        OrganizationTotalRequest organizationTotalRequest,
        TargetEnv targetEnv) {
        List<RecordKeyValue> values;

        if (organizationTotalRequest.getSince() != null && organizationTotalRequest.getUntil() != null) {
            values = Arrays.stream(organizationTotalRequest.getOrganizations())
                .map(e -> {
                    Long total = switch (targetEnv) {
                        case PROD -> this.educationalMaterialRepositoryPrimary.countByOrganizationBetweenPublishDates(
                            e, organizationTotalRequest.getSince(), organizationTotalRequest.getUntil());
                        case TEST -> this.educationalMaterialRepositorySecondary.countByOrganizationBetweenPublishDates(
                            e, organizationTotalRequest.getSince(), organizationTotalRequest.getUntil());
                    };
                    return new RecordKeyValue(e, total);
                })
                .toList();
        } else {
            values = Arrays.stream(organizationTotalRequest.getOrganizations())
                .map(e -> {
                    Long total = switch (targetEnv) {
                        case PROD -> this.educationalMaterialRepositoryPrimary.countByOrganizationKey(e);
                        case TEST -> this.educationalMaterialRepositorySecondary.countByOrganizationKey(e);
                    };
                    return new RecordKeyValue(e, total);
                })
                .toList();
        }
        return new StatisticsMeta<>() {{
            setSince(organizationTotalRequest.getSince() != null ? organizationTotalRequest.getSince().toLocalDate() : null);
            setUntil(organizationTotalRequest.getUntil() != null ? organizationTotalRequest.getUntil().toLocalDate() : null);
            setValues(values);
        }};
    }
}
