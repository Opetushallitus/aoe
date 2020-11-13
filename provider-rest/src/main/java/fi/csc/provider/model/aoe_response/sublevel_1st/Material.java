package fi.csc.provider.model.aoe_response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import fi.csc.provider.adapter.NumericBooleanDeserializer;
import fi.csc.provider.adapter.NumericBooleanSerializer;
import fi.csc.provider.model.aoe_response.sublevel_1st.sublevel_2nd.MaterialDisplayName;
import lombok.Getter;

import java.util.List;

@Getter
@SuppressWarnings("unused")
public class Material {

    @JsonProperty
    private String id;

    @JsonProperty
    private String language;

    /*@JsonProperty
    private String key;*/

    @JsonProperty
    private String link;

    @JsonProperty
    private Integer priority;

    @JsonProperty
    private String originalfilename;

    @JsonProperty
    private Integer filesize;

    @JsonProperty
    private String mimetype;

    @JsonProperty
    private String format;

    @JsonProperty
    private String filekey;

    @JsonProperty
    private String filebucket;

    @JsonProperty
    @JsonSerialize(using = NumericBooleanSerializer.class)
    @JsonDeserialize(using = NumericBooleanDeserializer.class)
    private Boolean obsoleted;

    @JsonProperty
    private String filepath;

    @JsonProperty
    private String pdfpath;

    @JsonProperty
    private List<MaterialDisplayName> materialdisplayname;

    public String getId() {
        return id;
    }

    public String getLanguage() {
        return language;
    }

    /*public String getKey() {
        return key;
    }*/

    public String getLink() {
        return link;
    }

    public Integer getPriority() {
        return priority;
    }

    public String getFilepath() {
        return filepath;
    }

    public String getPdfpath() {
        return pdfpath;
    }

    public String getOriginalfilename() {
        return originalfilename;
    }

    public Integer getFilesize() {
        return filesize;
    }

    public String getMimetype() {
        return mimetype;
    }

    public String getFormat() {
        return format;
    }

    public String getFilekey() {
        return filekey;
    }

    public String getFilebucket() {
        return filebucket;
    }

    public Boolean getObsoleted() {
        return obsoleted;
    }

    public List<MaterialDisplayName> getMaterialdisplayname() {
        return materialdisplayname;
    }
}
