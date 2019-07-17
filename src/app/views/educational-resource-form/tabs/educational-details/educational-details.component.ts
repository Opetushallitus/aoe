import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { TabsetComponent } from 'ngx-bootstrap';

import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';
import { getLocalStorageData } from '../../../../shared/shared.module';

@Component({
  selector: 'app-tabs-educational-details',
  templateUrl: './educational-details.component.html',
})
export class EducationalDetailsComponent implements OnInit {
  @Input() tabs: TabsetComponent;

  private localStorageKey = 'aoe.new-educational-resource';
  private lang: string = this.translate.currentLang;
  private savedData: any;

  public educationalDetailsForm: FormGroup;
  public hasBasicStudies = false;
  public hasHigherEducation = false;
  public hasVocationalDegree = false;
  private basicStudyKeys: string[];
  private higherEducationKeys: string[];
  private vocationalDegreeKeys: string[];

  public educationalLevels$: Observable<any>;
  public basicStudySubjects$: any[];
  public branchesOfScience$: any[];
  public vocationalDegrees$: any[];

  constructor(
    private fb: FormBuilder,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.savedData = getLocalStorageData(this.localStorageKey);

    this.educationalDetailsForm = this.fb.group({
      educationalLevels: this.fb.control(null),
      basicStudySubjects: this.fb.array([]),
      branchesOfScience: this.fb.array([]),
      vocationalDegrees: this.fb.array([]),
    });

    this.educationalLevels$ = this.koodistoProxySvc.getData('koulutusasteet', this.lang);

    this.koodistoProxySvc.getData('oppiaineet', this.lang).subscribe(data => {
      this.basicStudySubjects$ = data;

      this.basicStudySubjects$.forEach(subject => {
        const state = !!(!!this.savedData.basicStudySubjects && this.savedData.basicStudySubjects.includes(subject.key));

        this.basicStudySubjects.push(this.fb.control(state));
      });
    });

    this.koodistoProxySvc.getData('tieteenalat', this.lang).subscribe(data => {
      this.branchesOfScience$ = data;

      this.branchesOfScience$.forEach(branch => {
        const controls = this.fb.array([]);
        const state = !!(!!this.savedData.branchesOfScience && this.savedData.branchesOfScience.includes(branch.key));

        branch.children.forEach(() => controls.push(this.fb.control(state)));

        this.branchesOfScience.push(this.fb.group({
          all: this.fb.control(state),
          children: controls,
        }));
      });
    });

    this.koodistoProxySvc.getData('ammatillisentutkinnot', this.lang).subscribe(data => {
      this.vocationalDegrees$ = data;

      this.vocationalDegrees$.forEach(degree => {
        const state = !!(!!this.savedData.vocationalDegrees && this.savedData.vocationalDegrees.includes(degree.key));

        this.vocationalDegrees.push(this.fb.control(state));
      });
    });

    // @todo: Replace with data from koodisto-service endpoint
    this.basicStudyKeys = [
      '8cb1a02f-54cb-499a-b470-4ee980519707',
      '5410475a-a2fb-46d7-9eb4-c572b5d92dbb',
      '7eb3d5be-0575-44db-ab8a-883cf0ae2f26',
      '75e8bed1-b965-483d-8ba4-48a5614c69ba',
      'a2a70a14-b150-4f37-9e20-2bbb71731807',
      '14fe3b08-8516-4999-946b-96eb90c2d563',
    ];

    // @todo: Replace with data from koodisto-service endpoint
    this.higherEducationKeys = [
      'e5a48ada-3de0-4246-9b8f-32d4ff68e22f',
      'ff3334db-2a71-4459-8f0d-c42ce2b12a70',
      '9c14f097-68e3-4e6b-a772-71a44442f72f',
      '7c722ac4-f06c-4f2a-a41f-b0c5aa10070a',
    ];

    // @todo: Replace with data from koodisto-service endpoint
    this.vocationalDegreeKeys = [
      '010c6689-5021-4d8e-8c02-68a27cc5a87b',
      '55c5d6a2-8415-47bc-9d15-7b976b0e999c',
      'da5b8f43-5fc9-4681-812b-40846926f3fd',
    ];

    if (this.savedData && this.savedData.educationalLevels) {
      this.educationalDetailsForm.get('educationalLevels').setValue(this.savedData.educationalLevels);

      this.educationalLevelsChange(this.savedData.educationalLevels);
    }
  }

  get educationalLevels(): FormControl {
    return this.educationalDetailsForm.get('educationalLevels') as FormControl;
  }

  get basicStudySubjects(): FormArray {
    return this.educationalDetailsForm.get('basicStudySubjects') as FormArray;
  }

  get branchesOfScience(): FormArray {
    return this.educationalDetailsForm.get('branchesOfScience') as FormArray;
  }

  get vocationalDegrees(): FormArray {
    return this.educationalDetailsForm.get('vocationalDegrees') as FormArray;
  }

  public educationalLevelsChange($event): void {
    this.hasBasicStudies = $event.filter((e: any) => this.basicStudyKeys.includes(e.key)).length > 0;

    this.hasHigherEducation = $event.filter((e: any) => this.higherEducationKeys.includes(e.key)).length > 0;

    this.hasVocationalDegree = $event.filter((e: any) => this.vocationalDegreeKeys.includes(e.key)).length > 0;
  }

  public selectAllChildBranches($event, index): void {
    this.branchesOfScience.at(index).get('children')['controls'].forEach(child => child.setValue($event.currentTarget.checked));
  }

  public onSubmit() {
    const selectedBasicStudySubjects = this.educationalDetailsForm.value.basicStudySubjects
      .map((checked, index) => checked ? this.basicStudySubjects$[index].key : null)
      .filter(value => value !== null);

    // @todo: Check if all or loop children
    const selectedBranchesOfScience = this.educationalDetailsForm.value.branchesOfScience
      .map((branch, index) => branch.all ? this.branchesOfScience$[index].key : null)
      .filter(value => value !== null);

    const selectedVocationalDegrees = this.educationalDetailsForm.value.vocationalDegrees
      .map((checked, index) => checked ? this.vocationalDegrees$[index].key : null)
      .filter(value => value !== null);

    if (this.educationalDetailsForm.valid) {
      const newData = {
        educationalLevels: this.educationalDetailsForm.get('educationalLevels').value,
        basicStudySubjects: selectedBasicStudySubjects,
        branchesOfScience: selectedBranchesOfScience,
        vocationalDegrees: selectedVocationalDegrees,
        aTesti: this.educationalDetailsForm.get('branchesOfScience').value,
      };

      const data = Object.assign({}, getLocalStorageData(this.localStorageKey), newData);

      // save data to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));

      this.tabs.tabs[3].active = true;
    }
  }

  // @todo: some kind of confirmation
  public resetForm() {
    // reset form values
    this.educationalDetailsForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
  }

  public previousTab() {
    this.tabs.tabs[1].active = true;
  }
}
