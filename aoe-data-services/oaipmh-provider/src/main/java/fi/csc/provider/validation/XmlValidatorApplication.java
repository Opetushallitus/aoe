package fi.csc.provider.validation;

import org.xml.sax.SAXException;

import javax.xml.XMLConstants;
import javax.xml.transform.Source;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.validation.Validator;
import java.io.File;
import java.io.IOException;

public class XmlValidatorApplication {

    public static void main(String[] args) {
        String xmlFile = "<PATH>\\oai_dc.xml";
        String xsdFile = "<PATH>\\oai_dc.xsd";
        validateXmlFile(xmlFile, xsdFile);
    }

    private static void validateXmlFile(String xmlFile, String xsdFile) {
        Source xsdSource = new StreamSource(new File(xsdFile));
        Source xmlSource = new StreamSource(new File(xmlFile));

        // XMLConstant or URL string
        SchemaFactory schemaFactory = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);

        try {
            Schema schema = schemaFactory.newSchema(xsdSource);

            // Multiple XSD files
            Validator validator = schema.newValidator();
            validator.validate(xmlSource);
            System.out.println(xmlSource.getSystemId() + " is valid");
        } catch (SAXException | IOException e) {
            System.out.println(xmlSource.getSystemId() + " is NOT valid");
            System.out.println("Reason: " + e.getLocalizedMessage());
        }
    }
}
