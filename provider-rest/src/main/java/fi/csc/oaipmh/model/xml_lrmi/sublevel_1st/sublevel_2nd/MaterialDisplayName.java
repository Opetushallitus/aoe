package fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.sublevel_2nd;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;

@JsonIgnoreProperties(ignoreUnknown = true)
@SuppressWarnings("unused")
@XmlAccessorType(XmlAccessType.NONE)
public class MaterialDisplayName {

    @XmlElement(name = "lrmi:id")
    private String id;

    @XmlElement(name = "lrmi:displayname")
    private String displayname;

    @XmlElement(name = "lrmi:language")
    private String language;

    @XmlElement(name = "lrmi:materialid")
    private String materialid;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDisplayname() {
        return displayname;
    }

    public void setDisplayname(String displayname) {
        this.displayname = displayname;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getMaterialid() {
        return materialid;
    }

    public void setMaterialid(String materialid) {
        this.materialid = materialid;
    }
}
