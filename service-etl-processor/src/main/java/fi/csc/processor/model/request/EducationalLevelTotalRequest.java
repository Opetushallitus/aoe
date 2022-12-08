package fi.csc.processor.model.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import fi.csc.processor.converter.deserializer.OffsetDateTimeDeserializer;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
public class EducationalLevelTotalRequest {

    @JsonDeserialize(using = OffsetDateTimeDeserializer.class)
    private OffsetDateTime since;

    @JsonDeserialize(using = OffsetDateTimeDeserializer.class)
    private OffsetDateTime until;

    private String[] educationalLevels;

}
