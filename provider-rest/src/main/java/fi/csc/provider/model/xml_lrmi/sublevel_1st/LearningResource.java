package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import fi.csc.provider.model.xml_lrmi.sublevel_1st.sublevel_2nd.GeneralType;
import lombok.Getter;
import lombok.Setter;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAnyElement;
import javax.xml.bind.annotation.XmlSeeAlso;

@SuppressWarnings("unused")
@Getter
@Setter
@XmlAccessorType(XmlAccessType.NONE)
@XmlSeeAlso({GeneralType.class, GeneralType.class})
public class LearningResource {

    // Optional sub-elements: EducationalLevel, Teaches
    @XmlAnyElement
    private JAXBElement<?> learningResourceElement;

}
