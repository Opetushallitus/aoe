package fi.csc.processor.model.statistics;

import java.io.Serializable;
import java.time.LocalDate;

public record RecordDateValue(LocalDate date, Integer value) implements Serializable {}
