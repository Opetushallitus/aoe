package fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.sublevel_2nd.sublevel_3rd;

import fi.csc.oaipmh.model.xml_dublincore.DublinCoreFrame;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;

@XmlAccessorType(XmlAccessType.NONE)
public class RecordMetadata {

    @XmlElement(name = "oai_dc:dc")
    private DublinCoreFrame dublinCoreFrame;

    public RecordMetadata() {}

    public RecordMetadata(DublinCoreFrame dublinCoreFrame) {
        this.dublinCoreFrame = dublinCoreFrame;
    }

    public DublinCoreFrame getDublinCoreFrame() {
        return dublinCoreFrame;
    }

    public void setDublinCoreFrame(DublinCoreFrame dublinCoreFrame) {
        this.dublinCoreFrame = dublinCoreFrame;
    }
}
