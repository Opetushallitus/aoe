import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { KoodistoService } from '@services/koodisto.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs';
import { EducationalLevel } from '@models/koodisto/educational-level';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { educationalLevelKeys } from '../../../../constants/educational-level-keys';
import {
    addEarlyChildhoodEducationSubject,
    addEarlyChildhoodEducationObjective,
    addPrePrimaryEducationSubject,
    addPrePrimaryEducationObjective,
    addUpperSecondarySchoolObjective,
    addVocationalEducationObjective,
    addSelfMotivatedEducationSubject,
    addSelfMotivatedEducationObjective,
    addScienceBranchObjectives,
    textInputValidator,
} from '../../../../shared/shared.module';
import { Title } from '@angular/platform-browser';
import { validatorParams } from '../../../../constants/validator-params';
import { TitlesMaterialFormTabs } from '@models/translations/titles';

@Component({
    selector: 'app-tabs-edit-educational-details',
    templateUrl: './edit-educational-details.component.html',
    styleUrls: ['./edit-educational-details.component.scss'],
})
export class EditEducationalDetailsComponent implements OnInit, OnDestroy {
    @Input() material: EducationalMaterialForm;
    @Input() materialId: number;
    @Input() tabId: number;
    form: FormGroup;
    submitted = false;
    educationalLevelSubscription: Subscription;
    educationalLevels: EducationalLevel[];
    basicStudySubjectSubscription: Subscription;
    basicStudySubjects: AlignmentObjectExtended[];
    basicStudyObjectiveSubscription: Subscription;
    basicStudyObjectives: AlignmentObjectExtended[];
    basicStudyContentSubscription: Subscription;
    basicStudyContents: AlignmentObjectExtended[];
    upperSecondarySchoolSubjectOldSubscription: Subscription;
    upperSecondarySchoolSubjectsOld: AlignmentObjectExtended[];
    upperSecondarySchoolCourseOldSubscription: Subscription;
    upperSecondarySchoolCoursesOld: AlignmentObjectExtended[];
    upperSecondarySchoolSubjectNewSubscription: Subscription;
    upperSecondarySchoolSubjectsNew: AlignmentObjectExtended[];
    upperSecondarySchoolModuleNewSubscription: Subscription;
    upperSecondarySchoolModulesNew: AlignmentObjectExtended[];
    upperSecondarySchoolObjectiveNewSubscription: Subscription;
    upperSecondarySchoolObjectivesNew: AlignmentObjectExtended[];
    upperSecondarySchoolContentNewSubscription: Subscription;
    upperSecondarySchoolContentsNew: AlignmentObjectExtended[];
    vocationalDegreeSubscription: Subscription;
    vocationalDegrees: AlignmentObjectExtended[];
    vocationalUnitSubscription: Subscription;
    vocationalUnits: AlignmentObjectExtended[];
    vocationalCommonUnitSubscription: Subscription;
    vocationalCommonUnits: AlignmentObjectExtended[];
    vocationalRequirementSubscription: Subscription;
    vocationalRequirements: AlignmentObjectExtended[];
    furtherVocationalQualificationSubscription: Subscription;
    furtherVocationalQualifications: AlignmentObjectExtended[];
    specialistVocationalQualificationSubscription: Subscription;
    specialistVocationalQualifications: AlignmentObjectExtended[];
    scienceBranchSubscription: Subscription;
    scienceBranches: AlignmentObjectExtended[];
    hasEarlyChildhoodEducation = false;
    hasPrePrimaryEducation = false;
    hasBasicStudies = false;
    hasBasicStudySubjects = false;
    hasUpperSecondarySchool = false;
    hasUpperSecondarySchoolSubjectsOld = false;
    hasUpperSecondarySchoolSubjectsNew = false;
    hasUpperSecondarySchoolModulesNew = false;
    hasVocationalEducation = false;
    hasVocationalDegrees = false;
    hasVocationalUnits = false;
    hasVocationalCommonUnits = false;
    hasSelfMotivatedEducation = false;
    hasHigherEducation = false;
    addEarlyChildhoodEducationSubject = addEarlyChildhoodEducationSubject;
    addEarlyChildhoodEducationObjective = addEarlyChildhoodEducationObjective;
    addPrePrimaryEducationSubject = addPrePrimaryEducationSubject;
    addPrePrimaryEducationObjective = addPrePrimaryEducationObjective;
    addUpperSecondarySchoolObjective = addUpperSecondarySchoolObjective;
    addVocationalEducationObjective = addVocationalEducationObjective;
    addSelfMotivatedEducationSubject = addSelfMotivatedEducationSubject;
    addSelfMotivatedEducationObjective = addSelfMotivatedEducationObjective;
    addScienceBranchObjectives = addScienceBranchObjectives;
    @Output() abortEdit = new EventEmitter();

