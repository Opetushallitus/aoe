package fi.csc.provider.model.xml_lrmi.sublevel_1st.sublevel_2nd;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlValue;
import lombok.Getter;
import lombok.Setter;

@SuppressWarnings("unused")
@Getter
@Setter
@XmlAccessorType(XmlAccessType.NONE)
public class GeneralType {

    @XmlValue
    private String value;

}
