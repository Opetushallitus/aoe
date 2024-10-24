package fi.csc.processor.model;

import lombok.*;

@Getter
@Setter
public class BaseEvent {
    private String sessionId;
    private String timestamp;
}
