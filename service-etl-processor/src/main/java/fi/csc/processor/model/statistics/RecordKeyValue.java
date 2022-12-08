package fi.csc.processor.model.statistics;

import java.io.Serializable;

public record RecordKeyValue(String key, Long value) implements Serializable {}
