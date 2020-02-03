package fi.csc.provider.serialization;

import javax.xml.bind.annotation.adapters.XmlAdapter;
import java.time.*;
import java.time.format.DateTimeFormatter;

public class XmlDateTimeAdapter extends XmlAdapter<String, LocalDateTime> {

    private final DateTimeFormatter CUSTOM_DATETIME = DateTimeFormatter
            .ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")
            .withZone(ZoneId.of("UTC"));

    @Override
    public LocalDateTime unmarshal(String dateTimeString) throws Exception {
        Instant instant = Instant.parse(dateTimeString);
        OffsetDateTime odt = instant.atOffset(ZoneOffset.UTC);
        return odt.toLocalDateTime();
    }

    @Override
    public String marshal(LocalDateTime localDateTime) throws Exception {
        return CUSTOM_DATETIME.format(localDateTime);
    }
}
