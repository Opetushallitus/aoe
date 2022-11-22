package fi.csc.processor.model.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class IntervalTotalRequest {
    private LocalDate since;
    private LocalDate until;
}
