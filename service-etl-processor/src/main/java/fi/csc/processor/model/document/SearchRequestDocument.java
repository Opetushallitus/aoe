package fi.csc.processor.model.document;

import fi.csc.processor.model.SearchFilter;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "search_requests")
public class SearchRequestDocument extends BaseCollection {
    private String sessionId;
    private String keywords;
    private SearchFilter filters;
}