    constructor(
        private fb: FormBuilder,
        private translate: TranslateService,
        private koodistoSvc: KoodistoService,
        private router: Router,
        private titleSvc: Title,
    ) {}

    ngOnInit(): void {
        this.setTitle();

        this.form = this.fb.group({
            educationalLevels: this.fb.control(null),
            earlyChildhoodEducationSubjects: this.fb.control(null),
            suitsAllEarlyChildhoodSubjects: this.fb.control(false),
            earlyChildhoodEducationObjectives: this.fb.control(null),
            earlyChildhoodEducationFramework: this.fb.control(null, [
                Validators.maxLength(validatorParams.educationalFramework.maxLength),
                textInputValidator(),
            ]),
            prePrimaryEducationSubjects: this.fb.control(null),
            suitsAllPrePrimarySubjects: this.fb.control(false),
            prePrimaryEducationObjectives: this.fb.control(null),
            prePrimaryEducationFramework: this.fb.control(null, [
                Validators.maxLength(validatorParams.educationalFramework.maxLength),
                textInputValidator(),
            ]),
            basicStudySubjects: this.fb.control(null),
            suitsAllBasicStudySubjects: this.fb.control(false),
            basicStudyObjectives: this.fb.control(null),
            basicStudyContents: this.fb.control(null),
            basicStudyFramework: this.fb.control(null, [
                Validators.maxLength(validatorParams.educationalFramework.maxLength),
                textInputValidator(),
            ]),
            currentUpperSecondarySchoolSelected: this.fb.control(false),
            newUpperSecondarySchoolSelected: this.fb.control(false),
            upperSecondarySchoolSubjectsOld: this.fb.control(null),
            upperSecondarySchoolCoursesOld: this.fb.control(null),
            suitsAllUpperSecondarySubjects: this.fb.control(false),
            upperSecondarySchoolObjectives: this.fb.control(null),
            upperSecondarySchoolSubjectsNew: this.fb.control(null),
            upperSecondarySchoolModulesNew: this.fb.control(null),
            upperSecondarySchoolObjectivesNew: this.fb.control(null),
            upperSecondarySchoolContentsNew: this.fb.control(null),
            suitsAllUpperSecondarySubjectsNew: this.fb.control(false),
            upperSecondarySchoolFramework: this.fb.control(null, [
                Validators.maxLength(validatorParams.educationalFramework.maxLength),
                textInputValidator(),
            ]),
            newUpperSecondarySchoolFramework: this.fb.control(null, [
                Validators.maxLength(validatorParams.educationalFramework.maxLength),
                textInputValidator(),
            ]),
            vocationalDegrees: this.fb.control(null),
            suitsAllVocationalDegrees: this.fb.control(false),
            vocationalUnits: this.fb.control(null),
            vocationalRequirements: this.fb.control(null),
            vocationalCommonUnits: this.fb.control(null),
            vocationalEducationFramework: this.fb.control(null, [
                Validators.maxLength(validatorParams.educationalFramework.maxLength),
                textInputValidator(),
            ]),
            furtherVocationalQualifications: this.fb.control(null),
            specialistVocationalQualifications: this.fb.control(null),
            selfMotivatedEducationSubjects: this.fb.control(null),
            suitsAllSelfMotivatedSubjects: this.fb.control(false),
            selfMotivatedEducationObjectives: this.fb.control(null),
            branchesOfScience: this.fb.control(null),
            suitsAllBranches: this.fb.control(false),
            scienceBranchObjectives: this.fb.control(null),
            higherEducationFramework: this.fb.control(null, [
                Validators.maxLength(validatorParams.educationalFramework.maxLength),
                textInputValidator(),
            ]),
        });

        this.translate.onLangChange.subscribe(() => {
            this.setTitle();

            this.koodistoSvc.updateEducationalLevels();
            this.koodistoSvc.updateBasicStudySubjects();
            this.koodistoSvc.updateUpperSecondarySchoolSubjectsOld();
            this.koodistoSvc.updateUpperSecondarySchoolSubjectsNew();
            this.koodistoSvc.updateVocationalDegrees();
            this.koodistoSvc.updateFurtherVocationalQualifications();
            this.koodistoSvc.updateSpecialistVocationalQualifications();
            this.koodistoSvc.updateVocationalCommonUnits();
            this.koodistoSvc.updateScienceBranches();
        });

        if (sessionStorage.getItem(environment.editMaterial) === null) {
            this.form.patchValue(this.material);
        } else {
            this.form.patchValue(JSON.parse(sessionStorage.getItem(environment.editMaterial)));
        }

        if (this.educationalLevelsCtrl.value && this.educationalLevelsCtrl.value.length > 0) {
            this.educationalLevelsChange(this.educationalLevelsCtrl.value);
        }

        if (this.basicStudySubjectsCtrl.value && this.basicStudySubjectsCtrl.value.length > 0) {
            this.basicStudySubjectsChange(this.basicStudySubjectsCtrl.value);
        }

        if (
            this.upperSecondarySchoolSubjectsOldCtrl.value?.length > 0 ||
            this.upperSecondarySchoolCoursesOldCtrl.value?.length > 0
        ) {
            this.currentUpperSecondarySchoolSelected.setValue(true);
        }

        if (this.upperSecondarySchoolSubjectsOldCtrl.value?.length > 0) {
            this.upperSecondarySchoolSubjectsOldChange(this.upperSecondarySchoolSubjectsOldCtrl.value);
        }

        if (
            this.upperSecondarySchoolSubjectsNewCtrl.value &&
            this.upperSecondarySchoolSubjectsNewCtrl.value.length > 0
        ) {
            this.newUpperSecondarySchoolSelected.setValue(true);
            this.upperSecondarySchoolSubjectsNewChange(this.upperSecondarySchoolSubjectsNewCtrl.value);
        }

        if (this.upperSecondarySchoolModulesNewCtrl.value && this.upperSecondarySchoolModulesNewCtrl.value.length > 0) {
            this.upperSecondarySchoolModulesNewChange(this.upperSecondarySchoolModulesNewCtrl.value);
        }

        if (
            this.vocationalDegreesCtrl.value?.length > 0 ||
            this.furtherVocationalQualificationsCtrl.value?.length > 0 ||
            this.specialistVocationalQualificationsCtrl.value?.length > 0
        ) {
            this.vocationalDegreesChange();
        }

        if (this.vocationalUnitsCtrl.value?.length > 0) {
            this.vocationalUnitsChange(this.vocationalUnitsCtrl.value);
        }

        // educational levels
        this.educationalLevelSubscription = this.koodistoSvc.educationalLevels$.subscribe(
            (levels: EducationalLevel[]) => {
                this.educationalLevels = levels;
            },
        );
        this.koodistoSvc.updateEducationalLevels();

        // basic study subjects
        this.basicStudySubjectSubscription = this.koodistoSvc.basicStudySubjects$.subscribe(
            (subjects: AlignmentObjectExtended[]) => {
                this.basicStudySubjects = subjects;
            },
        );
        this.koodistoSvc.updateBasicStudySubjects();

        // basic study objectives
        this.basicStudyObjectiveSubscription = this.koodistoSvc.basicStudyObjectives$.subscribe(
            (objectives: AlignmentObjectExtended[]) => {
                this.basicStudyObjectives = objectives;
            },
        );

        // basic study contents
        this.basicStudyContentSubscription = this.koodistoSvc.basicStudyContents$.subscribe(
            (contents: AlignmentObjectExtended[]) => {
                this.basicStudyContents = contents;
            },
        );

        // upper secondary school subjects (old)
        this.upperSecondarySchoolSubjectOldSubscription = this.koodistoSvc.upperSecondarySchoolSubjectsOld$.subscribe(
            (subjects: AlignmentObjectExtended[]) => {
                this.upperSecondarySchoolSubjectsOld = subjects;
            },
        );
        this.koodistoSvc.updateUpperSecondarySchoolSubjectsOld();

        this.upperSecondarySchoolCourseOldSubscription = this.koodistoSvc.upperSecondarySchoolCoursesOld$.subscribe(
            (courses: AlignmentObjectExtended[]) => {
                this.upperSecondarySchoolCoursesOld = courses;
            },
        );

        // upper secondary school subjects (new)
        this.upperSecondarySchoolSubjectNewSubscription = this.koodistoSvc.upperSecondarySchoolSubjectsNew$.subscribe(
            (subjects: AlignmentObjectExtended[]) => {
                this.upperSecondarySchoolSubjectsNew = subjects;
            },
        );
        this.koodistoSvc.updateUpperSecondarySchoolSubjectsNew();

        // upper secondary school modules (new)
        this.upperSecondarySchoolModuleNewSubscription = this.koodistoSvc.upperSecondarySchoolModulesNew$.subscribe(
            (modules: AlignmentObjectExtended[]) => {
                this.upperSecondarySchoolModulesNew = modules;
            },
        );

        // upper secondary school objectives (new)
        this.upperSecondarySchoolObjectiveNewSubscription =
            this.koodistoSvc.upperSecondarySchoolObjectivesNew$.subscribe((objectives: AlignmentObjectExtended[]) => {
                this.upperSecondarySchoolObjectivesNew = objectives;
            });

        // upper secondary school contents (new)
        this.upperSecondarySchoolContentNewSubscription = this.koodistoSvc.upperSecondarySchoolContentsNew$.subscribe(
            (contents: AlignmentObjectExtended[]) => {
                this.upperSecondarySchoolContentsNew = contents;
            },
        );

        // vocational degrees
        this.vocationalDegreeSubscription = this.koodistoSvc.vocationalDegrees$.subscribe(
            (degrees: AlignmentObjectExtended[]) => {
                this.vocationalDegrees = degrees;
            },
        );
        this.koodistoSvc.updateVocationalDegrees();

        // vocational units
        this.vocationalUnitSubscription = this.koodistoSvc.vocationalUnits$.subscribe(
            (units: AlignmentObjectExtended[]) => {
                this.vocationalUnits = units;
            },
        );

        //common units
        this.vocationalCommonUnitSubscription = this.koodistoSvc.vocationalCommonUnits$.subscribe(
            (vocationalCommonUnits: AlignmentObjectExtended[]) => {
                this.vocationalCommonUnits = vocationalCommonUnits;
            },
        );
        this.koodistoSvc.updateVocationalCommonUnits();

        // vocational requirements
        this.vocationalRequirementSubscription = this.koodistoSvc.vocationalRequirements$.subscribe(
            (requirements: AlignmentObjectExtended[]) => {
                this.vocationalRequirements = requirements;
            },
        );

        // further vocational qualifications
        this.furtherVocationalQualificationSubscription = this.koodistoSvc.furtherVocationalQualifications$.subscribe(
            (qualifications: AlignmentObjectExtended[]) => {
                this.furtherVocationalQualifications = qualifications;
            },
        );
        this.koodistoSvc.updateFurtherVocationalQualifications();

        // specialist vocational qualifications
        this.specialistVocationalQualificationSubscription =
            this.koodistoSvc.specialistVocationalQualifications$.subscribe(
                (qualifications: AlignmentObjectExtended[]) => {
                    this.specialistVocationalQualifications = qualifications;
                },
            );
        this.koodistoSvc.updateSpecialistVocationalQualifications();

        // science branches
        this.scienceBranchSubscription = this.koodistoSvc.scienceBranches$.subscribe(
            (branches: AlignmentObjectExtended[]) => {
                this.scienceBranches = branches;
            },
        );
        this.koodistoSvc.updateScienceBranches();
    }

