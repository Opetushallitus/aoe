package fi.csc.processor.model.statistics;

import fi.csc.processor.enumeration.Interval;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class StatisticsMeta<T> {
    private Interval interval;
    private LocalDate since;
    private LocalDate until;
    private List<T> values;
}
