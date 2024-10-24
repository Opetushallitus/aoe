package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
