package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.Getter;
import lombok.Setter;

@SuppressWarnings("unused")
@Getter
@Setter
@XmlAccessorType(XmlAccessType.NONE)
@XmlRootElement(name = "lrmi_fi:person")
public class Person {

    @XmlElement(name = "lrmi_fi:name")
    private String name;

    @XmlElement(name = "lrmi_fi:affiliation")
    private String affiliation;

}
