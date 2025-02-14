package fi.csc.provider.model.xml_lrmi.sublevel_1st.sublevel_2nd;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlValue;
import lombok.Setter;

@SuppressWarnings("unused")
@Setter
@XmlAccessorType(XmlAccessType.NONE)
public class GeneralType {

    @XmlValue
    private String value;

    public String getValue() {
        // Remove all ASCII low-end control characters from value on get, since
        // they are not allowed in XML
        return value.replaceAll("[\\x00-\\x08]", "");
    }
}
