package fi.csc.resolver.model;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import fi.csc.resolver.adapter.LocalDateTimeSerializer;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TimeIntervalRequest {

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime from;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime until;

    private int page;
    private int size;

}
