package fi.csc.processor.model;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class BaseEvent {
    private String sessionId;
    private String timestamp;
}
