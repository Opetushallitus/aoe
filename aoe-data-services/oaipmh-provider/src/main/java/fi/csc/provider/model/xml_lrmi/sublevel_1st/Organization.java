package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

@SuppressWarnings("unused")
@XmlAccessorType(XmlAccessType.NONE)
@XmlRootElement(name = "lrmi_fi:organization")
public class Organization {

    @XmlElement(name = "lrmi_fi:legalName")
    private String legalName;

    public String getLegalName() {
        return legalName;
    }

    public void setLegalName(String legalName) {
        this.legalName = legalName;
    }
}
