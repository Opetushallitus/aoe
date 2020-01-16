package fi.csc.oaipmh.adapter;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

public class URLDecoder {

    public static String decodeValue(String value) {
        try {
            return java.net.URLDecoder.decode(value, StandardCharsets.UTF_8.toString());
        } catch (UnsupportedEncodingException ex) {
            throw new RuntimeException(ex.getCause());
        }
    }
}
