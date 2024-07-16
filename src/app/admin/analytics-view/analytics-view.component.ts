import { Component, OnInit } from '@angular/core';
import {
  DataZoomComponentOption,
  EChartsOption,
  GridComponentOption,
  LegendComponentOption,
  ToolboxComponentOption,
  TooltipComponentOption,
  YAXisComponentOption,
} from 'echarts';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { KeyValue } from '@angular/common';
import {
  ActivityData,
  EChartData,
  EducationalLevel,
  IntervalResponse,
  PortionResponse,
  StatisticsIntervalResponse,
  StatisticsPortionsPost,
  StatisticsPortionsResponse,
  StatisticsTimespanPost,
  SubjectFilter,
} from '../model';
import { ToastrService } from 'ngx-toastr';
import { StatisticsService } from '../services/statistics.service';
import { KoodistoService } from '../services/koodisto.service';
import { ActivityType, CategoryType, IntervalType } from '../model/enumeration/CategoryType';
import { Observable } from 'rxjs';
import { ActivityOptions, Interval } from '@admin/model/statistics-select-options';

@Component({
  selector: 'app-analytics-view',
  templateUrl: './analytics-view.component.html',
  styleUrls: ['./analytics-view.component.scss'],
})
export class AnalyticsViewComponent implements OnInit {
  educationalLevels$: Observable<EducationalLevel[]> = this.koodistoService.educationalLevels$;
  organizations$: Observable<KeyValue<string, string>[]> = this.koodistoService.organizations$;
  subjectFilter$: Observable<SubjectFilter[]> = this.koodistoService.subjectFilters$;

  activityForm: FormGroup;
  expiredMaterialsForm: FormGroup;
  today: Date;
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
  activityOptions: ActivityOptions[] = [
    { key: ActivityType.EDIT, value: 'edit', label: { fi: 'Muokkaus', sv: '', en: '' } },
    { key: ActivityType.DOWNLOAD, value: 'download', label: { fi: 'Lataus', sv: '', en: '' } },
    { key: ActivityType.SEARCH, value: 'search', label: { fi: 'Haku', sv: '', en: '' } },
    { key: ActivityType.VIEW, value: 'view', label: { fi: 'Katselu', sv: '', en: '' } },
  ];
  intervals: Interval[] = [
    { key: IntervalType.DAY, value: 'day', label: { fi: 'Päivä', sv: '', en: '' } },
    { key: IntervalType.WEEK, value: 'week', label: { fi: 'Viikko', sv: '', en: '' } },
    { key: IntervalType.MONTH, value: 'month', label: { fi: 'Kuukausi', sv: '', en: '' } },
  ];
  categories = [
    { name: 'Educational Levels', value: CategoryType.EDUCATIONAL_LEVEL },
    { name: 'Educational Subjects', value: CategoryType.EDUCATIONAL_SUBJECT },
    { name: 'Organizations', value: CategoryType.ORGANIZATION },
  ];
  category: CategoryType = CategoryType.EDUCATIONAL_LEVEL;
  publishedcategory: 'educationallevel' | 'educationalsubject' | 'organization' = 'educationallevel';
  chartData: { name: string; value: number[] }[] = [];

  constructor(
    private fb: FormBuilder,
    public koodistoService: KoodistoService,
    private statisticsService: StatisticsService,
    private toastr: ToastrService,
  ) {
    this.today = new Date();
  }

  ngOnInit(): void {
    this.koodistoService.updateOrganizations();
    this.koodistoService.updateEducationalLevels();
    this.koodistoService.updateSubjectFilters();
    this.activityForm = this.fb.group({
      activity: [null, [Validators.required]],
      interval: [null, [Validators.required]],
      dateSince: [this.getDateYearAgo(this.today), [Validators.required]],
      dateUntil: [this.today, [Validators.required]],
      organizations: [null],
      educationalLevels: [null],
      educationalSubjects: [null],
    });
    this.expiredMaterialsForm = this.fb.group({
      expiredBefore: this.fb.control(new Date(), [Validators.required]),
      organizations: this.fb.control(null),
      educationalLevels: this.fb.control(null, [Validators.required]),
      educationalSubjects: this.fb.control(null),
    });
    this.publishedMaterialsForm = this.fb.group({
      category: this.fb.control(this.categories[0].name, [Validators.required]),
      publishedStartDate: this.fb.control(new Date(new Date().setFullYear(new Date().getFullYear() - 1))),
      publishedEndDate: this.fb.control(new Date()),
      publishedOrganizations: this.fb.control(null),
      publishedEducationalLevels: this.fb.control(null),
      publishedEducationalSubjects: this.fb.control(null),
    });
  }

