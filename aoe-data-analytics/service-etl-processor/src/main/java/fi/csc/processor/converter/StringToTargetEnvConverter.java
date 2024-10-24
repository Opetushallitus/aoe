package fi.csc.processor.converter;

import fi.csc.processor.annotation.RequestParameterConverter;
import fi.csc.processor.enumeration.TargetEnv;
import org.springframework.core.convert.converter.Converter;

@RequestParameterConverter
public class StringToTargetEnvConverter implements Converter<String, TargetEnv> {

    @Override
    public TargetEnv convert(String source) {
        return TargetEnv.decode(source);
    }
}
