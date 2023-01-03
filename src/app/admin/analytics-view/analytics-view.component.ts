import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { KeyValue } from '@angular/common';
import {
    StatisticsTimespanPost,
    StatisticsPortionsPost,
    StatisticsIntervalResponse,
    StatisticsPortionsResponse,
    EducationalLevel,
    SubjectFilter,
} from '../model';
import { ToastrService } from 'ngx-toastr';
import { StatisticsService } from '../services/statistics.service';
import { KoodistoService } from '../services/koodisto.service';

@Component({
    selector: 'app-analytics-view',
    templateUrl: './analytics-view.component.html',
    styleUrls: ['./analytics-view.component.scss'],
})
export class AnalyticsViewComponent implements OnInit {
    searchesAndViewsForm: FormGroup;
    expiredMaterialsForm: FormGroup;
    materialTotalsForm: FormGroup;
    submitted: boolean;
    // startDate: Date;
    // endDate: Date;
    selectedInterval: string;
    datesArray: string[] = [];
    sortedSearchTotal: number[] = [];
    sortedViewingTotal: number[] = [];
    requestDates: string[];
    requestPortionNames: string[];
    requestsTotal: number[];
    echart: EChartsOption;
    searchesAndViewingChart: EChartsOption;
    expiredMaterialsChart: EChartsOption;
    intervals = [{ name: 'day' }, { name: 'week' }, { name: 'month' }];

    constructor(
        private formBuilder: FormBuilder,
        public koodistoService: KoodistoService,
        private statisticsService: StatisticsService,
        private toastr: ToastrService,
    ) {}

    ngOnInit(): void {
        this.searchesAndViewsForm = this.formBuilder.group({
            interval: this.formBuilder.control('day', [Validators.required]),
            startDate: this.formBuilder.control(new Date(new Date().setFullYear(new Date().getFullYear() - 1)), [
                Validators.required,
            ]),
            endDate: this.formBuilder.control(new Date(), [Validators.required]),
            organizations: this.formBuilder.control(null),
            educationalLevels: this.formBuilder.control(null),
            educationalSubjects: this.formBuilder.control(null),
        });
        this.expiredMaterialsForm = this.formBuilder.group({
            expiredBefore: this.formBuilder.control(new Date(), [Validators.required]),
            organizations: this.formBuilder.control(null),
            educationalLevels: this.formBuilder.control(null, [Validators.required]),
            educationalSubjects: this.formBuilder.control(null),
        });
        this.materialTotalsForm = this.formBuilder.group({
            startDate: this.formBuilder.control(null),
            endDate: this.formBuilder.control(null),
            organizations: this.formBuilder.control(null),
            educationalLevels: this.formBuilder.control(null),
            educationalSubjects: this.formBuilder.control(null),
        });
        this.koodistoService.updateOrganizations();
        this.koodistoService.updateEducationalLevels();
        this.koodistoService.updateSubjectFilters();
    }

    get intervalCtrl(): FormControl {
        return this.searchesAndViewsForm.get('interval') as FormControl;
    }
    get startDateCtrl(): FormControl {
        return this.searchesAndViewsForm.get('startDate') as FormControl;
    }
    get endDateCtrl(): FormControl {
        return this.searchesAndViewsForm.get('endDate') as FormControl;
    }
    get organizationsCtrl(): FormControl {
        return this.searchesAndViewsForm.get('organizations') as FormControl;
    }
    get educationalLevelsCtrl(): FormControl {
        return this.searchesAndViewsForm.get('educationalLevels') as FormControl;
    }
    get educationalSubjectsCtrl(): FormControl {
        return this.searchesAndViewsForm.get('educationalSubjects') as FormControl;
    }
    get expiredEducationalLevelsCtrl(): FormControl {
        return this.expiredMaterialsForm.get('educationalLevels') as FormControl;
    }
    get expiredBeforeCtrl(): FormControl {
        return this.expiredMaterialsForm.get('expiredBefore') as FormControl;
    }
    // get totalsStartDateCtrl(): FormControl {
    //     return this.materialTotalsForm.get('startDate') as FormControl;
    // }
    // get totalsEndDateCtrl(): FormControl {
    //     return this.materialTotalsForm.get('endDate') as FormControl;
    // }
    // get totalsOrganizationsCtrl(): FormControl {
    //     return this.materialTotalsForm.get('organizations') as FormControl;
    // }
    // get totalsEducationalLevelsCtrl(): FormControl {
    //     return this.materialTotalsForm.get('educationalLevels') as FormControl;
    // }
    // get totalsEducationalSubjectsCtrl(): FormControl {
    //     return this.materialTotalsForm.get('educationalSubjects') as FormControl;
    // }

