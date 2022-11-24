package fi.csc.processor.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Metadata {
    private LocalDateTime created;
    private LocalDateTime updated;
    private String[] organizations;
    private String[] educationalLevels;
    private String[] educationalSubjects;
}
