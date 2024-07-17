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
  EducationalSubject,
  IntervalResponse,
  PortionResponse,
  StatisticsIntervalResponse,
  StatisticsPortionsPost,
  StatisticsPortionsResponse,
  StatisticsTimespanPost,
} from '../model';
import { ToastrService } from 'ngx-toastr';
import { StatisticsService } from '../services/statistics.service';
import { KoodistoService } from '../services/koodisto.service';
import { ActivityEnum, CategoryEnum, IntervalEnum } from '../model/enumeration/AnalyticsEnums';
import { Observable } from 'rxjs';
import { OptionActivity, OptionCategory, OptionInterval } from '@admin/model/statistics-select-options';
import { Organization } from '@admin/model/organization';

@Component({
  selector: 'app-analytics-view',
  templateUrl: './analytics-view.component.html',
  styleUrls: ['./analytics-view.component.scss'],
})
export class AnalyticsViewComponent implements OnInit {
  educationalLevels$: Observable<EducationalLevel[]> = this.koodistoService.educationalLevels$;
  organizations$: Observable<Organization[]> = this.koodistoService.organizations$;
  educationalSubjects$: Observable<EducationalSubject[]> = this.koodistoService.educationalSubjects$;

  eChartsOption: EChartsOption;
  eChartsOptionActivity: EChartsOption;
  eChartsOptionExpired: EChartsOption;
  eChartsOptionPublished: EChartsOption;

  formGroupUsage: FormGroup;
  formGroupExpired: FormGroup;
  formGroupPublished: FormGroup;

  category: CategoryEnum = CategoryEnum.EDUCATIONAL_LEVEL;
  categoryPublished: 'educationallevel' | 'educationalsubject' | 'organization' = 'educationallevel';
  chartData: { name: string; value: number[] }[] = [];
  dateArray: string[] = [];
  dateSinceString: string;
  dateUntilString: string;
  today: Date;

