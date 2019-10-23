package fi.csc.oaipmh.model.xml_lrmi.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.sublevel_2nd.MaterialDisplayName;

import javax.xml.bind.annotation.*;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
@SuppressWarnings("unused")
@XmlSeeAlso({MaterialDisplayName.class})
@XmlAccessorType(XmlAccessType.NONE)
public class Material {

    @XmlElement(name = "lrmi:id")
    private Long id;

    @XmlElement(name = "lrmi:language")
    private String language;

    @XmlElement(name = "lrmi:key")
    private String key;

    @XmlElement(name = "lrmi:link")
    private String link;

    @XmlElement(name = "lrmi:priority")
    private Integer priority;

    @XmlElement(name = "lrmi:filepath")
    private String filepath;

    @XmlElement(name = "lrmi:originalfilename")
    private String originalfilename;

    @XmlElement(name = "lrmi:filesize")
    private Integer filesize;

    @XmlElement(name = "lrmi:minetype")
    private String mimetype;

    @XmlElement(name = "lrmi:format")
    private String format;

    @XmlElement(name = "lrmi:filekey")
    private String filekey;

    @XmlElement(name = "lrmi:createdat")
    private String filebucket;

    @XmlElement(name = "lrmi:createdat")
    private Integer obsolete;

    @XmlElement(name = "lrmi:materialdisplayname")
    private List<MaterialDisplayName> materialdisplayname;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public String getFilepath() {
        return filepath;
    }

    public void setFilepath(String filepath) {
        this.filepath = filepath;
    }

    public String getOriginalfilename() {
        return originalfilename;
    }

    public void setOriginalfilename(String originalfilename) {
        this.originalfilename = originalfilename;
    }

    public Integer getFilesize() {
        return filesize;
    }

    public void setFilesize(Integer filesize) {
        this.filesize = filesize;
    }

    public String getMimetype() {
        return mimetype;
    }

    public void setMimetype(String mimetype) {
        this.mimetype = mimetype;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getFilekey() {
        return filekey;
    }

    public void setFilekey(String filekey) {
        this.filekey = filekey;
    }

    public String getFilebucket() {
        return filebucket;
    }

    public void setFilebucket(String filebucket) {
        this.filebucket = filebucket;
    }

    public Integer getObsolete() {
        return obsolete;
    }

    public void setObsolete(Integer obsolete) {
        this.obsolete = obsolete;
    }

    public List<MaterialDisplayName> getMaterialdisplayname() {
        return materialdisplayname;
    }

    public void setMaterialdisplayname(List<MaterialDisplayName> materialdisplayname) {
        this.materialdisplayname = materialdisplayname;
    }
}
