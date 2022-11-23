package fi.csc.processor.controller;

import fi.csc.processor.enumeration.Interval;
import fi.csc.processor.model.request.IntervalTotalRequest;
import fi.csc.processor.model.statistics.StatisticsMeta;
import fi.csc.processor.service.StatisticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

import static fi.csc.processor.utils.AsyncUtil.async;

@RestController
@RequestMapping(value = "/statistics")
public class StatisticsController {
    private static final Logger LOG = LoggerFactory.getLogger(StatisticsController.class.getSimpleName());
    private final StatisticsService statisticsService;

    @Autowired
    StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @PostMapping(path = "/{interval}/total", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<StatisticsMeta<?>>> getTotalByInterval(
        @PathVariable(value = "interval") Interval interval,
        @RequestBody IntervalTotalRequest intervalTotalRequest) {
        return async(() -> {
            StatisticsMeta<?> statistics = this.statisticsService.getTotalByInterval(
                interval,
                intervalTotalRequest);
            return new ResponseEntity<>(statistics, HttpStatus.OK);
        });
    }
}
