package fi.csc.processor.model.request;

import fi.csc.processor.model.Metadata;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

@Getter
@Setter
@ToString
public class IntervalTotalRequest {
    private LocalDate since;
    private LocalDate until;
    private Metadata metadata;
}