    ngOnDestroy(): void {
        if (this.submitted === false && this.form.dirty && this.form.valid) {
            this.saveData();
        }

        this.educationalLevelSubscription.unsubscribe();
        this.basicStudySubjectSubscription.unsubscribe();
        this.basicStudyObjectiveSubscription.unsubscribe();
        this.basicStudyContentSubscription.unsubscribe();
        this.upperSecondarySchoolSubjectOldSubscription.unsubscribe();
        this.upperSecondarySchoolCourseOldSubscription.unsubscribe();
        this.upperSecondarySchoolSubjectNewSubscription.unsubscribe();
        this.upperSecondarySchoolModuleNewSubscription.unsubscribe();
        this.upperSecondarySchoolObjectiveNewSubscription.unsubscribe();
        this.upperSecondarySchoolContentNewSubscription.unsubscribe();
        this.vocationalDegreeSubscription.unsubscribe();
        this.vocationalUnitSubscription.unsubscribe();
        this.vocationalCommonUnitSubscription.unsubscribe();
        this.vocationalRequirementSubscription.unsubscribe();
        this.furtherVocationalQualificationSubscription.unsubscribe();
        this.specialistVocationalQualificationSubscription.unsubscribe();
        this.scienceBranchSubscription.unsubscribe();
    }

