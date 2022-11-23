package fi.csc.processor.converter;

import fi.csc.processor.annotation.RequestParameterConverter;
import fi.csc.processor.enumeration.Interval;
import org.springframework.core.convert.converter.Converter;

@RequestParameterConverter
public class StringToIntervalConverter implements Converter<String, Interval> {

    @Override
    public Interval convert(String source) {
        return Interval.decode(source);
    }
}
