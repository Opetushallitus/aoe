package fi.csc.processor.model.statistics;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class IntervalTotal {
    private Integer year;
    private Integer month;
    private Integer week;
    private Integer day;
    private Integer dayTotal;
    private Integer weekTotal;
    private Integer monthTotal;
}
