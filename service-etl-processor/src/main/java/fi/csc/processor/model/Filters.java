package fi.csc.processor.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL) // NON_EMPTY
public class Filters {
    private LocalDateTime created;
    private LocalDateTime updated;
    private String[] organizations;
    private String[] educationalLevels;
    private String[] educationalSubjects;
}
