package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import fi.csc.provider.model.xml_lrmi.sublevel_1st.sublevel_2nd.GeneralType;
import lombok.Getter;
import lombok.Setter;

import javax.xml.bind.annotation.*;

@Getter
@Setter
@SuppressWarnings("unused")
@XmlSeeAlso({GeneralType.class})
@XmlAccessorType(XmlAccessType.NONE)
@XmlRootElement(name = "lrmi_fi:educationalAlignment")
public class EducationalAlignment {

    @XmlElement(name = "lrmi_fi:educationalSubject")
    private GeneralType educationalSubject;

}
