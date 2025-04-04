package fi.csc.provider.adapter;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class OaiPmhDateFormatter {

    private OaiPmhDateFormatter(){
        // no instance creation allowed
    }

    private static final DateTimeFormatter OAI_DATETIME = DateTimeFormatter
        .ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")
        .withZone(ZoneId.of("UTC"));

    public static LocalDateTime convertToIso(String value) {
        return LocalDateTime.parse(value, OAI_DATETIME);
    }
}
