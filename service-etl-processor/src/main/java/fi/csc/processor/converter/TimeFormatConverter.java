package fi.csc.processor.converter;

import org.springframework.core.convert.converter.Converter;
import org.springframework.util.ClassUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;

import static java.time.Instant.ofEpochMilli;
import static java.time.LocalDateTime.ofInstant;

/**
 * JSR-310 Date and Time Conversions.
 * More in https://jcp.org/aboutJava/communityprocess/pfd/jsr310/JSR-310-guide.html
 */
public abstract class TimeFormatConverter {

    private static final boolean JAVA_8_IS_PRESENT = ClassUtils.isPresent("java.time.LocalDateTime",
            TimeFormatConverter.class.getClassLoader());

    /**
     * @return Returns Collection<Converter> the converters to be registered.
     */
    public static Collection<Converter<?, ?>> getConvertersToRegister() {
        if (!JAVA_8_IS_PRESENT) {
            return Collections.emptySet();
        }
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(DateToLocalDateTimeConverter.INSTANCE);
        converters.add(LocalDateTimeToDateConverter.INSTANCE);
        converters.add(DateToLocalDateConverter.INSTANCE);
        converters.add(LocalDateToDateConverter.INSTANCE);
        return converters;
    }

    /**
     * Converter Date To LocalDateTime.
     * Keep LocalDateTime in UTC, instead of local time zone.
     */
    public enum DateToLocalDateTimeConverter implements Converter<Date, LocalDateTime> {
        INSTANCE;
        @Override
        public LocalDateTime convert(Date source) {
            return source == null ? null : ofInstant(source.toInstant(), ZoneOffset.UTC);
        }
    }

    /**
     * Convert LocalDate To Date.
     * Keep LocalDate in UTC, instead of local time zone.
     */
    public enum LocalDateTimeToDateConverter implements Converter<LocalDateTime, Date> {
        INSTANCE;
        @Override
        public Date convert(LocalDateTime source) {
            return source == null ? null : Date.from(source.atZone(ZoneOffset.UTC).toInstant());
        }
    }

    /**
     * COnvert Date To LocalDate.
     * Keep LocalDate in UTC, instead of local time zone.
     */
    public enum DateToLocalDateConverter implements Converter<Date, LocalDate> {
        INSTANCE;
        @Override
        public LocalDate convert(Date source) {
            return source == null ? null : ofInstant(ofEpochMilli(source.getTime()), ZoneOffset.UTC).toLocalDate();
        }
    }

    /**
     * Convert LocalDate To Date.
     * Keep LocalDateTime in UTC, instead of local time zone.
     */
    public enum LocalDateToDateConverter implements Converter<LocalDate, Date> {
        INSTANCE;
        @Override
        public Date convert(LocalDate source) {
            return source == null ? null : Date.from(source.atStartOfDay(ZoneOffset.UTC).toInstant());
        }
    }
}