package fi.csc.processor.service;

import fi.csc.analytics.repository.primary.EducationalMaterialRepositoryPrimary;
import fi.csc.analytics.repository.secondary.EducationalMaterialRepositorySecondary;
import fi.csc.processor.enumeration.TargetEnv;
import fi.csc.processor.model.request.EducationalLevelTotalRequest;
import fi.csc.processor.model.statistics.RecordKeyValue;
import fi.csc.processor.model.statistics.StatisticsMeta;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
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
        List<RecordKeyValue> values;

        if (educationalLevelTotalRequest.getSince() != null && educationalLevelTotalRequest.getUntil() != null) {
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
        } else {
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
        return new StatisticsMeta<>() {{
            setSince(educationalLevelTotalRequest.getSince() != null ? educationalLevelTotalRequest.getSince().toLocalDate() : null);
            setUntil(educationalLevelTotalRequest.getUntil() != null ? educationalLevelTotalRequest.getUntil().toLocalDate() : null);
            setValues(values);
        }};
    }
}
