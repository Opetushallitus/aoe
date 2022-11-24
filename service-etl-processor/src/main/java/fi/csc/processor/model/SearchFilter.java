package fi.csc.processor.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class SearchFilter {
    private String[] educationalLevels;
    private String[] educationalSubjects;
    private String[] learningResourceTypes;
}
