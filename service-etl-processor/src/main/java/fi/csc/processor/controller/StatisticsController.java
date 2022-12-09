package fi.csc.processor.controller;

import fi.csc.processor.enumeration.Interval;
import fi.csc.processor.enumeration.TargetEnv;
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

    @PostMapping(path = "/{target}/educationallevel/all",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<StatisticsMeta<?>>> getEducationalLevelDistribution(
        @PathVariable(value = "target") TargetEnv targetEnv,
        @RequestBody EducationalLevelTotalRequest educationalLevelTotalRequest) {
        return async(() -> new ResponseEntity<>(this.statisticsService.getEducationalLevelDistribution(
            educationalLevelTotalRequest, targetEnv), HttpStatus.OK));
    }

    @PostMapping(path = "/{target}/educationallevel/expired",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<StatisticsMeta<?>>> getEducationalLevelExpired(
        @PathVariable(value = "target") TargetEnv targetEnv,
        @RequestBody EducationalLevelTotalRequest educationalLevelTotalRequest) {
        if (educationalLevelTotalRequest.getExpiredBefore() != null) {
            return async(() -> new ResponseEntity<>(this.statisticsService.getEducationalLevelExpired(
                educationalLevelTotalRequest, targetEnv), HttpStatus.OK));
        } else {
            return async(() -> new ResponseEntity<>(HttpStatus.BAD_REQUEST));
        }
    }

    @PostMapping(path = "/{target}/educationalsubject/all",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<StatisticsMeta<?>>> getEducationalSubjectDistribution(
        @PathVariable(value = "target") TargetEnv targetEnv,
        @RequestBody EducationalSubjectTotalRequest educationalSubjectTotalRequest) {
        return async(() -> new ResponseEntity<>(this.statisticsService.getEducationalSubjectDistribution(
            educationalSubjectTotalRequest, targetEnv), HttpStatus.OK));
    }

    @PostMapping(path = "/{target}/organization/all",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<StatisticsMeta<?>>> getOrganizationDistribution(
        @PathVariable(value = "target") TargetEnv targetEnv,
        @RequestBody OrganizationTotalRequest organizationTotalRequest) {
        return async(() -> new ResponseEntity<>(this.statisticsService.getOrganizationDistribution(
            organizationTotalRequest, targetEnv), HttpStatus.OK));
    }

    @PostMapping(path = "/{target}/materialactivity/{interval}/total",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<StatisticsMeta<?>>> getMaterialActivityTotalByInterval(
        @PathVariable(value = "target") TargetEnv targetEnv,
        @PathVariable(value = "interval") Interval interval,
        @RequestBody IntervalTotalRequest intervalTotalRequest) {
        return async(() -> new ResponseEntity<>(this.timeSeriesService.getTotalByInterval(
            interval,
            intervalTotalRequest,
            MaterialActivityDocument.class,
            targetEnv), HttpStatus.OK));
    }

    @PostMapping(path = "/{target}/searchrequests/{interval}/total",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<StatisticsMeta<?>>> getSearchRequestsTotalByInterval(
        @PathVariable(value = "target") TargetEnv targetEnv,
        @PathVariable(value = "interval") Interval interval,
        @RequestBody IntervalTotalRequest intervalTotalRequest) {
        return async(() -> new ResponseEntity<>(this.timeSeriesService.getTotalByInterval(
            interval,
            intervalTotalRequest,
            SearchRequestDocument.class,
            targetEnv), HttpStatus.OK));
    }
}
