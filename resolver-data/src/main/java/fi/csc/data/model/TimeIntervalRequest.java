package fi.csc.data.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import fi.csc.data.adapter.LocalDateTimeDeserializer;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@SuppressWarnings("unused")
public class TimeIntervalRequest {

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime from;

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime until;

    private Integer page;
    private Integer size;

}
