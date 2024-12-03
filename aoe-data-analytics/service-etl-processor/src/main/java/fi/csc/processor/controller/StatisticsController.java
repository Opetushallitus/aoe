package fi.csc.processor.controller;

import fi.csc.processor.enumeration.Interval;
import fi.csc.processor.model.document.MaterialActivityDocument;
import fi.csc.processor.model.document.SearchRequestDocument;
import fi.csc.processor.model.request.EducationalLevelTotalRequest;
import fi.csc.processor.model.request.EducationalSubjectTotalRequest;
import fi.csc.processor.model.request.IntervalTotalRequest;
import fi.csc.processor.model.request.OrganizationTotalRequest;
import fi.csc.processor.model.statistics.StatisticsMeta;
import fi.csc.processor.service.StatisticsService;
import fi.csc.processor.service.TimeSeriesService;
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
    private final TimeSeriesService timeSeriesService;

    @Autowired
    StatisticsController(
        StatisticsService statisticsService,
        TimeSeriesService timeSeriesService) {
        this.statisticsService = statisticsService;
        this.timeSeriesService = timeSeriesService;
    }

    @PostMapping(path = "/prod/educationallevel/all",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<StatisticsMeta<?>>> getEducationalLevelDistribution(
        @RequestBody EducationalLevelTotalRequest educationalLevelTotalRequest) {
        return async(() -> new ResponseEntity<>(this.statisticsService.getEducationalLevelDistribution(
            educationalLevelTotalRequest), HttpStatus.OK));
    }

    @PostMapping(path = "/prod/educationallevel/expired",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<StatisticsMeta<?>>> getEducationalLevelExpired(
        @RequestBody EducationalLevelTotalRequest educationalLevelTotalRequest) {
        if (educationalLevelTotalRequest.getExpiredBefore() != null) {
            return async(() -> new ResponseEntity<>(this.statisticsService.getEducationalLevelExpired(
                educationalLevelTotalRequest), HttpStatus.OK));
        } else {
            return async(() -> new ResponseEntity<>(HttpStatus.BAD_REQUEST));
        }
    }

    @PostMapping(path = "/prod/educationalsubject/all",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<StatisticsMeta<?>>> getEducationalSubjectDistribution(
        @RequestBody EducationalSubjectTotalRequest educationalSubjectTotalRequest) {
        return async(() -> new ResponseEntity<>(this.statisticsService.getEducationalSubjectDistribution(
            educationalSubjectTotalRequest), HttpStatus.OK));
    }

    @PostMapping(path = "/prod/organization/all",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<StatisticsMeta<?>>> getOrganizationDistribution(
        @RequestBody OrganizationTotalRequest organizationTotalRequest) {
        return async(() -> new ResponseEntity<>(this.statisticsService.getOrganizationDistribution(
            organizationTotalRequest), HttpStatus.OK));
    }

    @PostMapping(path = "/prod/materialactivity/{interval}/total",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<StatisticsMeta<?>>> getMaterialActivityTotalByInterval(
        @PathVariable(value = "interval") Interval interval,
        @RequestBody IntervalTotalRequest intervalTotalRequest) {
        return async(() -> new ResponseEntity<>(this.timeSeriesService.getTotalByInterval(
            interval,
            intervalTotalRequest,
            MaterialActivityDocument.class), HttpStatus.OK));
    }

    @PostMapping(path = "/prod/searchrequests/{interval}/total",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<StatisticsMeta<?>>> getSearchRequestsTotalByInterval(
        @PathVariable(value = "interval") Interval interval,
        @RequestBody IntervalTotalRequest intervalTotalRequest) {
        return async(() -> new ResponseEntity<>(this.timeSeriesService.getTotalByInterval(
            interval,
            intervalTotalRequest,
            SearchRequestDocument.class), HttpStatus.OK));
    }
}
