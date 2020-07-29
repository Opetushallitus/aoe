package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import javax.xml.bind.annotation.*;

@SuppressWarnings("unused")
@XmlAccessorType(XmlAccessType.NONE)
@XmlRootElement
public class Thumbnail {

    @XmlValue
    private String filepath;
    private String mimetype;

    public Thumbnail() {}

    public Thumbnail(String filepath, String mimetype) {
        this.filepath = filepath;
        this.mimetype = mimetype;
    }

    public String getFilepath() {
        return filepath;
    }

    public void setFilepath(String filepath) {
        this.filepath = filepath;
    }

    @XmlAttribute(name = "format")
    public String getMimetype() {
        return mimetype;
    }

    public void setMimetype(String mimetype) {
        this.mimetype = mimetype;
    }
}
