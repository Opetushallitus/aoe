import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { getLocalStorageData } from '../../../../shared/shared.module';
import { BackendService } from '../../../../services/backend.service';
import { AlignmentObjectExtended } from '../../../../models/alignment-object-extended';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
})
export class PreviewComponent implements OnInit {
  private localStorageKey = environment.newERLSKey;
  private fileUploadLSKey = environment.fileUploadLSKey;
  lang: string = this.translate.currentLang;
  savedData: any;
  fileUpload: any;

  earlyChildhoodEducationSubjects: AlignmentObjectExtended[];
  earlyChildhoodEducationObjectives: AlignmentObjectExtended[];
  prePrimaryEducationSubjects: AlignmentObjectExtended[];
  prePrimaryEducationObjectives: AlignmentObjectExtended[];
  basicStudySubjects: AlignmentObjectExtended[];
  basicStudyObjectives: AlignmentObjectExtended[];
  basicStudyContents: AlignmentObjectExtended[];
  upperSecondarySchoolSubjects: AlignmentObjectExtended[];
  upperSecondarySchoolObjectives: AlignmentObjectExtended[];
  vocationalDegrees: AlignmentObjectExtended[];
  vocationalEducationObjectives: AlignmentObjectExtended[];
  selfMotivatedEducationSubjects: AlignmentObjectExtended[];
  selfMotivatedEducationObjectives: AlignmentObjectExtended[];
  branchesOfScience: AlignmentObjectExtended[];
  scienceBranchObjectives: AlignmentObjectExtended[];

  previewForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private backendSvc: BackendService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang;
    });

    this.savedData = getLocalStorageData(this.localStorageKey);
    this.fileUpload = getLocalStorageData(this.fileUploadLSKey);

    this.previewForm = this.fb.group({
      confirm: this.fb.control(false, [ Validators.requiredTrue ])
    });

    if (this.savedData && this.savedData.alignmentObjects) {
      this.earlyChildhoodEducationSubjects = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'earlyChildhoodEducationSubjects');

      this.earlyChildhoodEducationObjectives = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'earlyChildhoodEducationObjectives');

      // @todo: framework

      this.prePrimaryEducationSubjects = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'prePrimaryEducationSubjects');

      this.prePrimaryEducationObjectives = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'prePrimaryEducationObjectives');

      this.basicStudySubjects = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'basicStudySubjects');

      this.basicStudyObjectives = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'basicStudyObjectives');

      this.basicStudyContents = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'basicStudyContents');

      this.upperSecondarySchoolSubjects = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'upperSecondarySchoolSubjects');

      this.upperSecondarySchoolObjectives = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'upperSecondarySchoolObjectives');

      this.vocationalDegrees = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'vocationalDegrees');

      this.vocationalEducationObjectives = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'vocationalEducationObjectives');

      this.selfMotivatedEducationSubjects = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'selfMotivatedEducationSubjects');

      this.selfMotivatedEducationObjectives = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'selfMotivatedEducationObjectives');

      this.branchesOfScience = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'branchesOfScience');

      this.scienceBranchObjectives = this.savedData.alignmentObjects
        .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === 'scienceBranchObjectives');
    }
  }

  onSubmit() {
    if (this.previewForm.valid) {
      this.backendSvc.postMeta(+this.fileUpload.id, this.savedData).subscribe(() => {
        // clean up local storage
        localStorage.removeItem(this.localStorageKey);
        localStorage.removeItem(this.fileUploadLSKey);

        // redirect to new material
        this.router.navigate(['/materiaali', this.fileUpload.id, this.savedData.slug.fi]);
      });
    }
  }

  // @todo: some kind of confirmation
  resetForm() {
    // reset form values
    this.previewForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
    localStorage.removeItem(this.fileUploadLSKey);
  }

  previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 6]);
  }
}