    setTitle(): void {
        this.translate.get('titles.editMaterial').subscribe((translations: TitlesMaterialFormTabs) => {
            this.titleSvc.setTitle(`${translations.main}: ${translations.education} ${environment.title}`);
        });
    }

    get educationalLevelsCtrl(): FormControl {
        return this.form.get('educationalLevels') as FormControl;
    }

    get earlyChildhoodEducationFrameworkCtrl(): FormControl {
        return this.form.get('earlyChildhoodEducationFramework') as FormControl;
    }

    get prePrimaryEducationFrameworkCtrl(): FormControl {
        return this.form.get('prePrimaryEducationFramework') as FormControl;
    }

    get basicStudySubjectsCtrl(): FormControl {
        return this.form.get('basicStudySubjects') as FormControl;
    }

    get basicStudyFrameworkCtrl(): FormControl {
        return this.form.get('basicStudyFramework') as FormControl;
    }

    get currentUpperSecondarySchoolSelected(): FormControl {
        return this.form.get('currentUpperSecondarySchoolSelected') as FormControl;
    }

    get newUpperSecondarySchoolSelected(): FormControl {
        return this.form.get('newUpperSecondarySchoolSelected') as FormControl;
    }

    get upperSecondarySchoolSubjectsOldCtrl(): FormControl {
        return this.form.get('upperSecondarySchoolSubjectsOld') as FormControl;
    }

