package fi.csc.provider.model.xml_oaipmh.sublevel_1st;

import fi.csc.provider.model.xml_oaipmh.sublevel_1st.sublevel_2nd.Record;
import fi.csc.provider.model.xml_oaipmh.sublevel_1st.sublevel_2nd.ResumptionToken;
import jakarta.xml.bind.annotation.*;

import java.util.List;

@XmlAccessorType(XmlAccessType.NONE)
@XmlSeeAlso({Record.class, ResumptionToken.class})
@XmlType(propOrder = {"records", "resumptionToken"})
public class ListIdentifiers {

    @XmlElement(name = "record")
    private List<Record> records;

    @XmlElement(name = "resumptionToken")
    private ResumptionToken resumptionToken;

    public List<Record> getRecords() {
        return records;
    }

    public void setRecords(List<Record> records) {
        this.records = records;
    }

    public ResumptionToken getResumptionToken() {
        return resumptionToken;
    }

    public void setResumptionToken(ResumptionToken resumptionToken) {
        this.resumptionToken = resumptionToken;
    }
}
