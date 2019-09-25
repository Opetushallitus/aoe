package fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.sublevel_2nd;

import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.sublevel_2nd.sublevel_3rd.RecordHeader;
import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.sublevel_2nd.sublevel_3rd.RecordMetadata;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSeeAlso;

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