    get upperSecondarySchoolCoursesOldCtrl(): FormControl {
        return this.form.get('upperSecondarySchoolCoursesOld') as FormControl;
    }

    get upperSecondarySchoolFrameworkCtrl(): FormControl {
        return this.form.get('upperSecondarySchoolFramework') as FormControl;
    }

    get upperSecondarySchoolSubjectsNewCtrl(): FormControl {
        return this.form.get('upperSecondarySchoolSubjectsNew') as FormControl;
    }

    get upperSecondarySchoolModulesNewCtrl(): FormControl {
        return this.form.get('upperSecondarySchoolModulesNew') as FormControl;
    }

    get newUpperSecondarySchoolFrameworkCtrl(): FormControl {
        return this.form.get('newUpperSecondarySchoolFramework') as FormControl;
    }

    get vocationalDegreesCtrl(): FormControl {
        return this.form.get('vocationalDegrees') as FormControl;
    }

    get vocationalUnitsCtrl(): FormControl {
        return this.form.get('vocationalUnits') as FormControl;
    }

    get vocationalCommonUnitsCtrl(): FormControl {
        return this.form.get('vocationalCommonUnits') as FormControl;
    }

    get vocationalRequirementsCtrl(): FormControl {
        return this.form.get('vocationalRequirements') as FormControl;
    }

