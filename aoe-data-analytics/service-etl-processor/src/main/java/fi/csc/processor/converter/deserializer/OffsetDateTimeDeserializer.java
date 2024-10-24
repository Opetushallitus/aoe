package fi.csc.processor.converter.deserializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

public class OffsetDateTimeDeserializer extends JsonDeserializer<OffsetDateTime> {

    @Override
    public OffsetDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        LocalDateTime localDateTime = LocalDate.parse(p.getText(), DateTimeFormatter.ofPattern("yyyy-MM-dd")).atStartOfDay();
        return OffsetDateTime.of(localDateTime, ZoneOffset.UTC);
    }
}
