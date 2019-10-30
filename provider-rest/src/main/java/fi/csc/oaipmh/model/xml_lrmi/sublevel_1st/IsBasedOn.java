package fi.csc.oaipmh.model.xml_lrmi.sublevel_1st;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;

@SuppressWarnings("unused")
@XmlAccessorType(XmlAccessType.NONE)
public class IsBasedOn {

    @XmlElement(name = "lrmi_fi:title")
    private String title;

    @XmlElement(name = "lrmi_fi:contributor")
    private String contributor;

    @XmlElement(name = "lrmi_fi:identifier")
    private String identifier;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContributor() {
        return contributor;
    }

    public void setContributor(String contributor) {
        this.contributor = contributor;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }
}
