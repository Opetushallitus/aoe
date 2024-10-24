package fi.csc.processor.model.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrganizationTotalRequest extends BaseTotalRequest {
    private String[] organizations;
}
