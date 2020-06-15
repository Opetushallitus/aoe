package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@Getter
@Setter
@NoArgsConstructor
@SuppressWarnings("unused")
@XmlAccessorType(XmlAccessType.NONE)
@XmlRootElement(name = "lrmi_fi:thing")
public class Thing {

    @XmlElement(name = "lrmi_fi:name")
    private String name;

    @XmlElement(name = "lrmi_fi:identifier")
    private String identifier;

}