    get vocationalEducationFrameworkCtrl(): FormControl {
        return this.form.get('vocationalEducationFramework') as FormControl;
    }

    get furtherVocationalQualificationsCtrl(): FormControl {
        return this.form.get('furtherVocationalQualifications') as FormControl;
    }

    get specialistVocationalQualificationsCtrl(): FormControl {
        return this.form.get('specialistVocationalQualifications') as FormControl;
    }

    get higherEducationFrameworkCtrl(): FormControl {
        return this.form.get('higherEducationFramework') as FormControl;
    }

    /**
     * Runs on educational levels change. Sets hasX-type educational level boolean values.
     * @param value
     */
    educationalLevelsChange(value: Record<string, unknown>[]): void {
        this.hasEarlyChildhoodEducation =
            value.filter((e: any) => educationalLevelKeys.earlyChildhood.includes(e.key)).length > 0;

        this.hasPrePrimaryEducation =
            value.filter((e: any) => educationalLevelKeys.prePrimary.includes(e.key)).length > 0;

        this.hasBasicStudies = value.filter((e: any) => educationalLevelKeys.basicStudy.includes(e.key)).length > 0;

        if (this.hasBasicStudies === false) {
            this.hasBasicStudySubjects = false;
        }

        this.hasUpperSecondarySchool =
            value.filter((e: any) => educationalLevelKeys.upperSecondary.includes(e.key)).length > 0;

        this.hasVocationalEducation =
            value.filter((e: any) => educationalLevelKeys.vocational.includes(e.key)).length > 0;

        this.hasSelfMotivatedEducation =
            value.filter((e: any) => educationalLevelKeys.selfMotivated.includes(e.key)).length > 0;

        this.hasHigherEducation =
            value.filter((e: any) => educationalLevelKeys.higherEducation.includes(e.key)).length > 0;
    }

