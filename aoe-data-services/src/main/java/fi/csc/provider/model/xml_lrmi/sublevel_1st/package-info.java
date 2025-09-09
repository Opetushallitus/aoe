
@XmlJavaTypeAdapters({
        @XmlJavaTypeAdapter(value= StringAdapter.class, type=String.class)
})
package fi.csc.provider.model.xml_lrmi.sublevel_1st;

import fi.csc.provider.model.xml_lrmi.StringAdapter;
import jakarta.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import jakarta.xml.bind.annotation.adapters.XmlJavaTypeAdapters;