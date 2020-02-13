package fi.csc.resolver.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@SuppressWarnings("unused")
public class TimeInterval {

    private LocalDateTime from;
    private LocalDateTime unitl;

}
