import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { catchError, concatMap, delay, map, mergeMap, retryWhen, take, takeLast, tap, toArray } from 'rxjs/operators';
import { BehaviorSubject, EMPTY, from, Observable, of, Subject, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '@environments/environment';
import { deduplicate, getUniqueFrameworks } from '@shared/shared.module';
import { EducationalMaterial } from '@models/educational-material';
import { UploadMessage } from '@models/upload-message';
import { EducationalMaterialCard } from '@models/educational-material-card';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { UploadedFile } from '@models/uploaded-file';
import { Attachment } from '@models/backend/attachment';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { EducationalMaterialPut } from '@models/educational-material-put';
import { LinkPostResponse } from '@models/link-post-response';
import { LinkPost } from '@models/link-post';
import { AttachmentPostResponse } from '@models/attachment-post-response';
import { Material } from '@models/material';
import { UploadImageBody } from '@models/material/upload-image-body';
import { koodistoSources } from '@constants/koodisto-sources';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private educationalMaterialEditForm$$: BehaviorSubject<EducationalMaterialForm | null> =
    new BehaviorSubject<EducationalMaterialForm | null>(null);
  private educationalMaterialID$$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private uploadedFiles$$: BehaviorSubject<UploadedFile[] | null> = new BehaviorSubject<UploadedFile[] | null>(null);
  private uploadResponses$$: BehaviorSubject<UploadMessage[]> = new BehaviorSubject<UploadMessage[]>([]);

  public lang: string = this.translate.currentLang;
  public material$$: Subject<EducationalMaterial> = new Subject<EducationalMaterial>();
  public uploadedFiles$: Observable<UploadedFile[] | null> = this.uploadedFiles$$.asObservable();
  public uploadResponses$: Observable<UploadMessage[]> = this.uploadResponses$$.asObservable();
  public educationalMaterialEditForm$: Observable<EducationalMaterialForm | null> =
    this.educationalMaterialEditForm$$.asObservable();
  public educationalMaterialID$: Observable<number> = this.educationalMaterialID$$
    .asObservable()
    .pipe(map((id: string | null) => (id !== null ? +id : 0)));
  public publishedUserMaterials$$: Subject<EducationalMaterialCard[]> = new Subject<EducationalMaterialCard[]>();
  public unpublishedUserMaterials$$: Subject<EducationalMaterialCard[]> = new Subject<EducationalMaterialCard[]>();

  constructor(private http: HttpClient, private translate: TranslateService) {}

  private static handleError(err: HttpErrorResponse) {
    return throwError(`Something bad happened - please try again later: ${err}`);
  }

  clearEducationalMaterialEditForm(): void {
    this.educationalMaterialEditForm$$.next(null);
  }

  clearEducationalMaterialID(): void {
    this.educationalMaterialID$$.next(null);
  }

  clearUploadedFiles(): void {
    this.uploadedFiles$$.next(null);
  }

  clearUploadResponses(): void {
    this.uploadResponses$$.next([]);
  }

  getEducationalMaterialEditForm(): EducationalMaterialForm | null {
    return this.educationalMaterialEditForm$$.getValue();
  }

  setEducationalMaterialEditForm(educationalMaterialForm: EducationalMaterialForm): void {
    this.educationalMaterialEditForm$$.next(educationalMaterialForm);
  }

  getEducationalMaterialID(): string | null {
    return this.educationalMaterialID$$.getValue();
  }

  setEducationalMaterialID(id: string): void {
    this.educationalMaterialID$$.next(id);
  }

  getUploadedFiles(): UploadedFile[] | null {
    return this.uploadedFiles$$.getValue();
  }

  getUploadResponses(): UploadMessage[] {
    return this.uploadResponses$$.getValue();
  }

  /**
   * Generic function to run concurrently multiple upload tasks defined as observables.
   * @param tasks {{ observable: Observable<any>; metadata: any }[]}
   * @param completedIndexes
   */
  runConcurrentTasks(
    tasks: { observable: Observable<any>; metadata: any }[],
    completedIndexes: Set<number>,
  ): Observable<{ results: UploadMessage; metadata: any }[]> {
    return from(tasks).pipe(
      // delay(2000),
      concatMap(
        (task: { observable: Observable<any>; metadata: any }, index: number): Observable<any> =>
          completedIndexes.has(index)
            ? EMPTY // Optionally NEVER - subscription callback not invoked.
            : task.observable.pipe(
                tap((um: UploadMessage): void => {
                  this.uploadResponses$$.getValue()[index] = um;
                }),
                takeLast(1),
                map((um: UploadMessage): { results: any; metadata: UploadMessage } => ({
                  results: um,
                  metadata: task.metadata,
                })),
                catchError(() =>
                  of({
                    results: { status: 'progress', message: 'Failed', visible: true },
                    metadata: task.metadata,
                  }),
                ),
              ),
      ),
      toArray(),
    );
  }

  /**
   * Save link materials to an educational material.
   * @param data
   */
  postLinks(data: LinkPost): Observable<any> {
    return this.http
      .post<any>(`${environment.backendUrlV2}/material/link/${this.educationalMaterialID$$.getValue()}`, data, {
        headers: new HttpHeaders({ Accept: 'application/json' }),
      })
      .pipe(
        map((response: any): { message: number; status: string; visible: boolean; statusHTTP: number } => ({
          status: 'completed',
          message: 100,
          visible: true,
          statusHTTP: response.status,
        })),
        catchError((err) => of({ status: 'error', message: 100, visible: true, statusHTTP: err.status })),
      );
  }

  postLink(payload: LinkPost, educationalMaterialID: number): Observable<LinkPostResponse> {
    return this.http
      .post<LinkPostResponse>(`${environment.backendUrlV2}/material/link/${educationalMaterialID}`, payload, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      })
      .pipe(catchError(MaterialService.handleError));
  }


  createEmptyEducationalMaterial(formData: FormData): Observable<string> {
    return this.http
      .post<string>(`${environment.backendUrl}/material/file`, formData, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      })
      .pipe(map((response: any): string => response.id));
  }

  /**
   * @param {FormData} data
   * @returns {Observable<UploadMessage>} Upload message
   */
  uploadSingleFileToEducationalMaterial(data: FormData): Observable<UploadMessage> {
    const uploadUrl: string = `${
      environment.backendUrlV2
    }/material/file/${this.educationalMaterialID$$.getValue()}/upload`;
    let prevProgress: number = 0;
    let nextProgress: number = 0;
    return this.http
      .post<FormData>(uploadUrl, data, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event: HttpEvent<any>) => {
          prevProgress = nextProgress;
          switch (event.type) {
            case HttpEventType.UploadProgress:
              nextProgress = Math.round((100 * event.loaded) / event.total);
              return { status: 'progress', message: prevProgress, visible: true };
            case HttpEventType.Response:
              return {
                status: 'completed',
                message: prevProgress,
                response: event.body,
                visible: true,
                statusHTTP: event.status,
              };
          }
        }),
        // retryWhen((errors: Observable<any>) =>
        //   errors.pipe(
        //     delay(1000),
        //     tap((err): void => {
        //       console.log('Retry after an error:', err);
        //     }),
        //     take(1), // 1 extra trial after the original request.
        //     mergeMap((error) => throwError(error)),
        //   ),
        // ),
        // timeout(3000),
        catchError((err) => of({ status: 'error', message: prevProgress, visible: true, statusHTTP: err.status })),
      );
  }

  uploadSubtitle(fileId: string, data: FormData): Observable<AttachmentPostResponse> {
    return this.http
      .post<AttachmentPostResponse>(`${environment.backendUrl}/material/attachment/${fileId}`, data, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      })
      .pipe(
        retryWhen((errors: Observable<any>) =>
          errors.pipe(
            delay(3000),
            tap((errors): void => {
              console.log('Retry attachment upload:', errors);
            }),
            take(2), // 2 extra trials after the original request.
            mergeMap((error) => throwError(error)),
          ),
        ),
        catchError(MaterialService.handleError),
      );
  }

  /**
   * Posts meta data to backend by material ID.
   * @param {number} educationalMateriaID
   * @param {EducationalMaterialPut} data
   */
  updateEducationalMaterialMetadata(
    educationalMateriaID: number | string,
    data: EducationalMaterialPut,
  ): Observable<any> {
    const uploadUrl = `${environment.backendUrl}/material/${educationalMateriaID}`;
    return this.http.put(uploadUrl, data).pipe(catchError(MaterialService.handleError));
  }

  /**
   * Updates material.
   * @param {number} materialId
   * @param {string} versionDate?
   */
  updateMaterial(materialId: number, versionDate?: string): void {
    let materialUrl: string = `${environment.backendUrl}/material/${materialId}`;
    if (versionDate) {
      materialUrl = `${materialUrl}/${versionDate}?interaction=view`;
    } else {
      materialUrl = `${materialUrl}?interaction=view`;
    }
    this.http
      .get<any>(materialUrl, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      })
      .subscribe((material): void => {
        if (JSON.stringify(material) === '{}') {
          this.material$$.next(material);
        } else {
          const alignmentObjects: AlignmentObjectExtended[] = material.educationalAlignment
            // eslint-disable-next-line max-len
            .map(
              ({
                objectkey,
                source,
                alignmenttype,
                educationalframework,
                targetname,
              }): { alignmentType: any; educationalFramework: any; key: any; source: any; targetName: any } => ({
                key: objectkey,
                source: source,
                alignmentType: alignmenttype,
                educationalFramework: educationalframework,
                targetName: targetname,
              }),
            );
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
              .filter((a: Attachment): boolean => a.materialid === m.id)
              .map(
                (a: Attachment): { default: boolean; kind: string; label: string; src: string; srclang: string } => ({
                  src: `${environment.backendUrl}/download/${a.filekey}`,
                  default: a.defaultfile,
                  kind: a.kind,
                  label: a.label,
                  srclang: a.srclang,
                }),
              ),
            downloadUrl: `${environment.backendUrl}/download/file/${m.filekey}?interaction=load`,
          }));

          // early childhood
          const earlyChildhoodEducationSubjects: AlignmentObjectExtended[] = alignmentObjects.filter(
            (alignmentObject: AlignmentObjectExtended): boolean =>
              alignmentObject.source === koodistoSources.earlyChildhoodSubjects,
          );

          // pre-primary
          const prePrimaryEducationSubjects: AlignmentObjectExtended[] = alignmentObjects.filter(
            (alignmentObject: AlignmentObjectExtended): boolean =>
              alignmentObject.source === koodistoSources.prePrimarySubjects,
          );

          // basic education
          const basicStudySubjects: AlignmentObjectExtended[] = alignmentObjects.filter(
            (alignmentObject: AlignmentObjectExtended): boolean =>
              alignmentObject.source === koodistoSources.basicStudySubjects,
          );

          // old upper-secondary education
          const upperSecondarySchoolSubjectsOld: AlignmentObjectExtended[] = alignmentObjects.filter(
            (alignmentObject: AlignmentObjectExtended): boolean =>
              alignmentObject.source === koodistoSources.upperSecondarySubjectsOld,
          );

          // new upper-secondary education
          const upperSecondarySchoolSubjectsNew: AlignmentObjectExtended[] = alignmentObjects.filter(
            (alignmentObject: AlignmentObjectExtended): boolean =>
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
            (alignmentObject: AlignmentObjectExtended): boolean =>
              alignmentObject.source === koodistoSources.scienceBranches,
          );

          this.material$$.next({
            name: material.name,
            thumbnail: material.thumbnail
              ? material.thumbnail.filepath
              : `assets/img/thumbnails/${material.learningResourceTypes[0].learningresourcetypekey}.png`,
            learningResourceTypes: material.learningResourceTypes.map(
              ({ learningresourcetypekey, value }): { learningresourcetypekey: any; value: any } => ({
                learningresourcetypekey,
                value,
              }),
            ),
            authors: material.author.map(({ authorname, organization }): { authorname: any; organization: any } => ({
              authorname,
              organization,
            })),
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
            keywords: material.keywords.map(({ keywordkey, value }): { keywordkey: any; value: any } => ({
              keywordkey,
              value,
            })),
            educationalLevels: material.educationalLevels.map(
              ({ educationallevelkey, value }): { educationallevelkey: any; value: any } => ({
                educationallevelkey,
                value,
              }),
            ),
            educationalRoles: material.educationalRoles.map(
              ({ educationalrolekey, educationalrole }): { educationalrole: any; educationalrolekey: any } => ({
                educationalrolekey,
                educationalrole,
              }),
            ),
            educationalUses: material.educationalUses.map(
              ({ educationalusekey, value }): { educationalusekey: any; value: any } => ({
                educationalusekey,
                value,
              }),
            ),
            accessibilityFeatures: material.accessibilityFeatures.map(
              ({ accessibilityfeaturekey, value }): { accessibilityfeaturekey: any; value: any } => ({
                accessibilityfeaturekey,
                value,
              }),
            ),
            accessibilityHazards: material.accessibilityHazards.map(
              ({ accessibilityhazardkey, value }): { accessibilityhazardkey: any; value: any } => ({
                accessibilityhazardkey,
                value,
              }),
            ),
            earlyChildhoodEducationSubjects: earlyChildhoodEducationSubjects,
            earlyChildhoodEducationFrameworks: getUniqueFrameworks(earlyChildhoodEducationSubjects),
            earlyChildhoodEducationObjectives: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.earlyChildhoodObjectives,
            ),
            suitsAllEarlyChildhoodSubjects: material.suitsAllEarlyChildhoodSubjects,
            prePrimaryEducationSubjects: prePrimaryEducationSubjects,
            prePrimaryEducationFrameworks: getUniqueFrameworks(prePrimaryEducationSubjects),
            prePrimaryEducationObjectives: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.prePrimaryObjectives,
            ),
            suitsAllPrePrimarySubjects: material.suitsAllPrePrimarySubjects,
            basicStudySubjects: basicStudySubjects,
            basicStudyFrameworks: getUniqueFrameworks(basicStudySubjects),
            basicStudyObjectives: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.basicStudyObjectives,
            ),
            basicStudyContents: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.basicStudyContents,
            ),
            suitsAllBasicStudySubjects: material.suitsAllBasicStudySubjects,
            preparatoryEducationSubjects: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.preparatoryEducationSubjects,
            ),
            preparatoryEducationObjectives: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.preparatoryEducationObjectives,
            ),
            upperSecondarySchoolSubjectsOld: upperSecondarySchoolSubjectsOld,
            upperSecondarySchoolFrameworks: getUniqueFrameworks(upperSecondarySchoolSubjectsOld),
            upperSecondarySchoolCoursesOld: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended) =>
                alignmentObject.source === koodistoSources.upperSecondaryCoursesOld ||
                alignmentObject.source === koodistoSources.upperSecondarySubjects,
            ),
            upperSecondarySchoolObjectives: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.upperSecondaryObjectives,
            ),
            suitsAllUpperSecondarySubjects: material.suitsAllUpperSecondarySubjects,
            upperSecondarySchoolSubjectsNew: upperSecondarySchoolSubjectsNew,
            newUpperSecondarySchoolFrameworks: getUniqueFrameworks(upperSecondarySchoolSubjectsNew),
            upperSecondarySchoolModulesNew: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.upperSecondaryModulesNew,
            ),
            upperSecondarySchoolObjectivesNew: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.upperSecondaryObjectivesNew,
            ),
            upperSecondarySchoolContentsNew: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.upperSecondaryContentsNew,
            ),
            suitsAllUpperSecondarySubjectsNew: material.suitsAllUpperSecondarySubjectsNew,
            vocationalDegrees: vocationalDegrees,
            vocationalFrameworks: getUniqueFrameworks(vocationalDegrees),
            vocationalUnits: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.vocationalUnits,
            ),
            vocationalCommonUnits: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.subjectOfCommonUnit,
            ),
            vocationalRequirements: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.vocationalRequirements,
            ),
            suitsAllVocationalDegrees: material.suitsAllVocationalDegrees,
            selfMotivatedEducationSubjects: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.selfMotivatedSubjects,
            ),
            selfMotivatedEducationObjectives: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.selfMotivatedObjectives,
            ),
            suitsAllSelfMotivatedSubjects: material.suitsAllSelfMotivatedSubjects,
            branchesOfScience: scienceBranches,
            higherEducationFrameworks: getUniqueFrameworks(scienceBranches),
            scienceBranchObjectives: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.scienceBranchObjectives,
            ),
            suitsAllBranches: material.suitsAllBranches,
            prerequisites: alignmentObjects.filter(
              (alignmentObject: AlignmentObjectExtended): boolean =>
                alignmentObject.source === koodistoSources.prerequisites,
            ),
            references: material.isBasedOn.map((r): { authors: any; name: any; url: any } => ({
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
   * Updates list of educational materials created by user.
   */
  updateUserMaterialList(): void {
    this.http
      .get<any>(`${environment.backendUrl}/usermaterial`, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      })
      .subscribe((materials): void => {
        const published: EducationalMaterialCard[] = [];
        const unpublished: EducationalMaterialCard[] = [];
        materials.forEach((material): void => {
          const mappedMaterial: EducationalMaterialCard = {
            id: material.id,
            name:
              material.name.length > 0
                ? {
                    fi: material.name.find((row): boolean => row.language === 'fi').materialname,
                    sv: material.name.find((row): boolean => row.language === 'sv').materialname,
                    en: material.name.find((row): boolean => row.language === 'en').materialname,
                  }
                : null,
            thumbnail: material.thumbnail
              ? material.thumbnail.thumbnail
              : material.learningResourceTypes.length > 0
              ? `assets/img/thumbnails/${material.learningResourceTypes[0].learningresourcetypekey}.png`
              : 'assets/img/material.png',
            learningResourceTypes: material.learningResourceTypes.map(
              ({ learningresourcetypekey, value }): { learningresourcetypekey: any; value: any } => ({
                learningresourcetypekey,
                value,
              }),
            ),
            authors: material.authors.map(({ authorname, organization }): { authorname: any; organization: any } => ({
              authorname,
              organization,
            })),
            description:
              material.description.length > 0
                ? {
                    fi: material.description.find((row): boolean => row.language === 'fi').description,
                    sv: material.description.find((row): boolean => row.language === 'sv').description,
                    en: material.description.find((row): boolean => row.language === 'en').description,
                  }
                : null,
            license: material.license,
            keywords: material.keywords.map(({ keywordkey, value }): { keywordkey: any; value: any } => ({
              keywordkey,
              value,
            })),
            educationalLevels: material.educationalLevels.map(
              ({ educationallevelkey, value }): { educationallevelkey: any; value: any } => ({
                educationallevelkey,
                value,
              }),
            ),
            publishedAt: material.publishedat,
            expires: material.expires,
            viewCounter: material.viewcounter,
            downloadCounter: material.downloadcounter,
          };
          if (mappedMaterial.publishedAt === null) {
            unpublished.push(mappedMaterial);
          } else {
            published.push(mappedMaterial);
          }
        });
        published.sort((a: EducationalMaterialCard, b: EducationalMaterialCard) => b.id - a.id);
        unpublished.sort((a: EducationalMaterialCard, b: EducationalMaterialCard) => b.id - a.id);
        this.publishedUserMaterials$$.next(published);
        this.unpublishedUserMaterials$$.next(unpublished);
      });
  }

  getRecentMaterialList(): Observable<EducationalMaterialCard[]> {
    return this.http
      .get<any>(`${environment.backendUrl}/recentmaterial`, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      })
      .pipe(
        map((res): EducationalMaterialCard[] =>
          res
            .filter((r): boolean => r.name.length > 0)
            .map((r) => ({
              id: r.id,
              name:
                r.name.length > 0
                  ? {
                      fi: r.name.find((row): boolean => row.language === 'fi').materialname,
                      sv: r.name.find((row): boolean => row.language === 'sv').materialname,
                      en: r.name.find((row): boolean => row.language === 'en').materialname,
                    }
                  : null,
              thumbnail: r.thumbnail
                ? r.thumbnail.thumbnail
                : `assets/img/thumbnails/${r.learningResourceTypes[0].learningresourcetypekey}.png`,
              learningResourceTypes: r.learningResourceTypes.map(
                ({ learningresourcetypekey, value }): { learningresourcetypekey: any; value: any } => ({
                  learningresourcetypekey,
                  value,
                }),
              ),
              authors: r.authors.map(({ authorname, organization }): { authorname: any; organization: any } => ({
                authorname,
                organization,
              })),
              description:
                r.description.length > 0
                  ? {
                      fi: r.description.find((row): boolean => row.language === 'fi').description,
                      sv: r.description.find((row): boolean => row.language === 'sv').description,
                      en: r.description.find((row): boolean => row.language === 'en').description,
                    }
                  : null,
              license: r.license,
              keywords: r.keywords.map(({ keywordkey, value }): { keywordkey: any; value: any } => ({
                keywordkey,
                value,
              })),
              educationalLevels: r.educationalLevels.map(
                ({ educationallevelkey, value }): { educationallevelkey: any; value: any } => ({
                  educationallevelkey,
                  value,
                }),
              ),
            })),
        ),
        catchError(MaterialService.handleError),
      );
  }

  /**
   * Upload thumbnail image for educational material to backend.
   * @param {string} base64Image
   * @param educationalMaterialID
   * @returns {Observable<UploadMessage>} Upload message
   */
  uploadImage(base64Image: string, educationalMaterialID?: number | string | null): Observable<UploadMessage> {
    const body: UploadImageBody = { base64image: base64Image };
    educationalMaterialID = educationalMaterialID ?? this.educationalMaterialID$$.getValue() ?? null;
    if (educationalMaterialID) {
      return this.http
        .post<UploadImageBody>(`${environment.backendUrlV2}/material/${educationalMaterialID}/thumbnail`, body, {
          headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'application/json',
          }),
          reportProgress: true,
          observe: 'events',
        })
        .pipe(
          map((event: HttpEvent<any>) => {
            switch (event.type) {
              case HttpEventType.UploadProgress:
                if (event.total) {
                  const progress = Math.round((100 * event.loaded) / event.total);
                  return { status: 'progress', message: progress };
                } else {
                  return { status: 'progress', message: 'Calculating...' };
                }
              case HttpEventType.Response:
                return { status: 'completed', message: event.body };
              default:
                return { status: 'error', message: `Unhandled event: ${event.type}` };
            }
          }),
          catchError(MaterialService.handleError),
        );
    }
  }

  /**
   * Updates uploaded files of an educational material.
   * @param {number} educationalMaterialID
   */
  updateUploadedFiles(educationalMaterialID: number | string): Observable<void> {
    return this.http
      .get<any>(`${environment.backendUrl}/material/${educationalMaterialID}`, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      })
      .pipe(
        map((res: any): void => {
          const materials = res.materials.map(
            (m): { displayName: any; file: any; id: any; language: any; link: any; subtitles: any } => ({
              id: m.id,
              language: m.language,
              file: m.originalfilename,
              link: m.link,
              displayName: m.displayName,
              subtitles: res.attachments
                .filter((a: Attachment): boolean => a.materialid === m.id)
                .map(
                  (
                    a: Attachment,
                  ): { default: boolean; id: number; kind: string; label: string; src: null; srclang: string } => ({
                    id: a.id,
                    src: null,
                    default: a.defaultfile,
                    kind: a.kind,
                    label: a.label,
                    srclang: a.srclang,
                  }),
                ),
            }),
          );
          this.uploadedFiles$$.next(deduplicate(materials, 'id'));
        }),
        catchError((err) => of(err)),
      );
  }

  /**
   * Updates edit material.
   * @param {number} educationalMateriaID
   */
  updateEducationalMaterialEditForm(educationalMateriaID: number | string): Observable<EducationalMaterialForm> {
    return this.http
      .get<any>(`${environment.backendUrl}/material/${educationalMateriaID}?interaction=edit`, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      })
      .pipe(
        map((educationalMaterial: any): EducationalMaterialForm => {
          if (educationalMaterial.owner) {
            const fileDetails = educationalMaterial.materials
              .map((material) => ({
                id: +material.id,
                file: material.originalfilename,
                link: material.link,
                language: material.language,
                displayName: material.displayName,
                priority: material.priority,
                mimeType: material.mimetype,
                subtitles: educationalMaterial.attachments
                  .filter(
                    (attachment: Attachment) =>
                      attachment.materialid === material.id && attachment.kind === 'subtitles',
                  )
                  .map((subtitle: Attachment) => ({
                    id: +subtitle.id,
                    fileId: subtitle.materialid,
                    subtitle: subtitle.originalfilename,
                    default: subtitle.defaultfile,
                    kind: subtitle.kind,
                    label: subtitle.label,
                    srclang: subtitle.srclang,
                  })),
              }))
              .sort((a, b) => a.priority - b.priority);

            const earlyChildhoodEducationSubjects = educationalMaterial.educationalAlignment
              .filter((alignment) => alignment.source === koodistoSources.earlyChildhoodSubjects)
              .map((alignment) => ({
                key: alignment.objectkey,
                source: alignment.source,
                alignmentType: alignment.alignmenttype,
                educationalFramework: alignment.educationalframework,
                targetName: alignment.targetname,
                targetUrl: alignment.targeturl,
              }));

            const prePrimaryEducationSubjects = educationalMaterial.educationalAlignment
              .filter((alignment) => alignment.source === koodistoSources.prePrimarySubjects)
              .map((alignment) => ({
                key: alignment.objectkey,
                source: alignment.source,
                alignmentType: alignment.alignmenttype,
                educationalFramework: alignment.educationalframework,
                targetName: alignment.targetname,
                targetUrl: alignment.targeturl,
              }));

            const basicStudySubjects = educationalMaterial.educationalAlignment
              .filter((alignment) => alignment.source === koodistoSources.basicStudySubjects)
              .map((alignment) => ({
                key: alignment.objectkey,
                source: alignment.source,
                alignmentType: alignment.alignmenttype,
                educationalFramework: alignment.educationalframework,
                targetName: alignment.targetname,
                targetUrl: alignment.targeturl,
              }));

            const upperSecondarySubjectsOld = educationalMaterial.educationalAlignment
              .filter((alignment) => alignment.source === koodistoSources.upperSecondarySubjectsOld)
              .map((alignment) => ({
                key: alignment.objectkey,
                source: alignment.source,
                alignmentType: alignment.alignmenttype,
                educationalFramework: alignment.educationalframework,
                targetName: alignment.targetname,
                targetUrl: alignment.targeturl,
              }));

            const upperSecondaryCoursesOld = educationalMaterial.educationalAlignment
              // eslint-disable-next-line max-len
              .filter(
                (alignment) =>
                  alignment.source === koodistoSources.upperSecondaryCoursesOld ||
                  alignment.source === koodistoSources.upperSecondarySubjects,
              )
              .map((alignment) => ({
                key: alignment.objectkey,
                source: alignment.source,
                alignmentType: alignment.alignmenttype,
                educationalFramework: alignment.educationalframework,
                targetName: alignment.targetname,
                targetUrl: alignment.targeturl,
              }));

            const upperSecondarySubjectsNew = educationalMaterial.educationalAlignment
              .filter((alignment) => alignment.source === koodistoSources.upperSecondarySubjectsNew)
              .map((alignment) => ({
                key: alignment.objectkey,
                source: alignment.source,
                alignmentType: alignment.alignmenttype,
                educationalFramework: alignment.educationalframework,
                targetName: alignment.targetname,
                targetUrl: alignment.targeturl,
              }));

            const vocationalDegrees = educationalMaterial.educationalAlignment
              .filter((alignment) => alignment.source === koodistoSources.vocationalDegrees)
              .map((alignment) => ({
                key: alignment.objectkey,
                source: alignment.source,
                alignmentType: alignment.alignmenttype,
                educationalFramework: alignment.educationalframework,
                targetName: alignment.targetname,
                targetUrl: alignment.targeturl,
              }));

            const vocationalRequirements = educationalMaterial.educationalAlignment
              // eslint-disable-next-line max-len
              .filter(
                (alignment) =>
                  alignment.source === koodistoSources.vocationalRequirements ||
                  alignment.source === koodistoSources.vocationalObjectives,
              )
              .map((alignment) => ({
                key: alignment.objectkey,
                source: alignment.source,
                alignmentType: alignment.alignmenttype,
                educationalFramework: alignment.educationalframework,
                targetName: alignment.targetname,
              }));

            const branchesOfScience = educationalMaterial.educationalAlignment
              .filter((alignment) => alignment.source === koodistoSources.scienceBranches)
              .map((alignment) => ({
                key: alignment.objectkey,
                source: alignment.source,
                alignmentType: alignment.alignmenttype,
                educationalFramework: alignment.educationalframework,
                targetName: alignment.targetname,
                targetUrl: alignment.targeturl,
              }));

            const editMaterial: EducationalMaterialForm = {
              name:
                educationalMaterial.name.length > 0
                  ? {
                      fi: educationalMaterial.name.find((name) => name.language === 'fi').materialname,
                      sv: educationalMaterial.name.find((name) => name.language === 'sv').materialname,
                      en: educationalMaterial.name.find((name) => name.language === 'en').materialname,
                    }
                  : {
                      fi: null,
                      sv: null,
                      en: null,
                    },
              fileDetails: fileDetails,
              thumbnail: educationalMaterial.thumbnail ? educationalMaterial.thumbnail.filepath : null,
              keywords: educationalMaterial.keywords.map((keyword) => ({
                key: keyword.keywordkey,
                value: keyword.value,
              })),
              authors: educationalMaterial.author.map((author) => ({
                author: author.authorname,
                organization: {
                  key: author.organizationkey,
                  value: author.organization,
                },
              })),
              learningResourceTypes: educationalMaterial.learningResourceTypes.map((type) => ({
                key: type.learningresourcetypekey,
                value: type.value,
              })),
              educationalRoles: educationalMaterial.educationalRoles.map((role) => ({
                key: role.educationalrolekey,
                value: role.educationalrole,
              })),
              educationalUses: educationalMaterial.educationalUses.map((use) => ({
                key: use.educationalusekey,
                value: use.value,
              })),
              description:
                educationalMaterial.description.length > 0
                  ? {
                      fi: educationalMaterial.description.find((desc) => desc.language === 'fi').description,
                      sv: educationalMaterial.description.find((desc) => desc.language === 'sv').description,
                      en: educationalMaterial.description.find((desc) => desc.language === 'en').description,
                    }
                  : {
                      fi: null,
                      sv: null,
                      en: null,
                    },
              educationalLevels: educationalMaterial.educationalLevels.map((level) => ({
                key: level.educationallevelkey,
                value: level.value,
              })),
              earlyChildhoodEducationSubjects: earlyChildhoodEducationSubjects,
              suitsAllEarlyChildhoodSubjects: educationalMaterial.suitsAllEarlyChildhoodSubjects,
              earlyChildhoodEducationObjectives: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.earlyChildhoodObjectives)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              // eslint-disable-next-line max-len
              earlyChildhoodEducationFramework:
                earlyChildhoodEducationSubjects.length > 0 && earlyChildhoodEducationSubjects[0].educationalFramework
                  ? earlyChildhoodEducationSubjects[0].educationalFramework
                  : null,
              prePrimaryEducationSubjects: prePrimaryEducationSubjects,
              suitsAllPrePrimarySubjects: educationalMaterial.suitsAllPrePrimarySubjects,
              prePrimaryEducationObjectives: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.prePrimaryObjectives)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              prePrimaryEducationFramework:
                prePrimaryEducationSubjects.length > 0 && prePrimaryEducationSubjects[0].educationalFramework
                  ? prePrimaryEducationSubjects[0].educationalFramework
                  : null,
              basicStudySubjects: basicStudySubjects,
              suitsAllBasicStudySubjects: educationalMaterial.suitsAllBasicStudySubjects,
              basicStudyObjectives: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.basicStudyObjectives)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              basicStudyContents: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.basicStudyContents)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              basicStudyFramework:
                basicStudySubjects.length > 0 && basicStudySubjects[0].educationalFramework
                  ? basicStudySubjects[0].educationalFramework
                  : null,
              preparatoryEducationSubjects: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.preparatoryEducationSubjects)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              preparatoryEducationObjectives: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.preparatoryEducationObjectives)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              upperSecondarySchoolSubjectsOld: upperSecondarySubjectsOld,
              upperSecondarySchoolCoursesOld: upperSecondaryCoursesOld,
              suitsAllUpperSecondarySubjects: educationalMaterial.suitsAllUpperSecondarySubjects,
              upperSecondarySchoolObjectives: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.upperSecondaryObjectives)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              upperSecondarySchoolFramework:
                upperSecondarySubjectsOld.length > 0 && upperSecondarySubjectsOld[0].educationalFramework
                  ? upperSecondarySubjectsOld[0].educationalFramework
                  : null,
              upperSecondarySchoolSubjectsNew: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.upperSecondarySubjectsNew)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              suitsAllUpperSecondarySubjectsNew: educationalMaterial.suitsAllUpperSecondarySubjectsNew,
              upperSecondarySchoolModulesNew: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.upperSecondaryModulesNew)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              upperSecondarySchoolObjectivesNew: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.upperSecondaryObjectivesNew)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              upperSecondarySchoolContentsNew: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.upperSecondaryContentsNew)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              newUpperSecondarySchoolFramework:
                upperSecondarySubjectsNew.length > 0 && upperSecondarySubjectsNew[0].educationalFramework
                  ? upperSecondarySubjectsNew[0].educationalFramework
                  : null,
              vocationalDegrees: vocationalDegrees,
              suitsAllVocationalDegrees: educationalMaterial.suitsAllVocationalDegrees,
              vocationalUnits: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.vocationalUnits)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              vocationalCommonUnits: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.subjectOfCommonUnit)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              vocationalRequirements: vocationalRequirements,
              vocationalEducationFramework:
                vocationalDegrees.length > 0 && vocationalDegrees[0].educationalFramework
                  ? vocationalDegrees[0].educationalFramework
                  : null,
              furtherVocationalQualifications: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.furtherVocationalQualifications)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              specialistVocationalQualifications: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.specialistVocationalQualifications)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              selfMotivatedEducationSubjects: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.selfMotivatedSubjects)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              suitsAllSelfMotivatedSubjects: educationalMaterial.suitsAllSelfMotivatedSubjects,
              selfMotivatedEducationObjectives: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.selfMotivatedObjectives)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              branchesOfScience: branchesOfScience,
              suitsAllBranches: educationalMaterial.suitsAllBranches,
              scienceBranchObjectives: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.scienceBranchObjectives)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  educationalFramework: alignment.educationalframework,
                  targetName: alignment.targetname,
                  targetUrl: alignment.targeturl,
                })),
              higherEducationFramework:
                branchesOfScience.length > 0 && branchesOfScience[0].educationalFramework
                  ? branchesOfScience[0].educationalFramework
                  : null,
              accessibilityFeatures: educationalMaterial.accessibilityFeatures.map((feature) => ({
                key: feature.accessibilityfeaturekey,
                value: feature.value,
              })),
              accessibilityHazards: educationalMaterial.accessibilityHazards.map((hazard) => ({
                key: hazard.accessibilityhazardkey,
                value: hazard.value,
              })),
              typicalAgeRange: educationalMaterial.typicalAgeRange,
              timeRequired: educationalMaterial.timeRequired,
              publisher: educationalMaterial.publisher.map((publisher) => ({
                key: publisher.publisherkey,
                value: publisher.name,
              })),
              expires: educationalMaterial.expires,
              prerequisites: educationalMaterial.educationalAlignment
                .filter((alignment) => alignment.source === koodistoSources.prerequisites)
                .map((alignment) => ({
                  key: alignment.objectkey,
                  source: alignment.source,
                  alignmentType: alignment.alignmenttype,
                  targetName: alignment.targetname,
                })),
              license: educationalMaterial.license.key,
              externals: educationalMaterial.isBasedOn.map((reference) => ({
                author: reference.author.map((author) => author.authorname),
                url: reference.url,
                name: reference.materialname,
              })),
              versions: educationalMaterial.versions,
            };
            this.educationalMaterialEditForm$$.next(editMaterial);
            return editMaterial;
          } else {
            throwError('Fetch for the educational material data failed');
          }
        }),
        catchError((err) => of(err)),
      );
  }

  /**
   * Set a material file obsoleted.
   * @param materialID
   */
  setMaterialObsoleted(materialID: number): Observable<number> {
    if (this.educationalMaterialID$$.getValue()) {
      return this.http
        .delete(
          `${environment.backendUrlV2}/material/${this.educationalMaterialID$$.getValue()}/obsolete/${materialID}`,
        )
        .pipe(
          map((response: { obsoleted: string }) => +response.obsoleted),
          catchError(MaterialService.handleError),
        );
    }
  }

  /**
   * Set an attachment file obsoleted.
   * @param eduMaterialID
   * @param attachmentID
   */
  setAttachmentObsoleted(eduMaterialID: string, attachmentID: number): Observable<any> {
    return this.http
      .delete(`${environment.backendUrlV2}/material/${eduMaterialID}/obsolete/${attachmentID}/attachment`)
      .pipe(catchError(MaterialService.handleError));
  }

  /**
   * Used in edit-files.component.ts
   * TODO: TO BE REMOVED
   * @param payload
   * @param materialId
   */
  uploadFile(payload: FormData, materialId: number): Observable<UploadMessage> {
    return this.http
      .post(`${environment.backendUrlV2}/material/file/${materialId}/upload`, payload, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              if (event.total) {
                const progress = Math.round((100 * event.loaded) / event.total);
                return { status: 'progress', message: progress };
              } else {
                return { status: 'progress', message: 'Calculating...' };
              }
            case HttpEventType.Response:
              return {
                status: 'completed',
                message: 'Upload completed',
                response: event.body,
              };
            default:
              return {
                status: 'error',
                message: `Unhandled event: ${event.type}`,
              };
          }
        }),
        catchError(MaterialService.handleError),
      );
  }

  /**
   * Returns materials that belong to specific educational material.
   * @param {string} materialId Educational material ID
   * @returns {Observable<Material[]>}
   */
  getCollectionMaterials(materialId: string): Observable<Material[]> {
    return this.http
      .get<any>(`${environment.backendUrl}/material/${materialId}`, {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      })
      .pipe(
        map((material): Material[] =>
          material.materials?.map((m) => ({
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
            downloadUrl: `${environment.backendUrl}/download/file/${m.filekey}?interaction=load`,
            domain: m.link ? new URL(m.link).hostname.replace('www.', '') : null,
          })),
        ),
      );
  }
}
