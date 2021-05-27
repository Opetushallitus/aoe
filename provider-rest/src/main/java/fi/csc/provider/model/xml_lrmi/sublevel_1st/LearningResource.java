package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import fi.csc.provider.model.xml_lrmi.sublevel_1st.sublevel_2nd.EducationalLevel;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.sublevel_2nd.Teaches;
import lombok.Getter;
import lombok.Setter;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.*;

@SuppressWarnings("unused")
@Getter
@Setter
@XmlAccessorType(XmlAccessType.NONE)
@XmlSeeAlso({EducationalLevel.class, Teaches.class})
public class LearningResource {

    // Optional sub-elements: EducationalLevel, Teaches
    @XmlAnyElement
    private JAXBElement<?> learningResourceElement;

}
