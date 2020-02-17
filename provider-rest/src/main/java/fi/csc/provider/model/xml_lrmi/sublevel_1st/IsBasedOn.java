package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import fi.csc.provider.model.xml_lrmi.sublevel_1st.sublevel_2nd.IsBasedOnAuthor;
import lombok.Getter;
import lombok.Setter;

import javax.xml.bind.annotation.*;
import java.util.List;

@Getter
@Setter
@SuppressWarnings("unused")
@XmlSeeAlso({IsBasedOnAuthor.class})
@XmlAccessorType(XmlAccessType.NONE)
public class IsBasedOn {

    @XmlElement(name = "lrmi_fi:url")
    private String url;

    @XmlElement(name = "lrmi_fi:name")
    private String name;

    @XmlElement(name = "lrmi_fi:author")
    private List<IsBasedOnAuthor> isBasedOnAuthors;

}
