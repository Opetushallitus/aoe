package fi.csc.provider.model.xml_oaipmh.sublevel_1st.sublevel_2nd.sublevel_3rd;

import fi.csc.provider.model.xml_lrmi.LrmiMetadata;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlSeeAlso;

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
