package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import fi.csc.provider.enumeration.Language;
import jakarta.xml.bind.annotation.*;

@SuppressWarnings("unused")
@XmlAccessorType(XmlAccessType.NONE)
@XmlRootElement
public class LangValue {

    @XmlValue
    private String value;
    private Language lang;

    public LangValue() {}

    public LangValue(Language lang, String value) {
        this.lang = lang;
        this.value = value;
    }

    @XmlAttribute(name = "xml:lang")
    public String getLang() {
        return lang.toString();
    }

    public void setLang(Language lang) {
        this.lang = lang;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
