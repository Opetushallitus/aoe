package fi.csc.oaipmh.model.xml_oaipmh;

import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.Identify;
import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.ListIdentifiers;
import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.ListRecords;
import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.Request;
import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAnyElement;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;

@XmlRootElement(name = "OAI-PMH")
@XmlAccessorType(XmlAccessType.NONE)
@XmlSeeAlso({Identify.class, ListIdentifiers.class, ListRecords.class}) // XML context binding for the generic fields
@XmlType(propOrder = {"responseDate", "request", "verb"})
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

    @XmlAnyElement
    private JAXBElement<?> verb;

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

    public JAXBElement<?> getVerb() {
        return verb;
    }

    public void setVerb(JAXBElement<?> verb) {
        this.verb = verb;
    }
}
