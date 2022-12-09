package fi.csc.processor.model.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EducationalSubjectTotalRequest extends BaseTotalRequest {
    private String[] educationalLevels;
}
