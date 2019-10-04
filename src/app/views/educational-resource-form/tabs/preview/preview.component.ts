import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
  public savedData: any;
  private fileUpload: any;

  public earlyChildhoodEducationSubjects: AlignmentObjectExtended[];
  public earlyChildhoodEducationObjectives: AlignmentObjectExtended[];
  public prePrimaryEducationSubjects: AlignmentObjectExtended[];
  public prePrimaryEducationObjectives: AlignmentObjectExtended[];
  public basicStudySubjects: AlignmentObjectExtended[];
  public upperSecondarySchoolSubjects: AlignmentObjectExtended[];
  public upperSecondarySchoolObjectives: AlignmentObjectExtended[];
  public vocationalDegrees: AlignmentObjectExtended[];
  public vocationalEducationObjectives: AlignmentObjectExtended[];
  public selfMotivatedEducationSubjects: AlignmentObjectExtended[];
  public selfMotivatedEducationObjectives: AlignmentObjectExtended[];
  public scienceBranchObjectives: AlignmentObjectExtended[];

  public previewForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private backendSvc: BackendService,
  ) { }

  ngOnInit() {
    this.savedData = getLocalStorageData(this.localStorageKey);
    this.fileUpload = getLocalStorageData(this.fileUploadLSKey);

    this.previewForm = this.fb.group({
      confirm: this.fb.control(false, [ Validators.requiredTrue ])
    });

    if (this.savedData && this.savedData.alignmentObjects) {
      this.earlyChildhoodEducationSubjects = this.savedData.alignmentObjects
        .filter(alignmentObject => alignmentObject.source === 'earlyChildhoodEducationSubjects');

      this.earlyChildhoodEducationObjectives = this.savedData.alignmentObjects
        .filter(alignmentObject => alignmentObject.source === 'earlyChildhoodEducationObjectives');

      // @todo: framework

      this.prePrimaryEducationSubjects = this.savedData.alignmentObjects
        .filter(alignmentObject => alignmentObject.source === 'prePrimaryEducationSubjects');

      this.prePrimaryEducationObjectives = this.savedData.alignmentObjects
        .filter(alignmentObject => alignmentObject.source === 'prePrimaryEducationObjectives');

      this.basicStudySubjects = this.savedData.alignmentObjects
        .filter(alignmentObject => alignmentObject.source === 'basicStudySubjects');

      this.upperSecondarySchoolSubjects = this.savedData.alignmentObjects
        .filter(alignmentObject => alignmentObject.source === 'upperSecondarySchoolSubjects');

      this.upperSecondarySchoolObjectives = this.savedData.alignmentObjects
        .filter(alignmentObject => alignmentObject.source === 'upperSecondarySchoolObjectives');

      this.vocationalDegrees = this.savedData.alignmentObjects
        .filter(alignmentObject => alignmentObject.source === 'vocationalDegrees');

      this.vocationalEducationObjectives = this.savedData.alignmentObjects
        .filter(alignmentObject => alignmentObject.source === 'vocationalEducationObjectives');

      this.selfMotivatedEducationSubjects = this.savedData.alignmentObjects
        .filter(alignmentObject => alignmentObject.source === 'selfMotivatedEducationSubjects');

      this.selfMotivatedEducationObjectives = this.savedData.alignmentObjects
        .filter(alignmentObject => alignmentObject.source === 'selfMotivatedEducationObjectives');

      this.scienceBranchObjectives = this.savedData.alignmentObjects
        .filter(alignmentObject => alignmentObject.source === 'scienceBranchObjectives');
    }
  }

  public onSubmit() {
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
  public resetForm() {
    // reset form values
    this.previewForm.reset();

    // clear data from local storage
    localStorage.removeItem(this.localStorageKey);
    localStorage.removeItem(this.fileUploadLSKey);
  }

  public previousTab() {
    this.router.navigate(['/lisaa-oppimateriaali', 6]);
  }
}
