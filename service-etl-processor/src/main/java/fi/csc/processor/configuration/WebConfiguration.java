package fi.csc.processor.configuration;

import fi.csc.processor.annotation.RequestParameterConverter;
import org.springframework.beans.factory.ListableBeanFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Map;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    private final ListableBeanFactory beanFactory;

    @Autowired
    public WebConfiguration(ListableBeanFactory beanFactory) {
        this.beanFactory = beanFactory;
    }

    @Override
    public void addFormatters(FormatterRegistry registry) {
        Map<String, Object> components = beanFactory.getBeansWithAnnotation(RequestParameterConverter.class);
        components.values().parallelStream().forEach(c -> {
            if(c instanceof Converter) {
                registry.addConverter((Converter)c);
            }
        });
    }
}
