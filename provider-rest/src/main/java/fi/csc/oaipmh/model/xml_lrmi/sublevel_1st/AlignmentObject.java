package fi.csc.oaipmh.model.xml_lrmi.sublevel_1st;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;

@SuppressWarnings("unused")
@XmlAccessorType(XmlAccessType.NONE)
public class AlignmentObject {

    @XmlElement(name = "lrmi_fi:alignmentType")
    private String alignmentType;

    @XmlElement(name = "lrmi_fi:targetName")
    private String targetName;

    @XmlElement(name = "lrmi_fi:educationalFramework")
    private String educationalFramework;

    public String getAlignmentType() {
        return alignmentType;
    }

    public void setAlignmentType(String alignmentType) {
        this.alignmentType = alignmentType;
    }

    public String getTargetName() {
        return targetName;
    }

    public void setTargetName(String targetName) {
        this.targetName = targetName;
    }

    public String getEducationalFramework() {
        return educationalFramework;
    }

    public void setEducationalFramework(String educationalFramework) {
        this.educationalFramework = educationalFramework;
    }
}
