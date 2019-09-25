package fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlValue;

@XmlAccessorType(XmlAccessType.NONE)
public class Request {

    @XmlAttribute(name = "verb")
    protected String verb;

    @XmlAttribute(name = "identifier")
    protected String identifier;

    @XmlAttribute(name = "metadataPrefix")
    protected String metadataPrefix;

    @XmlValue
    private String requestUrl;

    public Request() {}

    public Request(String verb, String identifier, String metadataPrefix, String requestUrl) {
        this.verb = verb.isEmpty() ? null : verb;
        this.identifier = identifier.isEmpty() ? null : identifier;
        this.metadataPrefix = metadataPrefix.isEmpty() ? null : metadataPrefix;
        this.requestUrl = requestUrl;
    }
}
