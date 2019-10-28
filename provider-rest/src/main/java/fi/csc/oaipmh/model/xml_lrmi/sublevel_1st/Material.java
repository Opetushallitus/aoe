package fi.csc.oaipmh.model.xml_lrmi.sublevel_1st;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;

@SuppressWarnings("unused")
@XmlAccessorType(XmlAccessType.NONE)
public class Material {

    @XmlElement(name = "lrmi_fi:name")
    private String name;

    @XmlElement(name = "lrmi_fi:url")
    private String url;

    @XmlElement(name = "lrmi_fi:position")
    private Integer position;

    @XmlElement(name = "lrmi_fi:format")
    private String format;

    @XmlElement(name = "lrmi_fi:filesize")
    private Integer fileSize;

    @XmlElement(name = "lrmi_fi:inlanguage")
    private String inLanguage;

    public Material() {}

    public Material(String name, String url, Integer position, String format, Integer fileSize, String inLanguage) {
        this.name = name;
        this.url = url;
        this.position = position;
        this.format = format;
        this.fileSize = fileSize;
        this.inLanguage = inLanguage;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public Integer getFileSize() {
        return fileSize;
    }

    public void setFileSize(Integer fileSize) {
        this.fileSize = fileSize;
    }

    public String getInLanguage() {
        return inLanguage;
    }

    public void setInLanguage(String inLanguage) {
        this.inLanguage = inLanguage;
    }
}
