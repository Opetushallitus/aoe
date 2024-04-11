package fi.csc.provider.model.xml_oaipmh.sublevel_1st.sublevel_2nd.sublevel_3rd;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlAttribute;
import jakarta.xml.bind.annotation.XmlElement;

@XmlAccessorType(XmlAccessType.NONE)
public class RecordHeader {

    @XmlAttribute
    private String status; // null | "deleted"

    @XmlElement
    private String identifier;

    @XmlElement
    private String datestamp;

    public RecordHeader() {}

    public RecordHeader(String status, String identifier, String datestamp) {
        this.status = status;
        this.identifier = identifier;
        this.datestamp = datestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getDatestamp() {
        return datestamp;
    }

    public void setDatestamp(String datestamp) {
        this.datestamp = datestamp;
    }
}
