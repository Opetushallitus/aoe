package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;

@SuppressWarnings("unused")
@XmlAccessorType(XmlAccessType.NONE)
public class EducationalAudience {

    @XmlElement(name = "lrmi_fi:educationalRole")
    private String educationalRole;

    public String getEducationalRole() {
        return educationalRole;
    }

    public void setEducationalRole(String educationalRole) {
        this.educationalRole = educationalRole;
    }
}
