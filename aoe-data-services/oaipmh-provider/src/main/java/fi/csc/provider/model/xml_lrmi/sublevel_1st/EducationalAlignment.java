package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import fi.csc.provider.model.xml_lrmi.sublevel_1st.sublevel_2nd.GeneralType;
import jakarta.xml.bind.annotation.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@SuppressWarnings("unused")
@XmlSeeAlso({GeneralType.class})
@XmlAccessorType(XmlAccessType.NONE)
@XmlRootElement(name = "lrmi_fi:educationalAlignment")
public class EducationalAlignment {

    @XmlElement(name = "lrmi_fi:educationalSubject")
    private GeneralType educationalSubject;

    @XmlElement(name = "lrmi_fi:educationalFramework")
    private String educationalFramework;

}
