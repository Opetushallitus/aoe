
@XmlJavaTypeAdapters({
        @XmlJavaTypeAdapter(value=StringAdapter.class, type=String.class)
})
package fi.csc.provider.model.xml_lrmi;

import jakarta.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import jakarta.xml.bind.annotation.adapters.XmlJavaTypeAdapters;