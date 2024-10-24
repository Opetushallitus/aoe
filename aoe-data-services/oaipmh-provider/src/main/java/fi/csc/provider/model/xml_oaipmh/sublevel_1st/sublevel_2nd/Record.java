package fi.csc.provider.model.xml_oaipmh.sublevel_1st.sublevel_2nd;

import fi.csc.provider.model.xml_oaipmh.sublevel_1st.sublevel_2nd.sublevel_3rd.RecordHeader;
import fi.csc.provider.model.xml_oaipmh.sublevel_1st.sublevel_2nd.sublevel_3rd.RecordMetadata;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlSeeAlso;

@XmlSeeAlso({RecordHeader.class, RecordMetadata.class})
@XmlAccessorType(XmlAccessType.NONE)
public class Record {

    @XmlElement(name = "header")
    private RecordHeader header;

    @XmlElement(name = "metadata")
    private RecordMetadata metadata;

    public RecordHeader getHeader() {
        return header;
    }

    public void setHeader(RecordHeader header) {
        this.header = header;
    }

    public RecordMetadata getMetadata() {
        return metadata;
    }

    public void setMetadata(RecordMetadata metadata) {
        this.metadata = metadata;
    }
}
