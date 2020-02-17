package fi.csc.provider.model.xml_lrmi.sublevel_1st.sublevel_2nd;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.xml.bind.annotation.*;

@Getter
@Setter
@NoArgsConstructor
@SuppressWarnings("unused")
@XmlAccessorType(XmlAccessType.NONE)
@XmlRootElement(name = "lrmi_fi:author")
public class IsBasedOnAuthor {

    @XmlValue
    private String authorName;

}
