package fi.csc.provider.model.xml_lrmi;

import jakarta.xml.bind.annotation.adapters.XmlAdapter;
import org.apache.xml.utils.XMLChar;

public class StringAdapter extends XmlAdapter<String, String> {

    @Override
    public String unmarshal(String input) {
        return input;
    }

    @Override
    public String marshal(String input) {
        return input != null ? removeInvalidXmlCharacters(input) : null;
    }

    private String removeInvalidXmlCharacters(String input) {
        StringBuilder sb = new StringBuilder();
        for (char c : input.toCharArray()) {
            if (XMLChar.isValid(c)) {
                sb.append(c);
            }
        }
        return sb.toString();
    }
}
