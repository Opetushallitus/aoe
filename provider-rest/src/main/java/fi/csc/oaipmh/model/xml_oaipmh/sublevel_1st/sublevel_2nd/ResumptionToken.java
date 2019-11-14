package fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.sublevel_2nd;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlValue;

@XmlAccessorType(XmlAccessType.NONE)
public class ResumptionToken {

    @XmlAttribute
    private String cursor; // "0..n"

    @XmlValue
    private String token;

    public ResumptionToken(String cursor, String token) {
        this.cursor = cursor;
        this.token = token;
    }

    public String getCursor() {
        return cursor;
    }

    public void setCursor(String cursor) {
        this.cursor = cursor;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
