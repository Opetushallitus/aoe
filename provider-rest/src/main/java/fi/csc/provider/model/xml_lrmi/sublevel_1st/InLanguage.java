package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;

@SuppressWarnings("unused")
@XmlAccessorType(XmlAccessType.NONE)
public class InLanguage {

    @XmlElement(name = "lrmi_fi:inLanguage")
    private String inLanguage;

    @XmlElement(name = "lrmi_fi:url")
    private String url;

    public String getInLanguage() {
        return inLanguage;
    }

    public void setInLanguage(String inLanguage) {
        this.inLanguage = inLanguage;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
