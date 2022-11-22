package fi.csc.processor.model.request;

import fi.csc.processor.model.BaseEvent;
import fi.csc.processor.model.SearchFilter;
import lombok.*;

@Getter
@Setter
public class SearchRequest extends BaseEvent {
    private String keywords;
    private SearchFilter filters;
}
