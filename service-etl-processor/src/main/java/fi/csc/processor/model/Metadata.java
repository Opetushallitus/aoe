package fi.csc.processor.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class Metadata {
    private LocalDateTime created;
    private LocalDateTime updated;
    private String[] organizations;
    private String[] educationalLevels;
    private String[] educationalSubjects;
}
