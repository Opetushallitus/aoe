import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop'
import { LangChangeEvent, TranslateService, TranslatePipe } from '@ngx-translate/core'
import { EducationalMaterialForm } from '@models/educational-material-form'
import { AlignmentObjectExtended } from '@models/alignment-object-extended'
import {
  AttachmentDetail,
  EducationalMaterialPut,
  Material
} from '@models/educational-material-put'
import { ignoredSubjects } from '@constants/ignored-subjects'
import { MaterialService } from '@services/material.service'
import { PreviewRowComponent } from '../../../../components/preview-row/preview-row.component'
import { FocusRemoverDirective } from '../../../../directives/focus-remover.directive'
import { DatePipe } from '@angular/common'

@Component({
  selector: 'app-tabs-edit-preview',
  templateUrl: './edit-preview.component.html',
  styleUrls: ['./edit-preview.component.scss'],
  imports: [
    PreviewRowComponent,
    FocusRemoverDirective,
    RouterLink,
    CdkDropList,
    CdkDrag,
    ReactiveFormsModule,
    DatePipe,
    TranslatePipe
  ]
})
export class EditPreviewComponent implements OnInit {
  @Input() tabId: number
  @Input() materialId: number
  form: FormGroup
  lang: string
  submitted = false
  canDeactivate = false
  previewMaterial: EducationalMaterialForm
  @Output() abortEdit = new EventEmitter()
  typicalAgeRange: string
  saveError = ''

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private materialService: MaterialService,
    private router: Router,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.setTitle()

