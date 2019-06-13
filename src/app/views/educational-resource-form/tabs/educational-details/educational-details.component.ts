import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { TabsetComponent } from 'ngx-bootstrap';

import { KoodistoProxyService } from '../../../../services/koodisto-proxy.service';

@Component({
  selector: 'app-tabs-educational-details',
  templateUrl: './educational-details.component.html',
})
export class EducationalDetailsComponent implements OnInit {
  @Input() tabs: TabsetComponent;

  // private localStorageKey = 'aoe.new-educational-resource';
  private lang: string = this.translate.currentLang;
  // private savedData = JSON.parse(localStorage.getItem(this.localStorageKey));

  public educationalDetailsForm: FormGroup;
  public hasBasicStudies = false;
  public hasHigherEducation = false;
  private basicStudyKeys: string[];
  private higherEducationKeys: string[];

  public educationalLevels$: Observable<any>;
  public basicStudySubjects$: any[];
  public branchesOfScience$: any[];

  constructor(
    private fb: FormBuilder,
    private koodistoProxySvc: KoodistoProxyService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.educationalDetailsForm = this.fb.group({
      educationalLevels: this.fb.control(null),
      basicStudySubjects: this.fb.array([]),
      branchesOfScience: this.fb.array([]),
    });

    this.educationalLevels$ = this.koodistoProxySvc.getData('koulutusasteet', this.lang);

    this.koodistoProxySvc.getData('peruskoulutuksenoppiaineet', this.lang).subscribe(data => {
      this.basicStudySubjects$ = data;

      this.basicStudySubjects$.forEach(() => this.basicStudySubjects.push(this.fb.control(false)));
    });

    this.koodistoProxySvc.getData('tieteenalat', this.lang).subscribe(data => {
      this.branchesOfScience$ = data;

      this.branchesOfScience$.forEach(branch => {
        const controls = this.fb.array([]);

        branch.children.forEach(() => controls.push(this.fb.control(false)));

        this.branchesOfScience.push(this.fb.group({
          all: this.fb.control(false),
          children: controls,
        }));
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

  educationalLevelsChange($event): void {
    this.hasBasicStudies = $event.filter((e: any) => this.basicStudyKeys.includes(e.key)).length > 0;

    this.hasHigherEducation = $event.filter((e: any) => this.higherEducationKeys.includes(e.key)).length > 0;
  }

  onSubmit() {
    console.warn(this.educationalDetailsForm.value);

    const selectedBasicStudySubjects = this.educationalDetailsForm.value.basicStudySubjects
      .map((checked, index) => checked ? this.basicStudySubjects$[index].key : null)
      .filter(value => value !== null);

    // @todo: Check if all or loop children
    const selectedBranchesOfScience = this.educationalDetailsForm.value.branchesOfScience
      .map((branch, index) => branch.all ? this.branchesOfScience$[index].key : null)
      .filter(value => value !== null);

    console.log(selectedBranchesOfScience);
  }

  public previousTab() {
    this.tabs.tabs[1].active = true;
  }
}