  getDatestamp(date: Date): string {
    const dateCopy: Date = new Date(date);
    const year: number = dateCopy.getFullYear();
    const month: string = ('0' + (dateCopy.getMonth() + 1)).slice(-2);
    const day: string = ('0' + dateCopy.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  getDateYearAgo(date: Date): Date {
    const dateCopy: Date = new Date(date);
    dateCopy.setFullYear(dateCopy.getFullYear() - 1);
    return dateCopy;
  }

  get activityCtrl(): FormControl {
    return this.activityForm.get('activity') as FormControl;
  }

  get intervalCtrl(): FormControl {
    return this.activityForm.get('interval') as FormControl;
  }

  get dateSinceCtrl(): FormControl {
    return this.activityForm.get('dateSince') as FormControl;
  }

  get dateUntilCtrl(): FormControl {
    return this.activityForm.get('dateUntil') as FormControl;
  }

  get organizationsCtrl(): FormControl {
    return this.activityForm.get('organizations') as FormControl;
  }

  get educationalLevelsCtrl(): FormControl {
    return this.activityForm.get('educationalLevels') as FormControl;
  }

  get educationalSubjectsCtrl(): FormControl {
    return this.activityForm.get('educationalSubjects') as FormControl;
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

  onReset(event: Event): void {
    event.preventDefault();
    this.activityForm.reset({
      dateSince: this.getDateYearAgo(this.today),
      dateUntil: this.today,
    });
    (event.target as HTMLElement).blur();
  }

  /**
   * Changes selected category in Published materials form.
   * @param {CategoryType} selectedCategory User selected category from dropdown
   */
  categoryChange(selectedCategory: CategoryType): void {
    this.category = selectedCategory ? selectedCategory : this.category;
  }

  /**
   * Submits published material form, gets values from form elements and checks validity.
   */
  onSubmitPublishedMaterials(): void {
    this.publishedSubmitted = true;
    let fieldValue: string[] = [];
    const startDateString: string = this.publishedStartDateCtrl.value
      ? this.statisticsService.dateToString(new Date(this.publishedStartDateCtrl.value), 'day')
      : null;
    const endDateString: string = this.publishedEndDateCtrl.value
      ? this.statisticsService.dateToString(new Date(this.publishedEndDateCtrl.value), 'day')
      : null;
    switch (this.category) {
      case CategoryType.EDUCATIONAL_LEVEL:
        fieldValue = this.publishedEducationalLevelsCtrl.value?.map(
          (educationalLevel: EducationalLevel) => educationalLevel.key,
        );
        this.publishedMaterialsForm.get('publishedEducationalSubjects').reset();
        this.publishedMaterialsForm.get('publishedOrganizations').reset();
        break;
      case CategoryType.EDUCATIONAL_SUBJECT:
        fieldValue = this.publishedEducationalSubjectsCtrl.value?.map((subject: SubjectFilter) => subject.key);
        this.publishedMaterialsForm.get('publishedEducationalLevels').reset();
        this.publishedMaterialsForm.get('publishedOrganizations').reset();
        break;
      case CategoryType.ORGANIZATION:
        fieldValue = this.publishedOrganizationsCtrl.value?.map(
          (organization: KeyValue<string, string>) => organization.key,
        );
        this.publishedMaterialsForm.get('publishedEducationalLevels').reset();
        this.publishedMaterialsForm.get('publishedEducationalSubjects').reset();
        break;
      default:
        this.publishedMaterialsForm.get('publishedEducationalLevels').reset();
        this.publishedMaterialsForm.get('publishedEducationalSubjects').reset();
        this.publishedMaterialsForm.get('publishedOrganizations').reset();
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
        this.category === CategoryType.EDUCATIONAL_LEVEL
          ? 'educationallevel'
          : this.category === CategoryType.EDUCATIONAL_SUBJECT
          ? 'educationalsubject'
          : this.category === CategoryType.ORGANIZATION
          ? 'organization'
          : this.publishedcategory;
      this.getCategoryNames()
        .then((categoryItems: { key: string; value: string }[]) => {
          this.getPublishedMaterials(payload, this.publishedcategory, categoryItems).then(
            (response: { portionNames: string[]; total: number[] }) => {
              this.materialTotalsChart = this.setOptions(
                [{ name: 'Julkaisujen kokonaismäärä', value: response.total }],
                response.portionNames,
                'bar',
              );
            },
          );
        })
        .catch((error) => console.error(error));
    } else {
      this.toastr.error('Form not valid');
    }
  }

  /**
   * Maps category items selected in form.
   * @returns {{ key: string; value: string }[]} An array of selected categories with keys and values.
   */
  getCategoryNames(): Promise<{ key: string; value: string }[]> {
    let categoryItems: { key: string; value: string }[] = [];
    return new Promise((resolve, reject) => {
      switch (this.category) {
        case CategoryType.EDUCATIONAL_LEVEL:
          categoryItems = this.publishedEducationalLevelsCtrl.value?.map(
            (educationalLevel: { key: string; value: string }) => ({
              key: educationalLevel.key,
              value: educationalLevel.value,
            }),
          );
          return resolve(categoryItems);
        case CategoryType.EDUCATIONAL_SUBJECT:
          categoryItems = this.publishedEducationalSubjectsCtrl.value?.map(
            (subjects: { key: string; value: string }) => ({ key: subjects.key, value: subjects.value }),
          );
          return resolve(categoryItems);
        case CategoryType.ORGANIZATION:
          categoryItems = this.publishedOrganizationsCtrl.value?.map(
            (organization: { key: string; value: string }) => ({
              key: organization.key,
              value: organization.value,
            }),
          );
          return resolve(categoryItems);
        default:
          reject(new Error('Unknown category'));
      }
    });
  }

  /**
   * Make a request of published materials with given payload and category.
   * @param {StatisticsPortionsPost} payload Request body.
   * @param { 'educationallevel' | 'educationalsubject' | 'organization' } category Category for request URL.
   * @param {{ key: string; value: string }[]} categoryItems An array of selected categories with keys and values.
   * @returns { portionNames: string[]; total: number[] } Names of categories and their values as arrays.
   */
  getPublishedMaterials(
    payload: StatisticsPortionsPost,
    category: 'educationallevel' | 'educationalsubject' | 'organization',
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

  /**
   * Gets form elements' values, checks validity, creates a payload for request.
   */
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
      const educationalLevelNames: [{ key: string; value: string }] = this.expiredEducationalLevelsCtrl.value?.map(
        (educationalLevel: EducationalLevel) => ({
          key: educationalLevel.key,
          value: educationalLevel.value,
        }),
      );
      this.getExpiredMaterials(payload, educationalLevelNames).then(
        (response: { portionNames: string[]; total: number[] }) => {
          this.expiredMaterialsChart = this.setOptions(
            [{ name: 'Vanhentuneet', value: response.total }],
            response.portionNames,
            'bar',
          ) as EChartsOption;
        },
      );
    } else {
      this.toastr.error('Form not valid');
    }
  }

  /**
   * Make a request for expired materials with given payload.
   * @param {StatisticsPortionsPost} payload Request body.
   * @param {{ key: string; value: string }[]} educationalLevelNames Selected educational levels.
   * @returns { portionNames: string[]; total: number[] } An object with educational level names and total values.
   */
  getExpiredMaterials(
    payload: StatisticsPortionsPost,
    educationalLevelNames: { key: string; value: string }[],
  ): Promise<{ portionNames: string[]; total: number[] }> {
    const values: { portionNames: string[]; total: number[] } = { portionNames: [], total: [] };
    return new Promise((resolve, reject): void => {
      this.statisticsService.getExpiredMaterials(payload).subscribe(
        (response: StatisticsPortionsResponse) => {
          values.portionNames = response.values.map((level: PortionResponse): string => {
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
        (err): void => {
          this.toastr.error(err);
          reject(err);
        },
        (): void => {
          this.expiredSubmitted = false;
        },
      );
    });
  }

  /**
   * Checks form validity, creates an array of dates and calls activity functions to get chart data.
   */
  onSubmitUserActivity(): void {
    this.submitted = true;

    if (this.activityForm.valid) {
      this.chartData = [];
      this.datesArray = [] as string[];
      this.datesArray = this.statisticsService.createArrayOfDates(
        this.dateSinceCtrl.value as Date,
        this.dateUntilCtrl.value as Date,
        this.intervalCtrl.value as string,
      ) as string[];

      Promise.all([this.getViewingData(), this.getSearchData(), this.getDownloadData(), this.getEditData()]).then(
        (response: EChartData[]): void => {
          this.chartData = response.filter((n: EChartData) => n);
          this.userActivityChart = this.setOptions(this.chartData, this.datesArray, 'line') as EChartsOption;
        },
      );
    } else {
      this.toastr.error('Form not valid');
    }
  }

  /**
   * Calls functions to create a payload, make a request and sort the response.
   * @returns { EChartData } Total of viewed materials.
   */
  async getViewingData(): Promise<EChartData> {
    try {
      const payload: StatisticsTimespanPost = this.createPayload(
        this.getDatestamp(this.dateSinceCtrl.value),
        this.getDatestamp(this.dateUntilCtrl.value),
        this.activityCtrl.value,
        'metadata',
      );
      const viewingData: ActivityData = await this.getUserActivity(
        payload,
        this.intervalCtrl.value,
        'materialactivity',
      );
      const sortedData: number[] = this.sortValueArrays(viewingData.dates, viewingData.total);
      return { name: 'Katselumäärät', value: sortedData };
    } catch (error) {
      throw Error(error);
    }
  }

  /**
   * Calls functions to create a payload, make a request and sort the response.
   * @returns { EChartData } Total of downloaded materials.
   */
  async getDownloadData(): Promise<EChartData> {
    if (this.activityCtrl.value.includes(ActivityType.DOWNLOAD)) {
      try {
        const payload: StatisticsTimespanPost = this.createPayload(
          this.startDateString,
          this.endDateString,
          'load',
          'metadata',
        );

        const downloadData: ActivityData = await this.getUserActivity(
          payload,
          this.intervalCtrl.value,
          'materialactivity',
        );
        const sortedData: number[] = this.sortValueArrays(downloadData.dates, downloadData.total);
        return { name: 'Latausmäärät', value: sortedData };
      } catch (error) {
        throw Error(error);
      }
    }
  }

  /**
   * Calls functions to create a payload, make a request and sort the response.
   * @returns { EChartData } Total of edited materials.
   */
  async getEditData(): Promise<EChartData> {
    if (this.activityCtrl.value.includes(ActivityType.EDIT)) {
      try {
        const payload: StatisticsTimespanPost = this.createPayload(
          this.startDateString,
          this.endDateString,
          'edit',
          'metadata',
        );
        const editData: ActivityData = await this.getUserActivity(payload, this.intervalCtrl.value, 'materialactivity');
        const sortedData: number[] = this.sortValueArrays(editData.dates, editData.total);
        return { name: 'Muokkausmäärät', value: sortedData };
      } catch (error) {
        throw Error(error);
      }
    }
  }

  /**
   * Calls functions to create a payload, make a request and sort the response.
   * @returns { EChartData } Total of search requests.
   */
  async getSearchData(): Promise<EChartData> {
    if (this.activityCtrl.value.includes(ActivityType.SEARCH)) {
      try {
        const payload: StatisticsTimespanPost = this.createPayload(
          this.startDateString,
          this.endDateString,
          null,
          'filters',
        );
        const searchData: ActivityData = await this.getUserActivity(payload, this.intervalCtrl.value, 'searchrequests');
        const sortedData: number[] = this.sortValueArrays(searchData.dates, searchData.total);
        return { name: 'Hakumäärät', value: sortedData };
      } catch (error) {
        throw Error(error);
      }
    }
  }

  /**
   * Creates a payload for activity requests.
   * @param {string} dateSince Start date for statistics 'YYYY-MM-DD'.
   * @param {string} dateUntil End date for statistics 'YYYY-MM-DD'.
   * @param {'view' | 'load' | 'edit' | null} interaction Which activity statistics are requested, null for search requests.
   * @param {'metadata' | 'filters'} filter Extra classifications for request.
   * @returns {StatisticsTimespanPost} A body for requests.
   */
  createPayload(
    dateSince: string,
    dateUntil: string,
    interaction: 'view' | 'load' | 'edit' | null,
    filter: 'metadata' | 'filters',
  ): StatisticsTimespanPost {
    return {
      since: dateSince, // 'YYYY-MM-DD'
      until: dateUntil, // 'YYYY-MM-DD'
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

  /**
   * Makes a request with given params and maps response depending on selected interval.
   * @param {StatisticsTimespanPost} payload Request body.
   * @param {IntervalType} interval For request url: day | week | month.
   * @param {string} activity For request url: materialactivity | searchrequests.
   * @returns { ActivityData } An array of dates and an array with total activity for each date.
   */
  getUserActivity(payload: StatisticsTimespanPost, interval: string, activity: string): Promise<ActivityData> {
    const values: ActivityData = { dates: [], total: [] };
    return new Promise((resolve, reject): void => {
      this.statisticsService.getIntervalTotals(payload, interval, activity).subscribe(
        (response: StatisticsIntervalResponse): void => {
          switch (interval) {
            case 'day':
              values.dates = response.values.map(
                (value: IntervalResponse): string =>
                  value.year + '-' + String(value.month).padStart(2, '0') + '-' + String(value.day).padStart(2, '0'),
              ) as string[];
              values.total = response.values.map((value: IntervalResponse) => value.dayTotal) as number[];
              resolve(values);
              break;
            case 'week':
              values.dates = response.values.map(
                (value: IntervalResponse): string => value.year + '-' + String(value.week).padStart(2, '0'),
              ) as string[];
              values.total = response.values.map((value: IntervalResponse) => value.weekTotal) as number[];
              resolve(values);
              break;
            case 'month':
              values.dates = response.values.map(
                (value: IntervalResponse): string => value.year + '-' + String(value.month).padStart(2, '0'),
              ) as string[];
              values.total = response.values.map((value: IntervalResponse) => value.monthTotal) as number[];
              resolve(values);
              break;
            default:
              reject();
          }
        },
        (err): void => {
          this.toastr.error(err);
          reject();
        },
        (): void => {
          this.submitted = false;
        },
      );
    });
  }

  /**
   * Sets values from total to correct indexes in valueField based on datesArray.
   * @param {string[]} dates An array of dates.
   * @param {number[]} total An array of total values for each date.
   * @returns {number[]} An array of user activity totals.
   */
  sortValueArrays(dates: string[], total: number[]): number[] {
    const valueField: number[] = [];
    for (let i = 0; i < this.datesArray.length; i++) {
      for (let n = 0; n < dates.length; n++) {
        if (this.datesArray[i] == dates[n]) {
          valueField.splice(i, 1, total[n]);
          break;
        }
        valueField.splice(i, 0, null);
      }
    }
    return valueField;
  }

  /**
   * Creates an echart with given categories, values and type.
   * @param {EChartData[]} data Category name and y-axis data.
   * @param {string[]} xAxisValues Values for x-axis.
   * @param {'line' | 'bar'} chartType Chart's type e.g. line or bar.
   * @returns {EChartsOption} Echart.
   */
  setOptions(data: EChartData[], xAxisValues: string[], chartType: 'line' | 'bar'): EChartsOption {
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
      } as TooltipComponentOption | TooltipComponentOption[],
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      } as ToolboxComponentOption | ToolboxComponentOption[],
      legend: {
        data: data,
      } as LegendComponentOption | LegendComponentOption[],
      grid: {
        bottom: 100,
      } as GridComponentOption | GridComponentOption[],
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
      } as YAXisComponentOption | YAXisComponentOption[],
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
      ] as DataZoomComponentOption | DataZoomComponentOption[],
      series: seriesData,
    });
  }
}
