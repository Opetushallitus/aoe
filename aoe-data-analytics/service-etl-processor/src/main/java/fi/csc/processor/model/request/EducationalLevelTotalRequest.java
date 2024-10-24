package fi.csc.processor.model.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import fi.csc.processor.converter.deserializer.OffsetDateTimeDeserializer;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
public class EducationalLevelTotalRequest extends BaseTotalRequest {
    private String[] educationalLevels;

    @JsonDeserialize(using = OffsetDateTimeDeserializer.class)
    private OffsetDateTime expiredBefore;
}
