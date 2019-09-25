package fi.csc.oaipmh.model.xml_dublincore;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "oai_dc:dc")
@XmlAccessorType(XmlAccessType.NONE)
public class DublinCoreFrame {

    @XmlAttribute(name = "xmlns:oai_dc")
    protected final String xmlns_oai_dc = "http://www.openarchives.org/OAI/2.0/oai_dc/";

    @XmlAttribute(name = "xmlns:dc")
    protected final String xmlns_dc = "http://purl.org/dc/elements/1.1/";

    @XmlAttribute(name = "xmlns:xsi")
    protected final String xmlns_xsi = "http://www.w3.org/2001/XMLSchema-instance";

    @XmlAttribute(name = "xsi:schemaLocation")
    protected final String xsi_schemaLocation = "http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd";

    @XmlElement(name = "dc:identifier")
    private String[] identifier;

    @XmlElement(name = "dc:title")
    private String[] title;

    @XmlElement(name = "dc:creator")
    private String[] creator;

    @XmlElement(name = "dc:date")
    private String[] date;

    @XmlElement(name = "dc:description")
    private String[] description;

    @XmlElement(name = "dc:subject")
    private String[] subject;

    @XmlElement(name = "dc:format")
    private String[] format;

    @XmlElement(name = "dc:rights")
    private String[] rights;

    @XmlElement(name = "dc:publisher")
    private String[] publisher;

    @XmlElement(name = "dc:type")
    private String[] type;

    public String[] getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String[] identifier) {
        this.identifier = identifier;
    }

    public String[] getTitle() {
        return title;
    }

    public void setTitle(String[] title) {
        this.title = title;
    }

    public String[] getCreator() {
        return creator;
    }

    public void setCreator(String[] creator) {
        this.creator = creator;
    }

    public String[] getDate() {
        return date;
    }

    public void setDate(String[] date) {
        this.date = date;
    }

    public String[] getDescription() {
        return description;
    }

    public void setDescription(String[] description) {
        this.description = description;
    }

    public String[] getSubject() {
        return subject;
    }

    public void setSubject(String[] subject) {
        this.subject = subject;
    }

    public String[] getFormat() {
        return format;
    }

    public void setFormat(String[] format) {
        this.format = format;
    }

    public String[] getRights() {
        return rights;
    }

    public void setRights(String[] rights) {
        this.rights = rights;
    }

    public String[] getPublisher() {
        return publisher;
    }

    public void setPublisher(String[] publisher) {
        this.publisher = publisher;
    }

    public String[] getType() {
        return type;
    }

    public void setType(String[] type) {
        this.type = type;
    }
}