  selectOptionActivity: OptionActivity[] = [
    { key: 0, value: ActivityEnum.SEARCH, label: { fi: 'Haku', sv: '', en: '' } },
    { key: 1, value: ActivityEnum.VIEW, label: { fi: 'Katselu', sv: '', en: '' } },
    { key: 2, value: ActivityEnum.DOWNLOAD, label: { fi: 'Lataus', sv: '', en: '' } },
    { key: 3, value: ActivityEnum.EDIT, label: { fi: 'Muokkaus', sv: '', en: '' } },
  ];
  selectOptionCategory: OptionCategory[] = [
    { key: 0, value: CategoryEnum.EDUCATIONAL_LEVEL, label: { fi: 'Opetusasteet', sv: '', en: '' } },
    { key: 1, value: CategoryEnum.EDUCATIONAL_SUBJECT, label: { fi: 'Oppiaineet', sv: '', en: '' } },
    { key: 2, value: CategoryEnum.ORGANIZATION, label: { fi: 'Organisaatiot', sv: '', en: '' } },
  ];
  selectOptionInterval: OptionInterval[] = [
    { key: 0, value: IntervalEnum.DAY, label: { fi: 'Päivä', sv: '', en: '' } },
    { key: 1, value: IntervalEnum.WEEK, label: { fi: 'Viikko', sv: '', en: '' } },
    { key: 2, value: IntervalEnum.MONTH, label: { fi: 'Kuukausi', sv: '', en: '' } },
  ];

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
    this.koodistoService.updateEducationalLevels().subscribe();
    this.koodistoService.updateEducationalSubjects().subscribe();
    this.formGroupUsage = this.fb.group({
      activity: [null, [Validators.required]],
      interval: [null, [Validators.required]],
      dateSince: [this.getDateYearAgo(this.today), [Validators.required]],
      dateUntil: [this.today, [Validators.required]],
      organizations: [null],
      educationalLevels: [null],
      educationalSubjects: [null],
    });
    this.formGroupPublished = this.fb.group({
      dateSince: [this.getDateYearAgo(this.today)],
      dateUntil: [this.today],
      category: [null, [Validators.required]],
    });
    this.formGroupPublished
      .get('category')
      .valueChanges.subscribe((value: CategoryEnum) => this.updateFormFields(value));
    this.formGroupExpired = this.fb.group({
      expiredBefore: [this.today, [Validators.required]],
      organizations: [null],
      educationalLevels: [null],
      educationalSubjects: [null],
    });
  }

  updateFormFields(category: CategoryEnum): void {
    switch (category) {
      case CategoryEnum.EDUCATIONAL_LEVEL:
        this.formGroupPublished.addControl('educationalLevels', this.fb.control(null, Validators.required));
        this.formGroupPublished.removeControl('educationalSubjects');
        this.formGroupPublished.removeControl('organizations');
        break;
      case CategoryEnum.EDUCATIONAL_SUBJECT:
        this.formGroupPublished.addControl('educationalSubjects', this.fb.control(null, Validators.required));
        this.formGroupPublished.removeControl('educationalLevels');
        this.formGroupPublished.removeControl('organizations');
        break;
      case CategoryEnum.ORGANIZATION:
        this.formGroupPublished.addControl('organizations', this.fb.control(null, Validators.required));
        this.formGroupPublished.removeControl('educationalLevels');
        this.formGroupPublished.removeControl('educationalSubjects');
        break;
    }
  }

  // Form Usage Getters for FormControls.

  get formUsageActivityCtrl(): FormControl {
    return this.formGroupUsage.get('activity') as FormControl;
  }

  get formUsageIntervalCtrl(): FormControl {
    return this.formGroupUsage.get('interval') as FormControl;
  }

  get formUsageDateSinceCtrl(): FormControl {
    return this.formGroupUsage.get('dateSince') as FormControl;
  }

  get formUsageDateUntilCtrl(): FormControl {
    return this.formGroupUsage.get('dateUntil') as FormControl;
  }

  get formUsageOrganizationsCtrl(): FormControl {
    return this.formGroupUsage.get('organizations') as FormControl;
  }

  get formUsageEducationalLevelsCtrl(): FormControl {
    return this.formGroupUsage.get('educationalLevels') as FormControl;
  }

  get formUsageEducationalSubjectsCtrl(): FormControl {
    return this.formGroupUsage.get('educationalSubjects') as FormControl;
  }

  // Form Published Getters for FormControls.

  get formPublishedDateSinceCtrl(): FormControl {
    return this.formGroupPublished.get('dateSince') as FormControl;
  }

  get formPublishedDateUntilCtrl(): FormControl {
    return this.formGroupPublished.get('dateUntil') as FormControl;
  }

  get formPublishedCategoryCtrl(): FormControl {
    return this.formGroupPublished.get('category') as FormControl;
  }

  get formPublishedOrganizationsCtrl(): FormControl {
    return this.formGroupPublished.get('organizations') as FormControl;
  }

  get formPublishedEducationalLevelsCtrl(): FormControl {
    return this.formGroupPublished.get('educationalLevels') as FormControl;
  }

  get formPublishedEducationalSubjectsCtrl(): FormControl {
    return this.formGroupPublished.get('educationalSubjects') as FormControl;
  }

  // Form Expired Getters for FormControls.

  get formExpiredBeforeCtrl(): FormControl {
    return this.formGroupExpired.get('expiredBefore') as FormControl;
  }

  get formExpiredEducationalLevelsCtrl(): FormControl {
    return this.formGroupExpired.get('educationalLevels') as FormControl;
  }

  // Utility Functions.

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

  resetFormActivity(event: Event): void {
    event.preventDefault();
    this.formGroupUsage.reset({
      dateSince: this.getDateYearAgo(this.today),
      dateUntil: this.today,
    });
    (event.target as HTMLElement).blur();
  }

  resetFormPublished(event?: Event): void {
    if (event) {
      event.preventDefault();
      (event.target as HTMLElement).blur();
    }
    this.formGroupPublished.reset({
      dateSince: this.getDateYearAgo(this.today),
      dateUntil: this.today,
    });
  }

  categoryChange(selectedCategory: CategoryEnum): void {
    this.category = selectedCategory ? selectedCategory : this.category;
  }

  submitFormPublished(buttonElement: HTMLButtonElement): void {
    buttonElement.blur();
    let fieldValue: string[] = [];
    const startDateString: string = this.formPublishedDateSinceCtrl.value
      ? this.statisticsService.dateToString(new Date(this.formPublishedDateSinceCtrl.value), IntervalEnum.DAY)
      : null;
    const endDateString: string = this.formPublishedDateUntilCtrl.value
      ? this.statisticsService.dateToString(new Date(this.formPublishedDateUntilCtrl.value), IntervalEnum.DAY)
      : null;
    switch (this.formPublishedCategoryCtrl.value) {
      case CategoryEnum.EDUCATIONAL_LEVEL:
        fieldValue = this.formPublishedEducationalLevelsCtrl.value?.map(
          (educationalLevel: EducationalLevel) => educationalLevel.key,
        );
        break;
      case CategoryEnum.EDUCATIONAL_SUBJECT:
        fieldValue = this.formPublishedEducationalSubjectsCtrl.value?.map(
          (educationalSubject: EducationalSubject) => educationalSubject.key,
        );
        break;
      case CategoryEnum.ORGANIZATION:
        fieldValue = this.formPublishedOrganizationsCtrl.value?.map((organization: Organization) => organization.key);
        break;
    }
    if (this.formGroupPublished.valid) {
      const payload: StatisticsPortionsPost = {
        since: startDateString as string, // YYYY-MM-DD | null
        until: endDateString as string, // YYYY-MM-DD | null
        [this.category]: fieldValue as string[],
      };
      this.categoryPublished =
        this.category === CategoryEnum.EDUCATIONAL_LEVEL
          ? 'educationallevel'
          : this.category === CategoryEnum.EDUCATIONAL_SUBJECT
          ? 'educationalsubject'
          : this.category === CategoryEnum.ORGANIZATION
          ? 'organization'
          : this.categoryPublished;
      this.getCategoryNames()
        .then((categoryItems: { key: string; value: string }[]): void => {
          this.getPublishedMaterials(payload, this.categoryPublished, categoryItems).then(
            (response: { portionNames: string[]; total: number[] }): void => {
              this.eChartsOptionPublished = this.setOptions(
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
    return new Promise((resolve, reject): void => {
      switch (this.category) {
        case CategoryEnum.EDUCATIONAL_LEVEL:
          categoryItems = this.formPublishedEducationalLevelsCtrl.value?.map(
            (educationalLevel: { key: string; value: string }): { key: string; value: string } => ({
              key: educationalLevel.key,
              value: educationalLevel.value,
            }),
          );
          return resolve(categoryItems);
        case CategoryEnum.EDUCATIONAL_SUBJECT:
          categoryItems = this.formPublishedEducationalSubjectsCtrl.value?.map(
            (subjects: { key: string; value: string }): { key: string; value: string } => ({
              key: subjects.key,
              value: subjects.value,
            }),
          );
          return resolve(categoryItems);
        case CategoryEnum.ORGANIZATION:
          categoryItems = this.formPublishedOrganizationsCtrl.value?.map(
            (organization: { key: string; value: string }): { key: string; value: string } => ({
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
    return new Promise((resolve, reject): void => {
      this.statisticsService.getPublishedMaterials(payload, category).subscribe(
        (response: StatisticsPortionsResponse): void => {
          values.portionNames = response.values.map((item: PortionResponse): string => {
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
        (err): void => {
          this.toastr.error(err);
          reject(err);
        },
      );
    });
  }

  /**
   * Gets form elements' values, checks validity, creates a payload for request.
   */
  submitFormExpired(): void {
    const expiredBeforeDate: Date = new Date(this.formExpiredBeforeCtrl.value);
    const expiredBeforeString: string = this.statisticsService.dateToString(expiredBeforeDate, IntervalEnum.DAY);

    if (this.formGroupExpired.valid) {
      const payload: StatisticsPortionsPost = {
        since: null as string, // 'YYYY-MM-DD'
        until: null as string, // 'YYYY-MM-DD'
        expiredBefore: expiredBeforeString as string,
        educationalLevels: this.formExpiredEducationalLevelsCtrl.value?.map(
          (educationalLevel: EducationalLevel) => educationalLevel.key,
        ) as string[],
      };
      const educationalLevelNames: [{ key: string; value: string }] = this.formExpiredEducationalLevelsCtrl.value?.map(
        (educationalLevel: EducationalLevel): { key: string; value: string } => ({
          key: educationalLevel.key,
          value: educationalLevel.value,
        }),
      );
      this.getExpiredMaterials(payload, educationalLevelNames).then(
        (response: { portionNames: string[]; total: number[] }) => {
          this.eChartsOptionExpired = this.setOptions(
            [{ name: 'Vanhentuneet', value: response.total }],
            response.portionNames,
            'bar',
          ) as EChartsOption;
        },
      );
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
      );
    });
  }

  submitFormActivity(buttonElement: HTMLButtonElement): void {
    buttonElement.blur();

    if (this.formGroupUsage.valid) {
      this.chartData = [];
      this.dateArray = [] as string[];
      this.dateArray = this.statisticsService.createArrayOfDates(
        this.formUsageDateSinceCtrl.value as Date,
        this.formUsageDateUntilCtrl.value as Date,
        this.formUsageIntervalCtrl.value as IntervalEnum,
      ) as string[];

      Promise.all([this.getViewingData(), this.getSearchData(), this.getDownloadData(), this.getEditData()]).then(
        (response: EChartData[]): void => {
          this.chartData = response.filter((n: EChartData) => n);
          this.eChartsOptionActivity = this.setOptions(this.chartData, this.dateArray, 'line') as EChartsOption;
        },
      );
    }
  }

  /**
   * Calls functions to create a payload, make a request and sort the response.
   * @returns { EChartData } Total of viewed materials.
   */
  async getViewingData(): Promise<EChartData> {
    try {
      const payload: StatisticsTimespanPost = this.createPayload(
        this.getDatestamp(this.formUsageDateSinceCtrl.value),
        this.getDatestamp(this.formUsageDateUntilCtrl.value),
        this.formUsageActivityCtrl.value,
        'metadata',
      );
      const viewingData: ActivityData = await this.getUserActivity(
        payload,
        this.formUsageIntervalCtrl.value,
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
    if (this.formUsageActivityCtrl.value.includes(ActivityEnum.DOWNLOAD)) {
      try {
        const payload: StatisticsTimespanPost = this.createPayload(
          this.dateUntilString,
          this.dateSinceString,
          'load',
          'metadata',
        );
        const downloadData: ActivityData = await this.getUserActivity(
          payload,
          this.formUsageIntervalCtrl.value,
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
    if (this.formUsageActivityCtrl.value.includes(ActivityEnum.EDIT)) {
      try {
        const payload: StatisticsTimespanPost = this.createPayload(
          this.dateUntilString,
          this.dateSinceString,
          'edit',
          'metadata',
        );
        const editData: ActivityData = await this.getUserActivity(
          payload,
          this.formUsageIntervalCtrl.value,
          'materialactivity',
        );
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
    if (this.formUsageActivityCtrl.value.includes(ActivityEnum.SEARCH)) {
      try {
        const payload: StatisticsTimespanPost = this.createPayload(
          this.dateUntilString,
          this.dateSinceString,
          null,
          'filters',
        );
        const searchData: ActivityData = await this.getUserActivity(
          payload,
          this.formUsageIntervalCtrl.value,
          'searchrequests',
        );
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
        organizations: this.formUsageOrganizationsCtrl.value?.map(
          (organization: KeyValue<string, string>) => organization.key,
        ) as string[],
        educationalLevels: this.formUsageEducationalLevelsCtrl.value?.map(
          (educationalLevel: EducationalLevel) => educationalLevel.key,
        ) as string[],
        educationalSubjects: this.formUsageEducationalSubjectsCtrl.value?.map(
          (subject: EducationalSubject) => subject.key,
        ) as string[],
      },
    } as StatisticsTimespanPost;
  }

  /**
   * Makes a request with given params and maps response depending on selected interval.
   * @param {StatisticsTimespanPost} payload Request body.
   * @param {IntervalEnum} interval For request url: day | week | month.
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
    for (let i = 0; i < this.dateArray.length; i++) {
      for (let n = 0; n < dates.length; n++) {
        if (this.dateArray[i] == dates[n]) {
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
    return (this.eChartsOption = {
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
