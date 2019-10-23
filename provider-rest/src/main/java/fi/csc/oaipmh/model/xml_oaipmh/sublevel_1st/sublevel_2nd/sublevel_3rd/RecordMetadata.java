package fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.sublevel_2nd.sublevel_3rd;

import fi.csc.oaipmh.model.xml_lrmi.LrmiMetadata;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSeeAlso;

@SuppressWarnings("unused")
@XmlSeeAlso({LrmiMetadata.class})
@XmlAccessorType(XmlAccessType.NONE)
public class RecordMetadata {

    @XmlElement(name = "oai_dc:dc")
    private LrmiMetadata lrmiMetadata;

    public RecordMetadata() {}

    public RecordMetadata(LrmiMetadata lrmiMetadata) {
        this.lrmiMetadata = lrmiMetadata;
    }

    public LrmiMetadata getLrmiMetadata() {
        return lrmiMetadata;
    }

    public void setLrmiMetadata(LrmiMetadata lrmiMetadata) {
        this.lrmiMetadata = lrmiMetadata;
    }
}
