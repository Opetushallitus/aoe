package fi.csc.processor.model;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {
    private String sessionId;
    private String timestamp;
    private String keywords;
    private SearchFilter filters;
}
