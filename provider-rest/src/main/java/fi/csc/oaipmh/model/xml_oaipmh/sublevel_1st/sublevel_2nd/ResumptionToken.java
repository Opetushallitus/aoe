package fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.sublevel_2nd;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlValue;

@SuppressWarnings("unused")
@XmlAccessorType(XmlAccessType.NONE)
public class ResumptionToken {

    @XmlAttribute
    private Long completeListSize;

    @XmlAttribute
    private Integer cursor; // previous metadata index

    @XmlValue
    private String value;

    public ResumptionToken(Long completeListSize, Integer cursor, String value) {
        this.completeListSize = completeListSize;
        this.cursor = cursor;
        this.value = value;
    }

    public Long getCompleteListSize() {
        return completeListSize;
    }

    public void setCompleteListSize(Long completeListSize) {
        this.completeListSize = completeListSize;
    }

    public Integer getCursor() {
        return cursor;
    }

    public void setCursor(Integer cursor) {
        this.cursor = cursor;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
