package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import lombok.Getter;
import lombok.Setter;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;

@Getter
@Setter
@SuppressWarnings("unused")
@XmlAccessorType(XmlAccessType.NONE)
public class IsBasedOn {

    @XmlElement(name = "lrmi_fi:url")
    private String url;

    @XmlElement(name = "lrmi_fi:name")
    private String name;

    @XmlElement(name = "lrmi_fi:author")
    private String[] author;

}
