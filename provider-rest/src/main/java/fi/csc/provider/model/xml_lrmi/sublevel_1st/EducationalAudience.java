package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;

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