    onSubmitExpiredMaterials(): void {
        this.submitted = true;
        const expiredBeforeDate: Date = new Date(this.expiredBeforeCtrl.value);
        const expiredBeforeString: string = this.statisticsService.dateToString(expiredBeforeDate, 'day');

        if (this.expiredMaterialsForm.valid) {
            const payload: StatisticsPortionsPost = {
                since: null as string, // 'YYYY-MM-DD'
                until: null as string, // 'YYYY-MM-DD'
                expiredBefore: expiredBeforeString as string,
                educationalLevels: this.expiredEducationalLevelsCtrl.value?.map(
                    (educationalLevel: EducationalLevel) => educationalLevel.key,
                ) as string[],
            };

            const educationalLevelNames: [{ key: string; value: string }] =
                this.expiredEducationalLevelsCtrl.value?.map((educationalLevel: EducationalLevel) => ({
                    key: educationalLevel.key,
                    value: educationalLevel.value,
                }));

            this.getExpiredMaterials(payload, educationalLevelNames).then((res) => {
                this.expiredMaterialsChart = this.setOptions(
                    [{ name: 'Vanhentuneet', value: this.requestsTotal }],
                    this.requestPortionNames,
                    'bar',
                ) as EChartsOption;
            });
        } else {
            this.toastr.error('Form not valid');
        }
    }

    onSubmitSearchesAndViews(): void {
        this.submitted = true;
        this.datesArray = [] as string[];
        this.sortedSearchTotal = [] as number[];
        this.sortedViewingTotal = [] as number[];
        this.selectedInterval = this.intervalCtrl.value as string;
        const startDate = this.startDateCtrl.value as Date;
        const endDate = this.endDateCtrl.value as Date;
        const startDateString: string = this.statisticsService.dateToString(startDate, 'day');
        const endDateString: string = this.statisticsService.dateToString(endDate, 'day');

        if (this.searchesAndViewsForm.valid) {
            const startDateCopy = new Date(startDate.getTime());
            this.datesArray = this.statisticsService.createArrayOfDates(
                startDateCopy,
                endDate,
                this.selectedInterval,
            ) as string[];

            const searchPayload: StatisticsTimespanPost = {
                since: startDateString as string, //'YYYY-MM-DD'
                until: endDateString as string, //'YYYY-MM-DD'
                filters: {
                    organizations: this.organizationsCtrl.value?.map(
                        (organization: KeyValue<string, string>) => organization.key,
                    ) as string[],
                    educationalLevels: this.educationalLevelsCtrl.value?.map(
                        (educationalLevel: EducationalLevel) => educationalLevel.key,
                    ) as string[],
                    educationalSubjects: this.educationalSubjectsCtrl.value?.map(
                        (subject: SubjectFilter) => subject.key,
                    ) as string[],
                },
            };

            const viewsPayload: StatisticsTimespanPost = {
                since: startDateString as string, //'YYYY-MM-DD'
                until: endDateString as string, //'YYYY-MM-DD'
                metadata: {
                    organizations: this.organizationsCtrl.value?.map(
                        (organization: KeyValue<string, string>) => organization.key,
                    ) as string[],
                    educationalLevels: this.educationalLevelsCtrl.value?.map(
                        (educationalLevel: EducationalLevel) => educationalLevel.key,
                    ) as string[],
                    educationalSubjects: this.educationalSubjectsCtrl.value?.map(
                        (subject: SubjectFilter) => subject.key,
                    ) as string[],
                },
            };

            this.getSearchesAndViews(searchPayload, 'searchrequests')
                .then(() => this.sortValueArrays(this.sortedSearchTotal))
                .then(() => {
                    this.getSearchesAndViews(viewsPayload, 'materialactivity')
                        .then(() => this.sortValueArrays(this.sortedViewingTotal))
                        .then(() => {
                            this.searchesAndViewingChart = this.setOptions(
                                [
                                    { name: 'Katselumäärät', value: this.sortedViewingTotal },
                                    { name: 'Hakumäärät', value: this.sortedSearchTotal },
                                ],
                                this.datesArray,
                                'line',
                            ) as EChartsOption;
                        });
                });
        } else {
            this.toastr.error('Form not valid');
        }
    }

