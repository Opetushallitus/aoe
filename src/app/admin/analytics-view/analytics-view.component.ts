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
    PortionResponse,
    IntervalResponse,
} from '../model';
import { ToastrService } from 'ngx-toastr';
import { StatisticsService } from '../services/statistics.service';
import { KoodistoService } from '../services/koodisto.service';
import { Categories, Activities, Intervals } from '../model/enumeration/Categories';

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
    startDateString: string;
    endDateString: string;
    datesArray: string[] = [];
    echart: EChartsOption;
    userActivityChart: EChartsOption;
    expiredMaterialsChart: EChartsOption;
    materialTotalsChart: EChartsOption;
    activityOptions = [
        { name: Activities.VIEW },
        { name: Activities.EDIT },
        { name: Activities.DOWNLOAD },
        { name: Activities.SEARCH },
    ];
    intervals = [{ name: Intervals.DAY }, { name: Intervals.WEEK }, { name: Intervals.MONTH }];
    selectedInterval: Intervals;
    categories = [
        { name: 'Educational Levels', value: Categories.EDUCATIONAL_LEVEL },
        { name: 'Educational Subjects', value: Categories.EDUCATIONAL_SUBJECT },
        { name: 'Organizations', value: Categories.ORGANIZATION },
    ];
    category: Categories.EDUCATIONAL_LEVEL | Categories.EDUCATIONAL_SUBJECT | Categories.ORGANIZATION =
        Categories.EDUCATIONAL_LEVEL;
    publishedcategory: string = 'educationallevel';
    chartData: { name: string; value: number[] }[] = [];

    constructor(
        private formBuilder: FormBuilder,
        public koodistoService: KoodistoService,
        private statisticsService: StatisticsService,
        private toastr: ToastrService,
    ) {}

    ngOnInit(): void {
        this.userActivityForm = this.formBuilder.group({
            activity: this.formBuilder.control(null, [Validators.required]),
            interval: this.formBuilder.control(Intervals.DAY, [Validators.required]),
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
            category: this.formBuilder.control(this.categories[0].name, [Validators.required]),
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

    //Functions for published material requests -->
    //called when user changes selected category (educationalLevels | educationalSubjects | organizations)
    categoryChange(
        selectedCategory: Categories.EDUCATIONAL_LEVEL | Categories.EDUCATIONAL_SUBJECT | Categories.ORGANIZATION,
    ): void {
        this.category = selectedCategory ? selectedCategory : this.category;
    }

    //on submit get values from form elements and check validity
    onSubmitPublishedMaterials(): void {
        this.publishedSubmitted = true;
        let fieldValue: string[] = [];
        const startDateString: string = this.publishedStartDateCtrl.value
            ? this.statisticsService.dateToString(new Date(this.publishedStartDateCtrl.value), Intervals.DAY)
            : null;
        const endDateString: string = this.publishedEndDateCtrl.value
            ? this.statisticsService.dateToString(new Date(this.publishedEndDateCtrl.value), Intervals.DAY)
            : null;

        //get selected items of selected category and reset other category elements
        switch (this.category) {
            case Categories.EDUCATIONAL_LEVEL:
                fieldValue = this.publishedEducationalLevelsCtrl.value?.map(
                    (educationalLevel: EducationalLevel) => educationalLevel.key,
                );
                this.publishedMaterialsForm.get('publishedEducationalSubjects').reset();
                this.publishedMaterialsForm.get('publishedOrganizations').reset();
                break;
            case Categories.EDUCATIONAL_SUBJECT:
                fieldValue = this.publishedEducationalSubjectsCtrl.value?.map((subject: SubjectFilter) => subject.key);
                this.publishedMaterialsForm.get('publishedEducationalLevels').reset();
                this.publishedMaterialsForm.get('publishedOrganizations').reset();
                break;
            case Categories.ORGANIZATION:
                fieldValue = this.publishedOrganizationsCtrl.value?.map(
                    (organization: KeyValue<string, string>) => organization.key,
                );
                this.publishedMaterialsForm.get('publishedEducationalLevels').reset();
                this.publishedMaterialsForm.get('publishedEducationalSubjects').reset();
                break;
        }

        if (
            this.publishedMaterialsForm.valid &&
            (this.publishedEducationalLevelsCtrl.value?.length ||
                this.publishedEducationalSubjectsCtrl.value?.length ||
                this.publishedOrganizationsCtrl.value?.length)
        ) {
            const payload: StatisticsPortionsPost = {
                since: startDateString as string, //YYYY-MM-DD | null
                until: endDateString as string, //YYYY-MM-DD | null
                [this.category]: fieldValue as string[],
            };

            this.publishedcategory =
                this.category === Categories.EDUCATIONAL_LEVEL
                    ? 'educationallevel'
                    : this.category === Categories.EDUCATIONAL_SUBJECT
                    ? 'educationalsubject'
                    : this.category === Categories.ORGANIZATION
                    ? 'organization'
                    : this.publishedcategory;

            this.getCategoryNames().then((categoryItems) => {
                this.getPublishedMaterials(payload, this.publishedcategory, categoryItems).then((response) => {
                    this.materialTotalsChart = this.setOptions(
                        [{ name: 'Julkaisujen kokonaismäärä', value: response.total }],
                        response.portionNames,
                        'bar',
                    );
                });
            });
        } else {
            this.toastr.error('Form not valid');
        }
    }

    //mapping category items selected in form, return keys and values
    getCategoryNames(): Promise<{ key: string; value: string }[]> {
        let categoryItems: { key: string; value: string }[] = [];
        return new Promise((resolve, reject) => {
            switch (this.category) {
                case Categories.EDUCATIONAL_LEVEL:
                    categoryItems = this.publishedEducationalLevelsCtrl.value?.map(
                        (educationalLevel: { key: string; value: string }) => ({
                            key: educationalLevel.key,
                            value: educationalLevel.value,
                        }),
                    );
                    return resolve(categoryItems);
                case Categories.EDUCATIONAL_SUBJECT:
                    categoryItems = this.publishedEducationalSubjectsCtrl.value?.map(
                        (subjects: { key: string; value: string }) => ({ key: subjects.key, value: subjects.value }),
                    );
                    return resolve(categoryItems);
                case Categories.ORGANIZATION:
                    categoryItems = this.publishedOrganizationsCtrl.value?.map(
                        (organization: { key: string; value: string }) => ({
                            key: organization.key,
                            value: organization.value,
                        }),
                    );
                    return resolve(categoryItems);
                default:
                    reject();
            }
        });
    }

    //make a request of published materials with given payload and category
    //get names (values) of educational levels, subjects or organizations from categoryItems with response item keys
    //return an object with names and total values of published materials
    getPublishedMaterials(
        payload: StatisticsPortionsPost,
        category: string, //educationallevel | educationalsubject | organization
        categoryItems: { key: string; value: string }[],
    ): Promise<{ portionNames: string[]; total: number[] }> {
        const values: { portionNames: string[]; total: number[] } = { portionNames: [], total: [] };
        return new Promise((resolve, reject) => {
            this.statisticsService.getPublishedMaterials(payload, category).subscribe(
                (response: StatisticsPortionsResponse) => {
                    values.portionNames = response.values.map((item: PortionResponse) => {
                        for (let i = 0; i < categoryItems.length; i++) {
                            if (item.key == categoryItems[i].key) {
                                return categoryItems[i].value;
                            }
                        }
                        return item.key;
                    }) as string[];
                    values.total = response.values.map((item: PortionResponse) => item.value) as number[];
                    resolve(values);
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

    //Functions for getting expired materials -->
    //gets form element values, checks validity, creates payload
    onSubmitExpiredMaterials(): void {
        this.expiredSubmitted = true;
        const expiredBeforeDate: Date = new Date(this.expiredBeforeCtrl.value);
        const expiredBeforeString: string = this.statisticsService.dateToString(expiredBeforeDate, Intervals.DAY);

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

            this.getExpiredMaterials(payload, educationalLevelNames).then((response) => {
                this.expiredMaterialsChart = this.setOptions(
                    [{ name: 'Vanhentuneet', value: response.total }],
                    response.portionNames,
                    'bar',
                ) as EChartsOption;
            });
        } else {
            this.toastr.error('Form not valid');
        }
    }

    //make a request for expired materials with given payload
    //get educational level names with response keys
    //return an object with educational level names and total values of expired materials
    getExpiredMaterials(
        payload: StatisticsPortionsPost,
        educationalLevelNames: { key: string; value: string }[],
    ): Promise<{ portionNames: string[]; total: number[] }> {
        const values: { portionNames: string[]; total: number[] } = { portionNames: [], total: [] };
        return new Promise((resolve, reject) => {
            this.statisticsService.getExpiredMaterials(payload).subscribe(
                (response: StatisticsPortionsResponse) => {
                    values.portionNames = response.values.map((level: PortionResponse) => {
                        for (let i = 0; i < educationalLevelNames.length; i++) {
                            if (level.key == educationalLevelNames[i].key) {
                                return educationalLevelNames[i].value;
                            }
                        }
                        return level.key;
                    }) as string[];
                    values.total = response.values.map((value: PortionResponse) => value.value) as number[];
                    resolve(values);
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

    //Functions for getting user activity -->
    //creates an array of dates (datesArray) for chart's x-axis
    //goes through activity functions and creates the chart in setOptions() with chartData and datesArray
    onSubmitUserActivity(): void {
        this.submitted = true;
        this.selectedInterval = this.intervalCtrl.value as Intervals;
        this.startDateString = this.statisticsService.dateToString(this.startDateCtrl.value, Intervals.DAY);
        this.endDateString = this.statisticsService.dateToString(this.endDateCtrl.value, Intervals.DAY);

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

    //Activity functions check if activity is selected (Viewed | Downloaded | Edited | Searched)
    //creates a payload in createPayload()
    //makes reguest in getUserActivity()
    //sorts response values in sortValueArrays()
    //pushes data to chartData array
    getViewingData(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.activityCtrl.value.includes(Activities.VIEW)) {
                try {
                    const payload: StatisticsTimespanPost = this.createPayload(
                        this.startDateString,
                        this.endDateString,
                        'view',
                        'metadata',
                    );
                    this.getUserActivity(payload, this.selectedInterval, 'materialactivity')
                        .then((res) => this.sortValueArrays(res.dates, res.total))
                        .then((response) => this.chartData.push({ name: 'Katselumäärät', value: response }))
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
            if (this.activityCtrl.value.includes(Activities.DOWNLOAD)) {
                try {
                    const payload: StatisticsTimespanPost = this.createPayload(
                        this.startDateString,
                        this.endDateString,
                        'load',
                        'metadata',
                    );
                    this.getUserActivity(payload, this.selectedInterval, 'materialactivity')
                        .then((res) => this.sortValueArrays(res.dates, res.total))
                        .then((response) => this.chartData.push({ name: 'Latausmäärät', value: response }))
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
            if (this.activityCtrl.value.includes(Activities.EDIT)) {
                try {
                    const payload: StatisticsTimespanPost = this.createPayload(
                        this.startDateString,
                        this.endDateString,
                        'edit',
                        'metadata',
                    );
                    this.getUserActivity(payload, this.selectedInterval, 'materialactivity')
                        .then((res) => this.sortValueArrays(res.dates, res.total))
                        .then((response) => this.chartData.push({ name: 'Muokkausmäärät', value: response }))
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
            if (this.activityCtrl.value.includes(Activities.SEARCH)) {
                try {
                    const payload: StatisticsTimespanPost = this.createPayload(
                        this.startDateString,
                        this.endDateString,
                        null,
                        'filters',
                    );
                    this.getUserActivity(payload, this.selectedInterval, 'searchrequests')
                        .then((res) => this.sortValueArrays(res.dates, res.total))
                        .then((response) => this.chartData.push({ name: 'Hakumäärät', value: response }))
                        .then(() => resolve());
                } catch {
                    reject('Error in getSearchData()');
                }
            } else {
                resolve();
            }
        });
    }

    //creates a payload for activity requests
    createPayload(
        startDateString: string, //'YYYY-MM-DD'
        endDateString: string, //'YYYY-MM-DD'
        interaction: string, //view | load | edit | null
        filter: string, //metadata | filters
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

    //calls getIntervalTotals() and maps response depending on selected interval (day | week | month)
    getUserActivity(
        payload: StatisticsTimespanPost,
        interval: Intervals, //Intervals (day | week | month)
        activity: string, //materialactivity | searchrequests
    ): Promise<{ dates: string[]; total: number[] } | undefined> {
        return new Promise((resolve, reject) => {
            const values: { dates: string[]; total: number[] } = { dates: [], total: [] };
            this.statisticsService.getIntervalTotals(payload, interval, activity).subscribe(
                (response: StatisticsIntervalResponse) => {
                    switch (interval) {
                        case Intervals.DAY:
                            values.dates = response.values.map(
                                (value: IntervalResponse) =>
                                    value.year +
                                    '-' +
                                    String(value.month).padStart(2, '0') +
                                    '-' +
                                    String(value.day).padStart(2, '0'),
                            ) as string[];
                            values.total = response.values.map((value: IntervalResponse) => value.dayTotal) as number[];
                            resolve(values);
                            break;
                        case Intervals.WEEK:
                            values.dates = response.values.map(
                                (value: IntervalResponse) => value.year + '-' + String(value.week).padStart(2, '0'),
                            ) as string[];
                            values.total = response.values.map(
                                (value: IntervalResponse) => value.weekTotal,
                            ) as number[];
                            resolve(values);
                            break;
                        case Intervals.MONTH:
                            values.dates = response.values.map(
                                (value: IntervalResponse) => value.year + '-' + String(value.month).padStart(2, '0'),
                            ) as string[];
                            values.total = response.values.map(
                                (value: IntervalResponse) => value.monthTotal,
                            ) as number[];
                            resolve(values);
                            break;
                    }
                },
                (err) => {
                    this.toastr.error(err);
                    reject();
                },
                () => {
                    this.submitted = false;
                },
            );
        });
    }

    //sets values from total to right indexes in valueField based on datesArray
    sortValueArrays(dates: string[], total: number[]): number[] {
        const valueField: number[] = [];
        for (let i = 0; i < this.datesArray.length; i++) {
            for (let n = 0; n < dates.length; n++) {
                if (this.datesArray[i] == dates[n]) {
                    valueField.splice(i, 1, total[n]);
                    break;
                } else {
                    valueField.splice(i, 0, null);
                }
            }
        }
        return valueField;
    }

    //Echarts
    setOptions(data: { name: string; value: number[] }[], xAxisValues: string[], chartType: any): EChartsOption {
        const seriesData: EChartsOption['series'] = [];
        data.forEach((data: { name: string; value: number[] }) => {
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
