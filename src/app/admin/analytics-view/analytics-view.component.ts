import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
    userActivityForm: FormGroup;
    expiredMaterialsForm: FormGroup;
    publishedMaterialsForm: FormGroup;
    submitted: boolean;
    publishedSubmitted: boolean;
    expiredSubmitted: boolean;
    selectedInterval: string;
    startDateString: string;
    endDateString: string;
    datesArray: string[] = [];
    sortedSearchTotal: number[] = [];
    sortedViewingTotal: number[] = [];
    sortedEditTotal: number[] = [];
    sortedLoadTotal: number[] = [];
    requestDates: string[];
    requestPortionNames: string[];
    requestsTotal: number[];
    echart: EChartsOption;
    userActivityChart: EChartsOption;
    expiredMaterialsChart: EChartsOption;
    materialTotalsChart: EChartsOption;
    activityOptions = [{ name: 'Viewed' }, { name: 'Edited' }, { name: 'Downloaded' }, { name: 'Searched' }];
    intervals = [{ name: 'day' }, { name: 'week' }, { name: 'month' }];
    categories = [{ name: 'educational levels' }, { name: 'educational subjects' }, { name: 'organizations' }];
    category: 'educational levels' | 'educational subjects' | 'organizations' = 'educational levels';
    publishedcategory: string = 'educationallevel';
    chartData: { name: string; value: number[] }[] = [];
    categoryNames: { key: string; value: string }[];

    constructor(
        private formBuilder: FormBuilder,
        public koodistoService: KoodistoService,
        private statisticsService: StatisticsService,
        private toastr: ToastrService,
    ) {}

    ngOnInit(): void {
        this.userActivityForm = this.formBuilder.group({
            activity: this.formBuilder.control(null, [Validators.required]),
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
        this.publishedMaterialsForm = this.formBuilder.group({
            category: this.formBuilder.control('educational levels', [Validators.required]),
            publishedStartDate: this.formBuilder.control(
                new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
            ),
            publishedEndDate: this.formBuilder.control(new Date()),
            publishedOrganizations: this.formBuilder.control(null),
            publishedEducationalLevels: this.formBuilder.control(null),
            publishedEducationalSubjects: this.formBuilder.control(null),
        });
    }
    get activityCtrl(): FormControl {
        return this.userActivityForm.get('activity') as FormControl;
    }
    get intervalCtrl(): FormControl {
        return this.userActivityForm.get('interval') as FormControl;
    }
    get startDateCtrl(): FormControl {
        return this.userActivityForm.get('startDate') as FormControl;
    }
    get endDateCtrl(): FormControl {
        return this.userActivityForm.get('endDate') as FormControl;
    }
    get organizationsCtrl(): FormControl {
        return this.userActivityForm.get('organizations') as FormControl;
    }
    get educationalLevelsCtrl(): FormControl {
        return this.userActivityForm.get('educationalLevels') as FormControl;
    }
    get educationalSubjectsCtrl(): FormControl {
        return this.userActivityForm.get('educationalSubjects') as FormControl;
    }
    get expiredEducationalLevelsCtrl(): FormControl {
        return this.expiredMaterialsForm.get('educationalLevels') as FormControl;
    }
    get expiredBeforeCtrl(): FormControl {
        return this.expiredMaterialsForm.get('expiredBefore') as FormControl;
    }
    get publishedCategoryCtrl(): FormControl {
        return this.publishedMaterialsForm.get('category') as FormControl;
    }
    get publishedStartDateCtrl(): FormControl {
        return this.publishedMaterialsForm.get('publishedStartDate') as FormControl;
    }
    get publishedEndDateCtrl(): FormControl {
        return this.publishedMaterialsForm.get('publishedEndDate') as FormControl;
    }
    get publishedOrganizationsCtrl(): FormControl {
        return this.publishedMaterialsForm.get('publishedOrganizations') as FormControl;
    }
    get publishedEducationalLevelsCtrl(): FormControl {
        return this.publishedMaterialsForm.get('publishedEducationalLevels') as FormControl;
    }
    get publishedEducationalSubjectsCtrl(): FormControl {
        return this.publishedMaterialsForm.get('publishedEducationalSubjects') as FormControl;
    }

    categoryChange(selectedCategory: { name: 'educational levels' | 'educational subjects' | 'organizations' }): void {
        if (selectedCategory) {
            this.category = selectedCategory.name;
            this.publishedcategory =
                selectedCategory.name === 'educational levels' ? 'educationallevel' : this.publishedcategory;
            this.publishedcategory =
                selectedCategory.name === 'educational subjects' ? 'educationalsubject' : this.publishedcategory;
            this.publishedcategory =
                selectedCategory.name === 'organizations' ? 'organization' : this.publishedcategory;
        }
    }

    onSubmitPublishedMaterials(): void {
        this.publishedSubmitted = true;
        let field: string;
        let fieldValue: string[] = [];
        const startDateString: string = this.publishedStartDateCtrl.value
            ? this.statisticsService.dateToString(new Date(this.publishedStartDateCtrl.value), 'day')
            : null;
        const endDateString: string = this.publishedEndDateCtrl.value
            ? this.statisticsService.dateToString(new Date(this.publishedEndDateCtrl.value), 'day')
            : null;

        switch (this.category) {
            case 'educational levels':
                field = 'educationalLevels';
                fieldValue = this.publishedEducationalLevelsCtrl.value?.map(
                    (educationalLevel: EducationalLevel) => educationalLevel.key,
                );
                this.publishedMaterialsForm.get('publishedEducationalSubjects').reset();
                this.publishedMaterialsForm.get('publishedOrganizations').reset();
                break;
            case 'educational subjects':
                field = 'educationalSubjects';
                fieldValue = this.publishedEducationalSubjectsCtrl.value?.map((subject: SubjectFilter) => subject.key);
                this.publishedMaterialsForm.get('publishedEducationalLevels').reset();
                this.publishedMaterialsForm.get('publishedOrganizations').reset();
                break;
            case 'organizations':
                field = 'organizations';
                fieldValue = this.publishedOrganizationsCtrl.value?.map(
                    (organization: KeyValue<string, string>) => organization.key,
                );
                this.publishedMaterialsForm.get('publishedEducationalLevels').reset();
                this.publishedMaterialsForm.get('publishedEducationalSubjects').reset();
                break;
        }
        if (
            this.publishedMaterialsForm.valid &&
            ((this.publishedEducationalLevelsCtrl.value && this.publishedEducationalLevelsCtrl.value.length) ||
                (this.publishedEducationalSubjectsCtrl.value && this.publishedEducationalSubjectsCtrl.value.length) ||
                (this.publishedOrganizationsCtrl.value && this.publishedOrganizationsCtrl.value.length))
        ) {
            const payload: StatisticsPortionsPost = {
                since: startDateString as string, //YYYY-MM-DD | null
                until: endDateString as string, //YYYY-MM-DD | null
                [field]: fieldValue as string[],
            };

            this.getCategoryNames().then(() => {
                this.getPublishedMaterials(payload, this.publishedcategory).then(() => {
                    this.materialTotalsChart = this.setOptions(
                        [{ name: 'Julkaisujen kokonaismäärä', value: this.requestsTotal }],
                        this.requestPortionNames,
                        'bar',
                    );
                });
            });
        } else {
            this.toastr.error('Form not valid');
        }
    }

    getCategoryNames(): Promise<void> {
        return new Promise((resolve) => {
            switch (this.category) {
                case 'educational levels':
                    this.categoryNames = this.publishedEducationalLevelsCtrl.value?.map(
                        (educationalLevel: { key: string; value: string }) => ({
                            key: educationalLevel.key,
                            value: educationalLevel.value,
                        }),
                    );
                    return resolve();
                case 'educational subjects':
                    this.categoryNames = this.publishedEducationalSubjectsCtrl.value?.map(
                        (subjects: { key: string; value: string }) => ({ key: subjects.key, value: subjects.value }),
                    );
                    return resolve();
                case 'organizations':
                    this.categoryNames = this.publishedOrganizationsCtrl.value?.map(
                        (organization: { key: string; value: string }) => ({
                            key: organization.key,
                            value: organization.value,
                        }),
                    );
                    return resolve();
            }
        });
    }

    getPublishedMaterials(payload: StatisticsPortionsPost, subject: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.statisticsService.getPublishedMaterials(payload, subject).subscribe(
                (response: StatisticsPortionsResponse) => {
                    this.requestPortionNames = response.values.map((value) => {
                        for (let i = 0; i < this.categoryNames.length; i++) {
                            if (value.key == this.categoryNames[i].key) {
                                return this.categoryNames[i].value;
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
                    this.publishedSubmitted = false;
                },
            );
        });
    }

    createPayload(
        startDateString: string,
        endDateString: string,
        interaction: string,
        filter: string,
    ): StatisticsTimespanPost {
        return {
            since: startDateString, //'YYYY-MM-DD'
            until: endDateString, //'YYYY-MM-DD'
            interaction: interaction,
            [filter]: {
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
        } as StatisticsTimespanPost;
    }

    getViewingData(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.activityCtrl.value.includes('Viewed')) {
                try {
                    const payload: StatisticsTimespanPost = this.createPayload(
                        this.startDateString,
                        this.endDateString,
                        'view',
                        'metadata',
                    );
                    this.getUserActivity(payload, 'materialactivity')
                        .then(() => this.sortValueArrays(this.sortedViewingTotal))
                        .then(() => this.chartData.push({ name: 'Katselumäärät', value: this.sortedViewingTotal }))
                        .then(() => resolve());
                } catch {
                    reject('Error in getViewingData()');
                }
            } else {
                resolve();
            }
        });
    }

    getDownloadData(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.activityCtrl.value.includes('Downloaded')) {
                try {
                    const payload: StatisticsTimespanPost = this.createPayload(
                        this.startDateString,
                        this.endDateString,
                        'load',
                        'metadata',
                    );
                    this.getUserActivity(payload, 'materialactivity')
                        .then(() => {
                            this.sortValueArrays(this.sortedLoadTotal);
                        })
                        .then(() => this.chartData.push({ name: 'Latausmäärät', value: this.sortedLoadTotal }))
                        .then(() => resolve());
                } catch {
                    reject('Error in getDownloadData()');
                }
            } else {
                resolve();
            }
        });
    }
    getEditData(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.activityCtrl.value.includes('Edited')) {
                try {
                    const payload: StatisticsTimespanPost = this.createPayload(
                        this.startDateString,
                        this.endDateString,
                        'edit',
                        'metadata',
                    );
                    this.getUserActivity(payload, 'materialactivity')
                        .then(() => {
                            this.sortValueArrays(this.sortedEditTotal);
                        })
                        .then(() => this.chartData.push({ name: 'Muokkausmäärät', value: this.sortedEditTotal }))
                        .then(() => resolve());
                } catch {
                    reject('Error in getEditData()');
                }
            } else {
                resolve();
            }
        });
    }

    getSearchData(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.activityCtrl.value.includes('Searched')) {
                try {
                    const payload: StatisticsTimespanPost = this.createPayload(
                        this.startDateString,
                        this.endDateString,
                        null,
                        'filters',
                    );
                    this.getUserActivity(payload, 'searchrequests')
                        .then(() => this.sortValueArrays(this.sortedSearchTotal))
                        .then(() => this.chartData.push({ name: 'Hakumäärät', value: this.sortedSearchTotal }))
                        .then(() => resolve());
                } catch {
                    reject('Error in getSearchData()');
                }
            } else {
                resolve();
            }
        });
    }

    onSubmitUserActivity(): void {
        this.submitted = true;
        this.sortedSearchTotal = [] as number[];
        this.sortedViewingTotal = [] as number[];
        this.sortedEditTotal = [] as number[];
        this.sortedLoadTotal = [] as number[];
        this.selectedInterval = this.intervalCtrl.value as string;
        this.startDateString = this.statisticsService.dateToString(this.startDateCtrl.value, 'day');
        this.endDateString = this.statisticsService.dateToString(this.endDateCtrl.value, 'day');

        if (this.userActivityForm.valid) {
            this.chartData = [];
            const startDate = new Date(this.startDateCtrl.value.getTime());
            this.datesArray = [] as string[];
            this.datesArray = this.statisticsService.createArrayOfDates(
                startDate as Date,
                this.endDateCtrl.value as Date,
                this.selectedInterval,
            ) as string[];

            Promise.all([this.getViewingData(), this.getSearchData(), this.getDownloadData(), this.getEditData()]).then(
                () => {
                    this.userActivityChart = this.setOptions(this.chartData, this.datesArray, 'line') as EChartsOption;
                },
            );
        } else {
            this.toastr.error('Form not valid');
        }
    }

    onSubmitExpiredMaterials(): void {
        this.expiredSubmitted = true;
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

            this.getExpiredMaterials(payload, educationalLevelNames).then(() => {
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
                    this.expiredSubmitted = false;
                },
            );
        });
    }

    getUserActivity(payload: StatisticsTimespanPost, activity: string): Promise<void> {
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