    getExpiredMaterials(
        payload: StatisticsPortionsPost,
        educationalLevelNames: { key: string; value: string }[],
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            this.statisticsService.getExpiredMaterials(payload).subscribe(
                (response: StatisticsPortionsResponse) => {
                    this.requestPortionNames = response.values.map((value) => {
                        for (let i = 0; i < educationalLevelNames.length; i++) {
                            if (value.key == educationalLevelNames[i].key) {
                                return educationalLevelNames[i].value;
                            }
                        }
                        return value.key;
                    }) as string[];
                    this.requestsTotal = response.values.map((value) => value.value) as number[];
                    resolve();
                },
                (err) => {
                    this.toastr.error(err);
                    reject(err);
                },
                () => {
                    this.submitted = false;
                },
            );
        });
    }

    //does post request with given body and url parameter
    getSearchesAndViews(payload: StatisticsTimespanPost, activity: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.statisticsService.getIntervalTotals(payload, this.selectedInterval, activity).subscribe(
                (response: StatisticsIntervalResponse) => {
                    switch (this.selectedInterval) {
                        case 'day':
                            this.requestDates = response.values.map(
                                (value) =>
                                    value.year +
                                    '-' +
                                    String(value.month).padStart(2, '0') +
                                    '-' +
                                    String(value.day).padStart(2, '0'),
                            ) as string[];
                            this.requestsTotal = response.values.map((value) => value.dayTotal) as number[];
                            resolve();
                            break;
                        case 'week':
                            this.requestDates = response.values.map(
                                (value) => value.year + '-' + String(value.week).padStart(2, '0'),
                            ) as string[];
                            this.requestsTotal = response.values.map((value) => value.weekTotal) as number[];
                            resolve();
                            break;
                        case 'month':
                            this.requestDates = response.values.map(
                                (value) => value.year + '-' + String(value.month).padStart(2, '0'),
                            ) as string[];
                            this.requestsTotal = response.values.map((value) => value.monthTotal) as number[];
                            resolve();
                            break;
                    }
                },
                (err) => {
                    this.toastr.error(err);
                    reject(err);
                },
                () => {
                    this.submitted = false;
                },
            );
        });
    }

    //sets values from requestsTotal to right indexes in valueField based on xAxisDates
    sortValueArrays(valueField: number[]): void {
        for (let i = 0; i < this.datesArray.length; i++) {
            for (let n = 0; n < this.requestDates.length; n++) {
                if (this.datesArray[i] == this.requestDates[n]) {
                    valueField.splice(i, 1, this.requestsTotal[n]);
                    break;
                } else {
                    valueField.splice(i, 0, null);
                }
            }
        }
    }

    //Echarts
    setOptions(data: { name: string; value: number[] }[], xAxisValues: string[], chartType: any): EChartsOption {
        const seriesData: EChartsOption['series'] = [];
        data.forEach((data) => {
            seriesData.push({
                connectNulls: true,
                name: data.name,
                data: data.value,
                type: chartType,
            });
        });

        return (this.echart = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                },
            },
            toolbox: {
                show: true,
                feature: {
                    mark: { show: true },
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
                    saveAsImage: { show: true },
                },
            },
            legend: {
                data: data,
            },
            grid: {
                bottom: 100,
            },
            xAxis: {
                type: 'category',
                data: xAxisValues,
                axisLabel: {
                    show: true,
                    rotate: 45,
                },
            },
            yAxis: {
                type: 'value',
            },
            dataZoom: [
                {
                    show: true,
                    start: 0,
                    end: 100,
                },
                {
                    type: 'inside',
                    start: 0,
                    end: 100,
                },
            ],
            series: seriesData,
        });
    }
}
