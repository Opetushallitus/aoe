import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '../../environments/environment';
import { EducationalMaterial } from '../models/educational-material';
import { EducationalMaterialCard } from '../models/educational-material-card';
import { AlignmentObjectExtended } from '../models/alignment-object-extended';
import { UploadedFile } from '../models/uploaded-file';
import { koodistoSources } from '../constants/koodisto-sources';
import { Attachment } from '../models/backend/attachment';
import { EducationalMaterialForm } from '../models/educational-material-form';
import { License } from '../models/koodisto/license';
import { deduplicate, getUniqueFrameworks } from '../shared/shared.module';

@Injectable({
    providedIn: 'root',
})
export class EmbedService {
    constructor(private http: HttpClient, private translate: TranslateService) {}
    apiUri = environment.koodistoUrl;
    httpOptions = {
        headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }),
    };

    lang: string = this.translate.currentLang;

    public material$ = new Subject<EducationalMaterial>();
    public uploadedFiles$ = new Subject<UploadedFile[]>();
    public editMaterial$ = new Subject<EducationalMaterialForm | null>();
    public publishedUserMaterials$ = new Subject<EducationalMaterialCard[]>();
    public unpublishedUserMaterials$ = new Subject<EducationalMaterialCard[]>();
    public licenses$ = new Subject<License[]>();

    private handleError = (error: HttpErrorResponse, subject$: Subject<any>): Observable<never> => {
        switch (error.status) {
            case 404:
                subject$.next([]);
                break;

            default:
                console.error(error);
                return throwError('Something bad happened; please try again later.');
        }
    };

    /**
     * Updates material.
     * @param {number} materialId
     * @param {string} versionDate?
     */
    updateMaterial(materialId: number, versionDate?: string): void {
        let materialUrl = `${environment.embedBackendUrl}/material/${materialId}`;

        if (versionDate) {
            materialUrl = `${materialUrl}/${versionDate}`;
        }

        this.http
            .get<any>(materialUrl, {
                headers: new HttpHeaders({
                    Accept: 'application/json',
                }),
            })
            .subscribe((material) => {
                if (JSON.stringify(material) === '{}') {
                    this.material$.next(material);
                } else {
                    const alignmentObjects: AlignmentObjectExtended[] = material.educationalAlignment
                        // eslint-disable-next-line max-len
                        .map(({ objectkey, source, alignmenttype, educationalframework, targetname }) => ({
                            key: objectkey,
                            source: source,
                            alignmentType: alignmenttype,
                            educationalFramework: educationalframework,
                            targetName: targetname,
                        }));

                    const materials = material.materials.map((m) => ({
                        id: m.id,
                        language: m.language,
                        priority: m.priority,
                        filepath: m.filepath,
                        originalfilename: m.originalfilename,
                        filekey: m.filekey,
                        link: m.link,
                        mimetype: m.mimetype,
                        displayName: m.displayName,
                        subtitles: material.attachments
                            .filter((a: Attachment) => a.materialid === m.id)
                            .map((a: Attachment) => ({
                                src: `${environment.backendUrl}/download/${a.filekey}`,
                                default: a.defaultfile,
                                kind: a.kind,
                                label: a.label,
                                srclang: a.srclang,
                            })),
                        downloadUrl: `${environment.embedBackendUrl}/download/${m.filekey}`,
                    }));

                    // early childhood
                    const earlyChildhoodEducationSubjects: AlignmentObjectExtended[] = alignmentObjects.filter(
                        (alignmentObject: AlignmentObjectExtended) =>
                            alignmentObject.source === koodistoSources.earlyChildhoodSubjects,
                    );

                    // pre-primary
                    const prePrimaryEducationSubjects: AlignmentObjectExtended[] = alignmentObjects.filter(
                        (alignmentObject: AlignmentObjectExtended) =>
                            alignmentObject.source === koodistoSources.prePrimarySubjects,
                    );

                    // basic education
                    const basicStudySubjects: AlignmentObjectExtended[] = alignmentObjects.filter(
                        (alignmentObject: AlignmentObjectExtended) =>
                            alignmentObject.source === koodistoSources.basicStudySubjects,
                    );

                    // old upper-secondary education
                    const upperSecondarySchoolSubjectsOld: AlignmentObjectExtended[] = alignmentObjects.filter(
                        (alignmentObject: AlignmentObjectExtended) =>
                            alignmentObject.source === koodistoSources.upperSecondarySubjectsOld,
                    );

                    // new upper-secondary education
                    const upperSecondarySchoolSubjectsNew: AlignmentObjectExtended[] = alignmentObjects.filter(
                        (alignmentObject: AlignmentObjectExtended) =>
                            alignmentObject.source === koodistoSources.upperSecondarySubjectsNew,
                    );

                    // vocational education
                    const vocationalDegrees: AlignmentObjectExtended[] = alignmentObjects.filter(
                        (alignmentObject: AlignmentObjectExtended) =>
                            alignmentObject.source === koodistoSources.vocationalDegrees ||
                            alignmentObject.source === koodistoSources.furtherVocationalQualifications ||
                            alignmentObject.source === koodistoSources.specialistVocationalQualifications,
                    );

                    // higher education
                    const scienceBranches: AlignmentObjectExtended[] = alignmentObjects.filter(
                        (alignmentObject: AlignmentObjectExtended) =>
                            alignmentObject.source === koodistoSources.scienceBranches,
                    );

                    this.material$.next({
                        name: material.name,
                        thumbnail: material.thumbnail
                            ? material.thumbnail.filepath
                            : `assets/img/thumbnails/${material.learningResourceTypes[0].learningresourcetypekey}.png`,
                        learningResourceTypes: material.learningResourceTypes.map(
                            ({ learningresourcetypekey, value }) => ({
                                learningresourcetypekey,
                                value,
                            }),
                        ),
                        authors: material.author.map(({ authorname, organization }) => ({ authorname, organization })),
                        description: material.description,
                        materials: deduplicate(materials, 'id'),
                        createdAt: material.createdAt,
                        publishedAt: material.publishedAt,
                        updatedAt: material.updatedAt,
                        archivedAt: material.archivedAt,
                        timeRequired: material.timeRequired,
                        expires: material.expires !== '9999-01-01T00:00:00.000Z' ? material.expires : null,
                        publisher: material.publisher.map((publisher) => publisher.name),
                        license: material.license,
                        keywords: material.keywords.map(({ keywordkey, value }) => ({ keywordkey, value })),
                        educationalLevels: material.educationalLevels.map(({ educationallevelkey, value }) => ({
                            educationallevelkey,
                            value,
                        })),
                        educationalRoles: material.educationalRoles.map(({ educationalrolekey, educationalrole }) => ({
                            educationalrolekey,
                            educationalrole,
                        })),
                        educationalUses: material.educationalUses.map(({ educationalusekey, value }) => ({
                            educationalusekey,
                            value,
                        })),
                        accessibilityFeatures: material.accessibilityFeatures.map(
                            ({ accessibilityfeaturekey, value }) => ({
                                accessibilityfeaturekey,
                                value,
                            }),
                        ),
                        accessibilityHazards: material.accessibilityHazards.map(
                            ({ accessibilityhazardkey, value }) => ({
                                accessibilityhazardkey,
                                value,
                            }),
                        ),
                        earlyChildhoodEducationSubjects: earlyChildhoodEducationSubjects,
                        earlyChildhoodEducationFrameworks: getUniqueFrameworks(earlyChildhoodEducationSubjects),
                        earlyChildhoodEducationObjectives: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.earlyChildhoodObjectives,
                        ),
                        suitsAllEarlyChildhoodSubjects: material.suitsAllEarlyChildhoodSubjects,
                        prePrimaryEducationSubjects: prePrimaryEducationSubjects,
                        prePrimaryEducationFrameworks: getUniqueFrameworks(prePrimaryEducationSubjects),
                        prePrimaryEducationObjectives: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.prePrimaryObjectives,
                        ),
                        suitsAllPrePrimarySubjects: material.suitsAllPrePrimarySubjects,
                        basicStudySubjects: basicStudySubjects,
                        basicStudyFrameworks: getUniqueFrameworks(basicStudySubjects),
                        basicStudyObjectives: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.basicStudyObjectives,
                        ),
                        basicStudyContents: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.basicStudyContents,
                        ),
                        suitsAllBasicStudySubjects: material.suitsAllBasicStudySubjects,
                        upperSecondarySchoolSubjectsOld: upperSecondarySchoolSubjectsOld,
                        upperSecondarySchoolFrameworks: getUniqueFrameworks(upperSecondarySchoolSubjectsOld),
                        upperSecondarySchoolCoursesOld: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.upperSecondaryCoursesOld ||
                                alignmentObject.source === koodistoSources.upperSecondarySubjects,
                        ),
                        upperSecondarySchoolObjectives: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.upperSecondaryObjectives,
                        ),
                        suitsAllUpperSecondarySubjects: material.suitsAllUpperSecondarySubjects,
                        upperSecondarySchoolSubjectsNew: upperSecondarySchoolSubjectsNew,
                        newUpperSecondarySchoolFrameworks: getUniqueFrameworks(upperSecondarySchoolSubjectsNew),
                        upperSecondarySchoolModulesNew: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.upperSecondaryModulesNew,
                        ),
                        upperSecondarySchoolObjectivesNew: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.upperSecondaryObjectivesNew,
                        ),
                        upperSecondarySchoolContentsNew: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.upperSecondaryContentsNew,
                        ),
                        suitsAllUpperSecondarySubjectsNew: material.suitsAllUpperSecondarySubjectsNew,
                        vocationalDegrees: vocationalDegrees,
                        vocationalFrameworks: getUniqueFrameworks(vocationalDegrees),
                        vocationalUnits: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.vocationalUnits,
                        ),
                        vocationalCommonUnits: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.subjectOfCommonUnit,
                        ),
                        vocationalRequirements: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.vocationalRequirements,
                        ),
                        suitsAllVocationalDegrees: material.suitsAllVocationalDegrees,
                        selfMotivatedEducationSubjects: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.selfMotivatedSubjects,
                        ),
                        selfMotivatedEducationObjectives: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.selfMotivatedObjectives,
                        ),
                        suitsAllSelfMotivatedSubjects: material.suitsAllSelfMotivatedSubjects,
                        branchesOfScience: scienceBranches,
                        higherEducationFrameworks: getUniqueFrameworks(scienceBranches),
                        scienceBranchObjectives: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.scienceBranchObjectives,
                        ),
                        suitsAllBranches: material.suitsAllBranches,
                        prerequisites: alignmentObjects.filter(
                            (alignmentObject: AlignmentObjectExtended) =>
                                alignmentObject.source === koodistoSources.prerequisites,
                        ),
                        references: material.isBasedOn.map((r) => ({
                            authors: r.author.map((author) => author.authorname),
                            url: r.url,
                            name: r.materialname,
                        })),
                        owner: material.owner,
                        ratingContentAverage: material.ratingContentAverage,
                        ratingVisualAverage: material.ratingVisualAverage,
                        hasDownloadableFiles: material.hasDownloadableFiles,
                        versions: material.versions.map((version) => version.publishedat).sort((a, b) => a - b),
                        viewCounter: +material.viewCounter,
                        downloadCounter: +material.downloadCounter,
                        typicalAgeRange: material.typicalAgeRange,
                        urn: material.urn,
                    });
                }
            });
    }

    /**
     * Updates licenses.
     */
    updateLicenses(): void {
        const lang = this.translate.currentLang;

        this.http.get<License[]>(`${this.apiUri}/lisenssit/${lang}`, this.httpOptions).subscribe(
            (licenses: License[]) => {
                this.licenses$.next(licenses.map((license) => ({ ...license, isCollapsed: true })));
            },
            (error: HttpErrorResponse) => this.handleError(error, this.licenses$),
        );
    }
}
