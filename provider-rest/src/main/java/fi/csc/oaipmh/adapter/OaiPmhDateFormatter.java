package fi.csc.oaipmh.adapter;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class OaiPmhDateFormatter {

    private static final DateTimeFormatter OAI_DATETIME = DateTimeFormatter
        .ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")
        .withZone(ZoneId.of("UTC"));
    /*private static final DateTimeFormatter ISO_DATETIME = DateTimeFormatter
        .ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        .withZone(ZoneId.of("UTC"));*/

    public static LocalDateTime convertToIso(String value) {
        return LocalDateTime.parse(value, OAI_DATETIME);
    }
}
