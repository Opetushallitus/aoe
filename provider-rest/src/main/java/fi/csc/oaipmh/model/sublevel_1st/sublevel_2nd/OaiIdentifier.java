package fi.csc.oaipmh.model.sublevel_1st.sublevel_2nd;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;

@XmlAccessorType(XmlAccessType.NONE)
public class OaiIdentifier {

    @XmlAttribute(name = "xmlns")
    protected final String xmlns = "http://www.openarchives.org/OAI/2.0/oai-identifier";

    @XmlAttribute(name = "xmlns:xsi")
    protected final String xmlns_xsi = "http://www.w3.org/2001/XMLSchema-instance";

    @XmlAttribute(name = "xsi:schemaLocation")
    protected final String xsi_schemaLocation = "http://www.openarchives.org/OAI/2.0/oai-identifier "
        + "http://www.openarchives.org/OAI/2.0/oai-identifier.xsd";

    @XmlElement
    private String scheme;

    @XmlElement
    private String repositoryIdentifier;

    @XmlElement
    private String delimeter;

    @XmlElement
    private String sampleIdentifier;

    public OaiIdentifier() {}

    public OaiIdentifier(String scheme, String repositoryIdentifier, String delimeter, String sampleIdentifier) {
        this.scheme = scheme;
        this.repositoryIdentifier = repositoryIdentifier;
        this.delimeter = delimeter;
        this.sampleIdentifier = sampleIdentifier;
    }

    public String getScheme() {
        return scheme;
    }

    public void setScheme(String scheme) {
        this.scheme = scheme;
    }

    public String getRepositoryIdentifier() {
        return repositoryIdentifier;
    }

    public void setRepositoryIdentifier(String repositoryIdentifier) {
        this.repositoryIdentifier = repositoryIdentifier;
    }

    public String getDelimeter() {
        return delimeter;
    }

    public void setDelimeter(String delimeter) {
        this.delimeter = delimeter;
    }

    public String getSampleIdentifier() {
        return sampleIdentifier;
    }

    public void setSampleIdentifier(String sampleIdentifier) {
        this.sampleIdentifier = sampleIdentifier;
    }
}
