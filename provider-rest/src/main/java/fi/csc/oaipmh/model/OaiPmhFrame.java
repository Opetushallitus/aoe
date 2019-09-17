package fi.csc.oaipmh.model;

import fi.csc.oaipmh.model.sublevel_1st.Request;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

@XmlRootElement(name = "OAI-PMH")
@XmlAccessorType(XmlAccessType.NONE)
@XmlType(propOrder = {"responseDate", "request"})
public class OaiPmhFrame {

    @XmlAttribute(name = "xmlns")
    protected final String xmlns = "http://www.openarchives.org/OAI/2.0/";

    @XmlAttribute(name = "xmlns:xsi")
    protected final String xmlns_xsi = "http://www.w3.org/2001/XMLSchema-instance";

    @XmlAttribute(name = "xsi:schemaLocation")
    protected final String xsi_schemaLocation = "http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd";

    @XmlElement(name = "responseDate")
    private String responseDate;

    @XmlElement(name = "request")
    private Request request;

    public String getResponseDate() {
        return responseDate;
    }

    public void setResponseDate(String responseDate) {
        this.responseDate = responseDate;
    }

    public Request getRequest() {
        return request;
    }

    public void setRequest(Request request) {
        this.request = request;
    }
}
