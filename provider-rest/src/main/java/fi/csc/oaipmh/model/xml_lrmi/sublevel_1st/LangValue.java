package fi.csc.oaipmh.model.xml_lrmi.sublevel_1st;

import javax.xml.bind.annotation.*;

@SuppressWarnings("unused")
@XmlAccessorType(XmlAccessType.NONE)
@XmlRootElement
public class LangValue {

    @XmlAttribute(name = "xml:lang")
    private String lang;

    @XmlValue
    private String value;

    public LangValue() {}

    public LangValue(String lang, String value) {
        this.lang = lang;
        this.value = value;
    }

    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
