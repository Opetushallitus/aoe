package fi.csc.processor.model;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class SearchFilter {
    private String[] educationalLevels;
    private String[] educationalSubjects;
    private String[] learningResourceTypes;
}
