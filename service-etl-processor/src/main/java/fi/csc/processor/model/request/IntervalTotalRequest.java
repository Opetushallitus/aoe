package fi.csc.processor.model.request;

import fi.csc.processor.model.Metadata;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class IntervalTotalRequest extends BaseRequest {
    private Metadata metadata;
}