    this.form = this.fb.group({
      hasName: this.fb.control(false, [Validators.requiredTrue]),
      hasMaterial: this.fb.control(false, [Validators.requiredTrue]),
      hasAuthor: this.fb.control(false, [Validators.requiredTrue]),
      hasKeywords: this.fb.control(false, [Validators.requiredTrue]),
      hasLearningResourceTypes: this.fb.control(false, [Validators.requiredTrue]),
      hasEducationalLevels: this.fb.control(false, [Validators.requiredTrue]),
      shouldHaveBasicEduObjectivesAndContents: this.fb.control(false),
      hasBasicEduObjectives: this.fb.control(false, [Validators.requiredTrue]),
      hasBasicEduContents: this.fb.control(false, [Validators.requiredTrue]),
      shouldHaveUppSecondaryEduObjectivesAndContents: this.fb.control(false),
      hasUpperSecondaryEduObjectives: this.fb.control(false, [Validators.requiredTrue]),
      hasUpperSecondaryEduContents: this.fb.control(false, [Validators.requiredTrue]),
      hasLicense: this.fb.control(false, [Validators.requiredTrue]),
      confirm: this.fb.control(false, [Validators.requiredTrue])
    })
    this.lang = this.translate.getCurrentLang()
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.lang = event.lang
      this.setTitle()
    })
    this.previewMaterial = this.materialService.getEducationalMaterialEditForm()
    if (
      this.previewMaterial?.name?.fi ||
      this.previewMaterial?.name?.sv ||
      this.previewMaterial?.name?.en
    ) {
      this.form.get('hasName').setValue(true)
    }
    this.form.get('hasMaterial').setValue(this.previewMaterial?.fileDetails?.length > 0)
    this.form.get('hasAuthor').setValue(this.previewMaterial?.authors?.length > 0)
    this.form.get('hasKeywords').setValue(this.previewMaterial?.keywords?.length > 0)
    this.form
      .get('hasLearningResourceTypes')
      .setValue(this.previewMaterial?.learningResourceTypes?.length > 0)
    this.form
      .get('hasEducationalLevels')
      .setValue(this.previewMaterial?.educationalLevels?.length > 0)
    this.form.get('hasLicense').setValue(this.previewMaterial?.license?.length > 0)
    if (
      this.previewMaterial?.typicalAgeRange?.typicalAgeRangeMin ||
      this.previewMaterial?.typicalAgeRange?.typicalAgeRangeMax
    ) {
      this.typicalAgeRange = `${this.previewMaterial?.typicalAgeRange?.typicalAgeRangeMin ?? ''} - ${
        this.previewMaterial?.typicalAgeRange?.typicalAgeRangeMax ?? ''
      }`
    }
    if (this.previewMaterial.basicStudySubjects?.length > 0) {
      this.form
        .get('hasBasicEduObjectives')
        .setValue(this.previewMaterial.basicStudyObjectives?.length > 0)
      this.form
        .get('hasBasicEduContents')
        .setValue(this.previewMaterial.basicStudyContents?.length > 0)
      const ignoredSubjectsList = this.previewMaterial.basicStudySubjects.filter(
        (subject: AlignmentObjectExtended) => ignoredSubjects.includes(subject.key.toString())
      )
      this.form
        .get('shouldHaveBasicEduObjectivesAndContents')
        .setValue(ignoredSubjectsList.length <= 0)
    }

    if (this.shouldHaveBasicEduObjectivesAndContents === false) {
      this.form.get('hasBasicEduObjectives').setValidators(null)
      this.form.get('hasBasicEduObjectives').updateValueAndValidity()
      this.form.get('hasBasicEduContents').setValidators(null)
      this.form.get('hasBasicEduContents').updateValueAndValidity()
    }

    if (
      this.previewMaterial.upperSecondarySchoolSubjectsNew?.length > 0 &&
      this.previewMaterial.upperSecondarySchoolModulesNew?.length > 0
    ) {
      this.form.get('shouldHaveUppSecondaryEduObjectivesAndContents').setValue(true)
      this.form
        .get('hasUpperSecondaryEduObjectives')
        .setValue(this.previewMaterial.upperSecondarySchoolObjectivesNew?.length > 0)
      this.form
        .get('hasUpperSecondaryEduContents')
        .setValue(this.previewMaterial.upperSecondarySchoolContentsNew?.length > 0)
    }

    if (this.shouldHaveUppSecondaryEduObjectivesAndContents === false) {
      this.form.get('hasUpperSecondaryEduObjectives').setValidators(null)
      this.form.get('hasUpperSecondaryEduObjectives').updateValueAndValidity()
      this.form.get('hasUpperSecondaryEduContents').setValidators(null)
      this.form.get('hasUpperSecondaryEduContents').updateValueAndValidity()
    }
  }

  setTitle(): void {
    this.translate
      .get(['common.serviceName', 'titles.editMaterial.main', 'titles.editMaterial.preview'])
      .subscribe((translations: { [key: string]: string }) => {
        this.titleService.setTitle(
          `${translations['titles.editMaterial.main']}: ${translations['titles.editMaterial.preview']} - ${translations['common.serviceName']}`
        )
      })
  }

  /**
   * Moves item in array.
   * @param {CdkDragDrop<any>} event
   */
  drop(event: CdkDragDrop<any>): void {
    moveItemInArray(this.previewMaterial.fileDetails, event.previousIndex, event.currentIndex)
  }

  get hasName(): boolean {
    return this.form.get('hasName').value
  }

  get hasMaterial(): boolean {
    return this.form.get('hasMaterial').value
  }

  get hasAuthor(): boolean {
    return this.form.get('hasAuthor').value
  }

  get hasKeywords(): boolean {
    return this.form.get('hasKeywords').value
  }

  get hasLearningResourceTypes(): boolean {
    return this.form.get('hasLearningResourceTypes').value
  }

  get hasEducationalLevels(): boolean {
    return this.form.get('hasEducationalLevels').value
  }

  get shouldHaveBasicEduObjectivesAndContents(): boolean {
    return this.form.get('shouldHaveBasicEduObjectivesAndContents').value
  }

  get hasBasicEduObjectives(): boolean {
    return this.form.get('hasBasicEduObjectives').value
  }

  get hasBasicEduContents(): boolean {
    return this.form.get('hasBasicEduContents').value
  }

  get shouldHaveUppSecondaryEduObjectivesAndContents(): boolean {
    return this.form.get('shouldHaveUppSecondaryEduObjectivesAndContents').value
  }

  get hasUpperSecondaryEduObjectives(): boolean {
    return this.form.get('hasUpperSecondaryEduObjectives').value
  }

  get hasUpperSecondaryEduContents(): boolean {
    return this.form.get('hasUpperSecondaryEduContents').value
  }

  get hasLicense(): boolean {
    return this.form.get('hasLicense').value
  }

  /**
   * Runs on submit. If form is valid and dirty, changed material is saved on sessionStorage.
   * If form is valid, redirects user to the next tab.
   */
  onSubmit(): void {
    this.submitted = true

    if (this.form.valid) {
      this.canDeactivate = true
      this.saveError = ''
      // The request body is assembled by deleting fields as they are consumed. previewMaterial
      // is the very object held in the shared edit-form store, so mutating it here would strip
      // the wizard state and leave nothing to retry with when the save fails.
      const material = structuredClone(this.previewMaterial)

      let alignmentObjects: AlignmentObjectExtended[] = []

      // early childhood education
      material.earlyChildhoodEducationSubjects.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = material.earlyChildhoodEducationFramework

        alignmentObjects.push(subject)
      })
      delete material.earlyChildhoodEducationSubjects

      material.earlyChildhoodEducationObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = material.earlyChildhoodEducationFramework

        alignmentObjects.push(objective)
      })
      delete material.earlyChildhoodEducationObjectives
      delete material.earlyChildhoodEducationFramework

      // pre-primary education
      material.prePrimaryEducationSubjects.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = material.prePrimaryEducationFramework

        alignmentObjects.push(subject)
      })
      delete material.prePrimaryEducationSubjects

      material.prePrimaryEducationObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = material.prePrimaryEducationFramework

        alignmentObjects.push(objective)
      })
      delete material.prePrimaryEducationObjectives
      delete material.prePrimaryEducationFramework

      // basic education
      material.basicStudySubjects.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = material.basicStudyFramework

        alignmentObjects.push(subject)
      })
      delete material.basicStudySubjects

      material.basicStudyObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = material.basicStudyFramework
        delete objective.parent

        alignmentObjects.push(objective)
      })
      delete material.basicStudyObjectives

      material.basicStudyContents.forEach((content: AlignmentObjectExtended) => {
        content.educationalFramework = material.basicStudyFramework
        delete content.parent

        alignmentObjects.push(content)
      })
      delete material.basicStudyContents
      delete material.basicStudyFramework

      // upper secondary school
      material.upperSecondarySchoolSubjectsOld.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = material.upperSecondarySchoolFramework

        alignmentObjects.push(subject)
      })
      delete material.upperSecondarySchoolSubjectsOld

      material.upperSecondarySchoolCoursesOld.forEach((course: AlignmentObjectExtended) => {
        course.educationalFramework = material.upperSecondarySchoolFramework
        delete course.parent

        alignmentObjects.push(course)
      })
      delete material.upperSecondarySchoolCoursesOld

      material.upperSecondarySchoolObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = material.upperSecondarySchoolFramework

        alignmentObjects.push(objective)
      })
      delete material.upperSecondarySchoolObjectives
      delete material.upperSecondarySchoolFramework

      //old code -->
      /*
      alignmentObjects = alignmentObjects.concat(material.upperSecondarySchoolSubjectsOld);
      delete material.upperSecondarySchoolSubjectsOld;
      */

      material.upperSecondarySchoolSubjectsNew.forEach((subject: AlignmentObjectExtended) => {
        subject.educationalFramework = material.newUpperSecondarySchoolFramework

        alignmentObjects.push(subject)
      })
      delete material.upperSecondarySchoolSubjectsNew

      material.upperSecondarySchoolModulesNew.forEach((module: AlignmentObjectExtended) => {
        delete module.parent

        alignmentObjects.push(module)
      })
      delete material.upperSecondarySchoolModulesNew

      material.upperSecondarySchoolObjectivesNew.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = material.newUpperSecondarySchoolFramework
        delete objective.parent

        alignmentObjects.push(objective)
      })
      delete material.upperSecondarySchoolObjectivesNew

      material.upperSecondarySchoolContentsNew.forEach((content: AlignmentObjectExtended) => {
        content.educationalFramework = material.newUpperSecondarySchoolFramework
        delete content.parent

        alignmentObjects.push(content)
      })
      delete material.upperSecondarySchoolContentsNew
      delete material.newUpperSecondarySchoolFramework

      //new framework old code
      /*
      alignmentObjects = alignmentObjects.concat(material.upperSecondarySchoolSubjectsNew);
      delete material.upperSecondarySchoolSubjectsNew;
      */

      // vocational education
      material.vocationalDegrees.forEach((degree: AlignmentObjectExtended) => {
        degree.educationalFramework = material.vocationalEducationFramework

        alignmentObjects.push(degree)
      })
      delete material.vocationalDegrees

      material.vocationalUnits.forEach((unit: AlignmentObjectExtended) => {
        unit.educationalFramework = material.vocationalEducationFramework
        delete unit.parent

        alignmentObjects.push(unit)
      })
      delete material.vocationalUnits

      material.vocationalCommonUnits.forEach((commonUnit: AlignmentObjectExtended) => {
        commonUnit.educationalFramework = material.vocationalEducationFramework
        delete commonUnit.parent

        alignmentObjects.push(commonUnit)
      })
      delete material.vocationalCommonUnits

      material.vocationalRequirements.forEach((requirement: AlignmentObjectExtended) => {
        requirement.educationalFramework = material.vocationalEducationFramework

        alignmentObjects.push(requirement)
      })
      delete material.vocationalRequirements

      material.furtherVocationalQualifications.forEach((qualification: AlignmentObjectExtended) => {
        qualification.educationalFramework = material.vocationalEducationFramework

        alignmentObjects.push(qualification)
      })
      delete material.furtherVocationalQualifications

      material.specialistVocationalQualifications.forEach(
        (qualification: AlignmentObjectExtended) => {
          qualification.educationalFramework = material.vocationalEducationFramework

          alignmentObjects.push(qualification)
        }
      )
      delete material.specialistVocationalQualifications
      delete material.vocationalEducationFramework

      // self-motivated competence development
      alignmentObjects = alignmentObjects.concat(material.selfMotivatedEducationSubjects)
      delete material.selfMotivatedEducationSubjects

      alignmentObjects = alignmentObjects.concat(material.selfMotivatedEducationObjectives)
      delete material.selfMotivatedEducationObjectives

      //preparatory education
      material.preparatoryEducationSubjects.forEach((subject: AlignmentObjectExtended) => {
        alignmentObjects.push(subject)
      })
      delete material.preparatoryEducationSubjects

      material.preparatoryEducationObjectives.forEach((objective: AlignmentObjectExtended) => {
        alignmentObjects.push(objective)
      })
      delete material.preparatoryEducationObjectives

      // higher education
      material.branchesOfScience.forEach((branch: AlignmentObjectExtended) => {
        branch.educationalFramework = material.higherEducationFramework

        alignmentObjects.push(branch)
      })
      delete material.branchesOfScience

      material.scienceBranchObjectives.forEach((objective: AlignmentObjectExtended) => {
        objective.educationalFramework = material.higherEducationFramework

        alignmentObjects.push(objective)
      })
      delete material.scienceBranchObjectives
      delete material.higherEducationFramework

      // prerequisites
      alignmentObjects = alignmentObjects.concat(material.prerequisites)
      delete material.prerequisites

      // versioning
      let isVersioned = material.isVersioned

      if (!material.versions.length) {
        isVersioned = true
      }

      // materials
      const materials: Material[] = []

      // attachmentDetails
      const attachmentDetails: AttachmentDetail[] = []

      // fileDetails
      const fileDetails = material.fileDetails.map((file, idx: number) => {
        const subtitles: string[] = []

        file.subtitles.forEach((subtitle) => {
          attachmentDetails.push({
            id: subtitle.id,
            kind: subtitle.kind,
            default: subtitle.default,
            lang: subtitle.srclang,
            label: subtitle.label
          })

          subtitles.push(subtitle.id)
        })

        materials.push({
          materialId: file.id,
          priority: idx,
          attachments: subtitles
        })

        delete file.file
        delete file.priority
        delete file.subtitles

        return file
      })
      delete material.fileDetails
      delete material.videoFiles

      // thumbnail
      delete material.thumbnail

      // references
      const isBasedOn = {
        externals: material.externals
      }
      delete material.externals

      const updatedMaterial: EducationalMaterialPut = Object.assign(
        {},
        material,
        { isVersioned },
        { materials },
        { fileDetails },
        { attachmentDetails },
        { alignmentObjects },
        { isBasedOn }
      )

      this.materialService
        .updateEducationalMaterialMetadata(
          this.materialService.getEducationalMaterialID(),
          updatedMaterial
        )
        .subscribe({
          error: (err) => {
            console.error(err)
            // Leave the user on the preview with their data intact so they can retry; the
            // wizard state is untouched because the body was built from a clone.
            this.canDeactivate = false
            this.saveError = this.translate.instant('forms.common.saveError')
          },
          complete: () => {
            this.router
              .navigate(['/materiaali', this.materialService.getEducationalMaterialID()])
              .then(() => {
                this.materialService.clearEducationalMaterialEditForm()
                this.materialService.clearEducationalMaterialID()
                this.materialService.clearUploadedFiles()
                this.materialService.clearUploadResponses()
              })
          }
        })
    } else {
      void this.router.navigate(['/materiaali', this.materialService.getEducationalMaterialID()])
    }
  }

  /**
   * Emits EventEmitter indicating user wants to abort.
   */
  abort(): void {
    this.abortEdit.emit()
  }

  /**
   * Redirects user to previous tab.
   */
  previous(): void {
    void this.router.navigate([
      '/muokkaa-oppimateriaalia',
      this.materialService.getEducationalMaterialID(),
      this.tabId - 1
    ])
  }
}