    /**
     * Runs on basic education subjects change. Sets hasBasicStudySubjects boolean value.
     * Updates basic education objectives and contents based on selected subjects.
     * @param value
     */
    basicStudySubjectsChange(value: AlignmentObjectExtended[]): void {
        this.hasBasicStudySubjects = value.length > 0;

        if (this.hasBasicStudySubjects) {
            const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',');

            this.koodistoSvc.updateBasicStudyObjectives(ids);
            this.koodistoSvc.updateBasicStudyContents(ids);
        }
    }

    /**
     * Runs on upper secondary school subject (old) change. Sets hasUpperSecondarySchoolSubjectsOld boolean
     * value. Updates upper secondary school courses based on selected subjects.
     * @param value
     */
    upperSecondarySchoolSubjectsOldChange(value: AlignmentObjectExtended[]): void {
        this.hasUpperSecondarySchoolSubjectsOld = value.length > 0;

        if (this.hasUpperSecondarySchoolSubjectsOld) {
            const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',');

            this.koodistoSvc.updateUpperSecondarySchoolCoursesOld(ids);
        }
    }

    /**
     * Runs on upper secondary school subject (new) change. Sets hasUpperSecondarySchoolSubjectsNew boolean
     * value. Updates upper secondary school modules based on selected subjects.
     * @param value
     */
    upperSecondarySchoolSubjectsNewChange(value: AlignmentObjectExtended[]): void {
        this.hasUpperSecondarySchoolSubjectsNew = value.length > 0;

        if (this.hasUpperSecondarySchoolSubjectsNew) {
            const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',');

            this.koodistoSvc.updateUpperSecondarySchoolModulesNew(ids);
        }
    }

    /**
     * Runs on upper secondary school modules change. Sets hasUpperSecondarySchoolModulesNew boolean value.
     * Updates upper secondary school objectives and contents based on selected modules.
     * @param value
     */
    upperSecondarySchoolModulesNewChange(value: AlignmentObjectExtended[]): void {
        this.hasUpperSecondarySchoolModulesNew = value.length > 0;

        if (this.hasUpperSecondarySchoolModulesNew) {
            const ids = value.map((subject: AlignmentObjectExtended) => subject.key).join(',');

            this.koodistoSvc.updateUpperSecondarySchoolObjectivesNew(ids);
            this.koodistoSvc.updateUpperSecondarySchoolContentsNew(ids);
        }
    }

    /**
     * Runs on vocational education degree change. Sets hasVocationalDegrees boolean value. Updates
     * vocational education units based on selected degrees.
     */
    vocationalDegreesChange(): void {
        const basicDegrees = this.vocationalDegreesCtrl.value;
        const furtherVocationalQualifications = this.furtherVocationalQualificationsCtrl.value;
        const specialistVocationalQualifications = this.specialistVocationalQualificationsCtrl.value;
        const degrees = basicDegrees.concat(furtherVocationalQualifications, specialistVocationalQualifications);

        this.hasVocationalDegrees = degrees.length > 0;

        if (this.hasVocationalDegrees) {
            const ids = degrees.map((degree: AlignmentObjectExtended) => degree.key).join(',');

            this.koodistoSvc.updateVocationalUnits(ids);
        }
    }

    /**
     * Runs on vocational education unit change. Sets hasVocationalUnits boolean value. Updates
     * vocational education requirements based on selected units.
     * @param value
     */
    vocationalUnitsChange(value: AlignmentObjectExtended[]): void {
        this.hasVocationalUnits = value.length > 0;

        if (this.hasVocationalUnits) {
            const ids = value.map((degree: AlignmentObjectExtended) => degree.key).join(',');

            this.koodistoSvc.updateVocationalRequirements(ids);
        }
    }

    /**
     * Runs on submit. If form is valid and dirty, changed material is saved on sessionStorage.
     * If form is valid, redirects user to the next tab.
     */
    onSubmit(): void {
        this.submitted = true;

        if (this.form.valid) {
            if (this.form.dirty) {
                this.saveData();
            }

            this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId + 1]);
        }
    }

    saveData(): void {
        const changedMaterial: EducationalMaterialForm =
            sessionStorage.getItem(environment.editMaterial) !== null
                ? JSON.parse(sessionStorage.getItem(environment.editMaterial))
                : this.material;

        changedMaterial.educationalLevels = this.educationalLevelsCtrl.value;

        // early childhood education
        changedMaterial.earlyChildhoodEducationSubjects = this.form.get('earlyChildhoodEducationSubjects').value;
        changedMaterial.suitsAllEarlyChildhoodSubjects = this.form.get('suitsAllEarlyChildhoodSubjects').value;
        changedMaterial.earlyChildhoodEducationObjectives = this.form.get('earlyChildhoodEducationObjectives').value;
        changedMaterial.earlyChildhoodEducationFramework = this.form.get('earlyChildhoodEducationFramework').value;

        // pre-primary education
        changedMaterial.prePrimaryEducationSubjects = this.form.get('prePrimaryEducationSubjects').value;
        changedMaterial.suitsAllPrePrimarySubjects = this.form.get('suitsAllPrePrimarySubjects').value;
        changedMaterial.prePrimaryEducationObjectives = this.form.get('prePrimaryEducationObjectives').value;
        changedMaterial.prePrimaryEducationFramework = this.form.get('prePrimaryEducationFramework').value;

        // basic education
        changedMaterial.basicStudySubjects = this.basicStudySubjectsCtrl.value;
        changedMaterial.suitsAllBasicStudySubjects = this.form.get('suitsAllBasicStudySubjects').value;
        changedMaterial.basicStudyObjectives = this.form.get('basicStudyObjectives').value;
        changedMaterial.basicStudyContents = this.form.get('basicStudyContents').value;
        changedMaterial.basicStudyFramework = this.form.get('basicStudyFramework').value;

        // upper secondary school
        changedMaterial.upperSecondarySchoolSubjectsOld = this.upperSecondarySchoolSubjectsOldCtrl.value;
        changedMaterial.upperSecondarySchoolCoursesOld = this.upperSecondarySchoolCoursesOldCtrl.value;
        changedMaterial.suitsAllUpperSecondarySubjects = this.form.get('suitsAllUpperSecondarySubjects').value;
        changedMaterial.upperSecondarySchoolObjectives = this.form.get('upperSecondarySchoolObjectives').value;
        changedMaterial.upperSecondarySchoolFramework = this.form.get('upperSecondarySchoolFramework').value;
        changedMaterial.upperSecondarySchoolSubjectsNew = this.upperSecondarySchoolSubjectsNewCtrl.value;
        changedMaterial.suitsAllUpperSecondarySubjectsNew = this.form.get('suitsAllUpperSecondarySubjectsNew').value;
        changedMaterial.upperSecondarySchoolModulesNew = this.upperSecondarySchoolModulesNewCtrl.value;
        changedMaterial.upperSecondarySchoolObjectivesNew = this.form.get('upperSecondarySchoolObjectivesNew').value;
        changedMaterial.upperSecondarySchoolContentsNew = this.form.get('upperSecondarySchoolContentsNew').value;
        changedMaterial.newUpperSecondarySchoolFramework = this.form.get('newUpperSecondarySchoolFramework').value;

        // vocational education
        changedMaterial.vocationalDegrees = this.vocationalDegreesCtrl.value;
        changedMaterial.suitsAllVocationalDegrees = this.form.get('suitsAllVocationalDegrees').value;
        changedMaterial.vocationalUnits = this.vocationalUnitsCtrl.value;
        changedMaterial.vocationalCommonUnits = this.vocationalCommonUnitsCtrl.value;
        changedMaterial.vocationalRequirements = this.vocationalRequirementsCtrl.value;
        changedMaterial.vocationalEducationFramework = this.form.get('vocationalEducationFramework').value;
        changedMaterial.furtherVocationalQualifications = this.furtherVocationalQualificationsCtrl.value;
        changedMaterial.specialistVocationalQualifications = this.specialistVocationalQualificationsCtrl.value;

        // self-motivated competence development
        changedMaterial.selfMotivatedEducationSubjects = this.form.get('selfMotivatedEducationSubjects').value;
        changedMaterial.suitsAllSelfMotivatedSubjects = this.form.get('suitsAllSelfMotivatedSubjects').value;
        changedMaterial.selfMotivatedEducationObjectives = this.form.get('selfMotivatedEducationObjectives').value;

        // higher education
        changedMaterial.branchesOfScience = this.form.get('branchesOfScience').value;
        changedMaterial.suitsAllBranches = this.form.get('suitsAllBranches').value;
        changedMaterial.scienceBranchObjectives = this.form.get('scienceBranchObjectives').value;
        changedMaterial.higherEducationFramework = this.form.get('higherEducationFramework').value;

        sessionStorage.setItem(environment.editMaterial, JSON.stringify(changedMaterial));
    }

    /**
     * Emits EventEmitter indicating user wants to abort.
     */
    abort(): void {
        this.abortEdit.emit();
    }

    /**
     * Redirects user to previous tab.
     */
    previous(): void {
        this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, this.tabId - 1]);
    }
}
