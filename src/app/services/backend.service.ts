import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, Subject, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '../../environments/environment';
import { EducationalMaterial } from '@models/educational-material';
import { UploadMessage } from '@models/upload-message';
import { EducationalMaterialList } from '@models/educational-material-list';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { UploadedFile } from '@models/uploaded-file';
import { koodistoSources } from '../constants/koodisto-sources';
import { Attachment } from '@models/backend/attachment';
import { EducationalMaterialForm } from '@models/educational-material-form';
import { EducationalMaterialPut } from '@models/educational-material-put';
import { LinkPostResponse } from '@models/link-post-response';
import { LinkPost } from '@models/link-post';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
  ) { }
  backendUrl = environment.backendUrl;
  private localStorageKey = environment.fileUploadLSKey;
  lang: string = this.translate.currentLang;

  public uploadedFiles$ = new Subject<UploadedFile[]>();
  public editMaterial$ = new Subject<EducationalMaterialForm | null>();
  public publishedUserMaterials$ = new Subject<EducationalMaterialList[]>();
  public unpublishedUserMaterials$ = new Subject<EducationalMaterialList[]>();

  private static handleError(error: HttpErrorResponse) {
    console.error(error);
    return throwError('Something bad happened; please try again later.');
  }

  /**
   * Uploads files to backend.
   * @param {FormData} data
   * @returns {Observable<UploadMessage>} Upload message
   */
  uploadFiles(data: FormData): Observable<UploadMessage> {
    let uploadUrl: string;

    if (sessionStorage.getItem(this.localStorageKey) !== null) {
      const fileUpload = JSON.parse(sessionStorage.getItem(this.localStorageKey));

      uploadUrl = `${this.backendUrl}/material/file/${fileUpload.id}`;
    } else {
      uploadUrl = `${this.backendUrl}/material/file`;
    }

    return this.http.post<FormData>(uploadUrl, data, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
      reportProgress: true,
      observe: 'events',
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * event.loaded / event.total);
            return { status: 'progress', message: progress };

          case HttpEventType.Response:
            const fileUpload = JSON.parse(sessionStorage.getItem(this.localStorageKey));

            if (fileUpload !== null) {
              const response = {
                id: fileUpload.id,
              };

              sessionStorage.setItem(this.localStorageKey, JSON.stringify(response));
            } else {
              sessionStorage.setItem(this.localStorageKey, JSON.stringify(event.body));
            }

            return { status: 'completed', message: 'Upload completed', response: event.body };

          default:
            return { status: 'error', message: `Unhandled event: ${event.type}` };
        }
      }),
      catchError(BackendService.handleError),
    );
  }

  uploadSubtitle(fileId: string, data: FormData): Observable<UploadMessage> {
    return this.http.post<FormData>(`${this.backendUrl}/material/attachment/${fileId}`, data, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
      reportProgress: true,
      observe: 'events',
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * event.loaded / event.total);
            return { status: 'progress', message: progress };

          case HttpEventType.Response:
            return { status: 'completed', message: 'Upload completed', response: event.body };

          default:
            return { status: 'error', message: `Unhandled event: ${event.type}` };
        }
      }),
      catchError(BackendService.handleError),
    );
  }

  /**
   * Posts links to backend.
   * @param {json} data
   */
  postLinks(data: any): Observable<any> {
    const fileUpload = JSON.parse(sessionStorage.getItem(this.localStorageKey));

    return this.http.post<any>(`${this.backendUrl}/material/link/${fileUpload.id}`, data, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      catchError(BackendService.handleError),
    );
  }

  /**
   * Posts meta data to backend by material ID.
   * @param {number} materialId
   * @param {EducationalMaterialPut} data
   */
  postMeta(materialId: number, data: EducationalMaterialPut) {
    const uploadUrl = `${this.backendUrl}/material/${materialId}`;

    return this.http.put(uploadUrl, data).pipe(
      catchError(BackendService.handleError),
    );
  }

  /**
   * Returns material from backend by material ID.
   * @param {number} materialId
   * @returns {Observable<EducationalMaterial>} Educational Material
   */
  getMaterial(materialId: number): Observable<EducationalMaterial> {
    return this.http.get<any>(`${this.backendUrl}/material/${materialId}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      map((res): EducationalMaterial => {
        const alignmentObjects: AlignmentObjectExtended[] = res.educationalAlignment
        // tslint:disable-next-line:max-line-length
          .map(({ objectkey, source, alignmenttype, educationalframework, targetname }) => ({ key: objectkey, source: source, alignmentType: alignmenttype, educationalFramework: educationalframework, targetName: targetname }));

        const materials = res.materials.map(m => ({
          id: m.id,
          language: m.language,
          priority: m.priority,
          filepath: m.filepath,
          originalfilename: m.originalfilename,
          filekey: m.filekey,
          link: m.link,
          mimetype: m.mimetype,
          displayName: m.displayName,
          subtitles: res.attachments
            .filter((a: Attachment) => a.materialid === m.id)
            .map((a: Attachment) => ({
              src: `${environment.backendUrl}/download/${a.filekey}`,
              default: a.defaultfile,
              kind: a.kind,
              label: a.label,
              srclang: a.srclang,
            })),
        }));

        return {
          name: res.name,
          thumbnail: res.thumbnail
            ? res.thumbnail.filepath
            : `assets/img/thumbnails/${res.learningResourceTypes[0].learningresourcetypekey}.png`,
          learningResourceTypes: res.learningResourceTypes
            .map(({ learningresourcetypekey, value }) => ({ learningresourcetypekey, value })),
          authors: res.author
            .map(({ authorname, organization }) => ({ authorname, organization })),
          description: res.description,
          materials: materials,
          createdAt: res.createdAt,
          publishedAt: res.publishedAt,
          updatedAt: res.updatedAt,
          timeRequired: res.timeRequired,
          license: res.license,
          keywords: res.keywords
            .map(({ keywordkey, value }) => ({ keywordkey, value })),
          educationalLevels: res.educationalLevels
            .map(({ educationallevelkey, value }) => ({ educationallevelkey, value })),
          educationalRoles: res.educationalRoles
            .map(({ educationalrolekey, educationalrole }) => ({ educationalrolekey, educationalrole })),
          educationalUses: res.educationalUses
            .map(({ educationalusekey, value }) => ({ educationalusekey, value })),
          accessibilityFeatures: res.accessibilityFeatures
            .map(({ accessibilityfeaturekey, value }) => ({ accessibilityfeaturekey, value })),
          accessibilityHazards: res.accessibilityHazards
            .map(({ accessibilityhazardkey, value }) => ({ accessibilityhazardkey, value })),
          earlyChildhoodEducationSubjects: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.earlyChildhoodSubjects),
          earlyChildhoodEducationObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.earlyChildhoodObjectives),
          prePrimaryEducationSubjects: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.prePrimarySubjects),
          prePrimaryEducationObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.prePrimaryObjectives),
          basicStudySubjects: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudySubjects),
          basicStudyObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudyObjectives),
          basicStudyContents: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.basicStudyContents),
          upperSecondarySchoolSubjects: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondarySubjects),
          upperSecondarySchoolObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryObjectives),
          upperSecondarySchoolSubjectsNew: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondarySubjectsNew),
          upperSecondarySchoolModulesNew: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryModulesNew),
          upperSecondarySchoolObjectivesNew: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryObjectivesNew),
          upperSecondarySchoolContentsNew: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.upperSecondaryContentsNew),
          vocationalDegrees: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalDegrees),
          vocationalUnits: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalUnits),
          vocationalEducationObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.vocationalObjectives),
          selfMotivatedEducationSubjects: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.selfMotivatedSubjects),
          selfMotivatedEducationObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.selfMotivatedObjectives),
          branchesOfScience: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.scienceBranches),
          scienceBranchObjectives: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.scienceBranchObjectives),
          prerequisites: alignmentObjects
            .filter((alignmentObject: AlignmentObjectExtended) => alignmentObject.source === koodistoSources.prerequisites),
          references: res.isBasedOn
            .map(r => ({
              authors: r.author.map(author => author.authorname),
              url: r.url,
              name: r.materialname,
            })),
          owner: res.owner,
        };
      })
    );
  }

  /**
   * Updates list of educational materials created by user.
   */
  updateUserMaterialList(): void {
    this.http.get<any>(`${this.backendUrl}/usermaterial`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((materials) => {
      const published: EducationalMaterialList[] = [];
      const unpublished: EducationalMaterialList[] = [];

      materials.forEach((material) => {
        const mappedMaterial: EducationalMaterialList = {
          id: material.id,
          name: material.name,
          thumbnail: material.thumbnail
            ? material.thumbnail.thumbnail
            : material.learningResourceTypes.length > 0
              ? `assets/img/thumbnails/${material.learningResourceTypes[0].learningresourcetypekey}.png`
              : 'assets/img/material.png',
          learningResourceTypes: material.learningResourceTypes
            .map(({learningresourcetypekey, value}) => ({learningresourcetypekey, value})),
          authors: material.authors
            .map(({authorname, organization}) => ({authorname, organization})),
          description: material.description,
          license: material.license,
          keywords: material.keywords
            .map(({keywordkey, value}) => ({keywordkey, value})),
          educationalLevels: material.educationalLevels
            .map(({educationallevelkey, value}) => ({educationallevelkey, value})),
          publishedAt: material.publishedat,
        };

        if (mappedMaterial.publishedAt === null) {
          unpublished.push(mappedMaterial);
        } else {
          published.push(mappedMaterial);
        }
      });

      published.sort((a, b) => b.id - a.id);
      unpublished.sort((a, b) => b.id - a.id);

      this.publishedUserMaterials$.next(published);
      this.unpublishedUserMaterials$.next(unpublished);
    });
  }

  getRecentMaterialList(): Observable<EducationalMaterialList[]> {
    return this.http.get<any>(`${this.backendUrl}/recentmaterial`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      map((res): EducationalMaterialList[] => {
        return res
          .filter(r => r.name.length > 0)
          .map(r => {
            return {
              id: r.id,
              name: r.name,
              slug: r.name
                .find(n => n.language.toLowerCase() === this.lang).slug,
              thumbnail: r.thumbnail
                ? r.thumbnail.thumbnail
                : `assets/img/thumbnails/${r.learningResourceTypes[0].learningresourcetypekey}.png`,
              learningResourceTypes: r.learningResourceTypes
                .map(({ learningresourcetypekey, value }) => ({ learningresourcetypekey, value })),
              authors: r.authors
                .map(({ authorname, organization }) => ({ authorname, organization })),
              description: r.description,
              license: r.license,
              keywords: r.keywords
                .map(({ keywordkey, value }) => ({ keywordkey, value })),
              educationalLevels: r.educationalLevels
                .map(({ educationallevelkey, value }) => ({ educationallevelkey, value })),
            };
          });
      }),
      catchError(BackendService.handleError),
    );
  }

  /**
   * Upload thumbnail image for educational material to backend.
   * @param {string} base64Image
   * @param {number} materialId
   * @returns {Observable<UploadMessage>} Upload message
   */
  uploadImage(base64Image: string, materialId?: number): Observable<UploadMessage> {
    const fileUpload = JSON.parse(sessionStorage.getItem(this.localStorageKey));

    if (fileUpload !== null || materialId) {
      if (fileUpload) {
        materialId = fileUpload.id;
      }

      return this.http.post<{ base64image: string }>(`${this.backendUrl}/uploadBase64Image/${materialId}`, { base64image: base64Image }, {
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }),
        reportProgress: true,
        observe: 'events',
      }).pipe(
        map((event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              const progress = Math.round(100 * event.loaded / event.total);
              return { status: 'progress', message: progress };

            case HttpEventType.Response:
              return { status: 'completed', message: event.body };

            default:
              return { status: 'error', message: `Unhandled event: ${event.type}` };
          }
        }),
        catchError(BackendService.handleError),
      );
    }
  }

  /**
   * Updates uploaded files list.
   * @param {number} materialId
   */
  updateUploadedFiles(materialId: number): void {
    this.http.get<any>(`${this.backendUrl}/material/${materialId}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      })
    }).subscribe((res) => {
      const materials = res.materials.map(m => ({
        id: m.id,
        language: m.language,
        file: m.originalfilename,
        link: m.link,
        displayName: m.displayName,
        subtitles: res.attachments
          .filter((a: Attachment) => a.materialid === m.id)
          .map((a: Attachment) => ({
            id: a.id,
            src: null,
            default: a.defaultfile,
            kind: a.kind,
            label: a.label,
            srclang: a.srclang,
          })),
      }));

      this.uploadedFiles$.next(materials);
    });
  }

  /**
   * Updates edit material.
   * @param {number} materialId
   */
  updateEditMaterial(materialId: number): void {
    this.http.get<any>(`${this.backendUrl}/material/${materialId}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((material) => {
      if (material.owner) {
        const fileDetails = material.materials
          .map((file) => ({
            id: +file.id,
            file: file.originalfilename,
            link: file.link,
            language: file.language,
            displayName: file.displayName,
            priority: file.priority,
            subtitles: material.attachments
              .filter((attachment: Attachment) => attachment.materialid === file.id && attachment.kind === 'subtitles')
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

        const earlyChildhoodEducationSubjects = material.educationalAlignment
          .filter((alignment) => alignment.source === koodistoSources.earlyChildhoodSubjects)
          .map((alignment) => ({
            key: alignment.objectkey,
            source: alignment.source,
            alignmentType: alignment.alignmenttype,
            educationalFramework: alignment.educationalframework,
            targetName: alignment.targetname,
            targetUrl: alignment.targeturl,
          }));

        const prePrimaryEducationSubjects = material.educationalAlignment
          .filter((alignment) => alignment.source === koodistoSources.prePrimarySubjects)
          .map((alignment) => ({
            key: alignment.objectkey,
            source: alignment.source,
            alignmentType: alignment.alignmenttype,
            educationalFramework: alignment.educationalframework,
            targetName: alignment.targetname,
            targetUrl: alignment.targeturl,
          }));

        const basicStudySubjects = material.educationalAlignment
          .filter((alignment) => alignment.source === koodistoSources.basicStudySubjects)
          .map((alignment) => ({
            key: alignment.objectkey,
            source: alignment.source,
            alignmentType: alignment.alignmenttype,
            educationalFramework: alignment.educationalframework,
            targetName: alignment.targetname,
            targetUrl: alignment.targeturl,
          }));
        const upperSecondarySubjects = material.educationalAlignment
          .filter((alignment) => alignment.source === koodistoSources.upperSecondarySubjects)
          .map((alignment) => ({
            key: alignment.objectkey,
            source: alignment.source,
            alignmentType: alignment.alignmenttype,
            educationalFramework: alignment.educationalframework,
            targetName: alignment.targetname,
            targetUrl: alignment.targeturl,
          }));

        const vocationalDegrees = material.educationalAlignment
          .filter((alignment) => alignment.source === koodistoSources.vocationalDegrees)
          .map((alignment) => ({
            key: alignment.objectkey,
            source: alignment.source,
            alignmentType: alignment.alignmenttype,
            educationalFramework: alignment.educationalframework,
            targetName: alignment.targetname,
            targetUrl: alignment.targeturl,
          }));

        const branchesOfScience = material.educationalAlignment
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
          name: material.name.length > 0
            ? {
              fi: material.name.find((name) => name.language === 'fi').materialname,
              sv: material.name.find((name) => name.language === 'sv').materialname,
              en: material.name.find((name) => name.language === 'en').materialname,
            }
            : {
              fi: null,
              sv: null,
              en: null,
            },
          fileDetails: fileDetails,
          thumbnail: material.thumbnail ? material.thumbnail.filepath : null,
          keywords: material.keywords.map((keyword) => ({
            key: keyword.keywordkey,
            value: keyword.value,
          })),
          authors: material.author.map((author) => ({
            author: author.authorname,
            organization: {
              key: author.organizationkey,
              value: author.organization,
            },
          })),
          learningResourceTypes: material.learningResourceTypes.map((type) => ({
            key: type.learningresourcetypekey,
            value: type.value,
          })),
          educationalRoles: material.educationalRoles.map((role) => ({
            key: role.educationalrolekey,
            value: role.educationalrole,
          })),
          educationalUses: material.educationalUses.map((use) => ({
            key: use.educationalusekey,
            value: use.value,
          })),
          description: material.description.length > 0
            ? {
              fi: material.description.find((desc) => desc.language === 'fi').description,
              sv: material.description.find((desc) => desc.language === 'sv').description,
              en: material.description.find((desc) => desc.language === 'en').description,
            }
            : {
              fi: null,
              sv: null,
              en: null,
            },
          educationalLevels: material.educationalLevels.map((level) => ({
            key: level.educationallevelkey,
            value: level.value,
          })),
          earlyChildhoodEducationSubjects: earlyChildhoodEducationSubjects,
          suitsAllEarlyChildhoodSubjects: material.suitsAllEarlyChildhoodSubjects,
          earlyChildhoodEducationObjectives: material.educationalAlignment
            .filter((alignment) => alignment.source === koodistoSources.earlyChildhoodObjectives)
            .map((alignment) => ({
              key: alignment.objectkey,
              source: alignment.source,
              alignmentType: alignment.alignmenttype,
              educationalFramework: alignment.educationalframework,
              targetName: alignment.targetname,
              targetUrl: alignment.targeturl,
            })),
          earlyChildhoodEducationFramework: (earlyChildhoodEducationSubjects.length > 0 && earlyChildhoodEducationSubjects[0].educationalFramework)
            ? earlyChildhoodEducationSubjects[0].educationalFramework
            : null,
          prePrimaryEducationSubjects: prePrimaryEducationSubjects,
          suitsAllPrePrimarySubjects: material.suitsAllPrePrimarySubjects,
          prePrimaryEducationObjectives: material.educationalAlignment
            .filter((alignment) => alignment.source === koodistoSources.prePrimaryObjectives)
            .map((alignment) => ({
              key: alignment.objectkey,
              source: alignment.source,
              alignmentType: alignment.alignmenttype,
              educationalFramework: alignment.educationalframework,
              targetName: alignment.targetname,
              targetUrl: alignment.targeturl,
            })),
          prePrimaryEducationFramework: (prePrimaryEducationSubjects.length > 0 && prePrimaryEducationSubjects[0].educationalFramework)
            ? prePrimaryEducationSubjects[0].educationalFramework
            : null,
          basicStudySubjects: basicStudySubjects,
          suitsAllBasicStudySubjects: material.suitsAllBasicStudySubjects,
          basicStudyObjectives: material.educationalAlignment
            .filter((alignment) => alignment.source === koodistoSources.basicStudyObjectives)
            .map((alignment) => ({
              key: alignment.objectkey,
              source: alignment.source,
              alignmentType: alignment.alignmenttype,
              educationalFramework: alignment.educationalframework,
              targetName: alignment.targetname,
              targetUrl: alignment.targeturl,
            })),
          basicStudyContents: material.educationalAlignment
            .filter((alignment) => alignment.source === koodistoSources.basicStudyContents)
            .map((alignment) => ({
              key: alignment.objectkey,
              source: alignment.source,
              alignmentType: alignment.alignmenttype,
              educationalFramework: alignment.educationalframework,
              targetName: alignment.targetname,
              targetUrl: alignment.targeturl,
            })),
          basicStudyFramework: (basicStudySubjects.length > 0 && basicStudySubjects[0].educationalFramework)
            ? basicStudySubjects[0].educationalFramework
            : null,
          upperSecondarySchoolSubjects: upperSecondarySubjects,
          suitsAllUpperSecondarySubjects: material.suitsAllUpperSecondarySubjects,
          upperSecondarySchoolObjectives: material.educationalAlignment
            .filter((alignment) => alignment.source === koodistoSources.upperSecondaryObjectives)
            .map((alignment) => ({
              key: alignment.objectkey,
              source: alignment.source,
              alignmentType: alignment.alignmenttype,
              educationalFramework: alignment.educationalframework,
              targetName: alignment.targetname,
              targetUrl: alignment.targeturl,
            })),
          upperSecondarySchoolFramework: (upperSecondarySubjects.length > 0 && upperSecondarySubjects[0].educationalFramework)
            ? upperSecondarySubjects[0].educationalFramework
            : null,
          upperSecondarySchoolSubjectsNew: material.educationalAlignment
            .filter((alignment) => alignment.source === koodistoSources.upperSecondarySubjectsNew)
            .map((alignment) => ({
              key: alignment.objectkey,
              source: alignment.source,
              alignmentType: alignment.alignmenttype,
              educationalFramework: alignment.educationalframework,
              targetName: alignment.targetname,
              targetUrl: alignment.targeturl,
            })),
          suitsAllUpperSecondarySubjectsNew: material.suitsAllUpperSecondarySubjectsNew,
          upperSecondarySchoolModulesNew: material.educationalAlignment
            .filter((alignment) => alignment.source === koodistoSources.upperSecondaryModulesNew)
            .map((alignment) => ({
              key: alignment.objectkey,
              source: alignment.source,
              alignmentType: alignment.alignmenttype,
              educationalFramework: alignment.educationalframework,
              targetName: alignment.targetname,
              targetUrl: alignment.targeturl,
            })),
          upperSecondarySchoolObjectivesNew: material.educationalAlignment
            .filter((alignment) => alignment.source === koodistoSources.upperSecondaryObjectivesNew)
            .map((alignment) => ({
              key: alignment.objectkey,
              source: alignment.source,
              alignmentType: alignment.alignmenttype,
              educationalFramework: alignment.educationalframework,
              targetName: alignment.targetname,
              targetUrl: alignment.targeturl,
            })),
          upperSecondarySchoolContentsNew: material.educationalAlignment
            .filter((alignment) => alignment.source === koodistoSources.upperSecondaryContentsNew)
            .map((alignment) => ({
              key: alignment.objectkey,
              source: alignment.source,
              alignmentType: alignment.alignmenttype,
              educationalFramework: alignment.educationalframework,
              targetName: alignment.targetname,
              targetUrl: alignment.targeturl,
            })),
          vocationalDegrees: vocationalDegrees,
          suitsAllVocationalDegrees: material.suitsAllVocationalDegrees,
          vocationalUnits: material.educationalAlignment
            .filter((alignment) => alignment.source === koodistoSources.vocationalUnits)
            .map((alignment) => ({
              key: alignment.objectkey,
              source: alignment.source,
              alignmentType: alignment.alignmenttype,
              educationalFramework: alignment.educationalframework,
              targetName: alignment.targetname,
              targetUrl: alignment.targeturl,
            })),
          vocationalEducationObjectives: material.educationalAlignment
            .filter((alignment) => alignment.source === koodistoSources.vocationalObjectives)
            .map((alignment) => ({
              key: alignment.objectkey,
              source: alignment.source,
              alignmentType: alignment.alignmenttype,
              educationalFramework: alignment.educationalframework,
              targetName: alignment.targetname,
              targetUrl: alignment.targeturl,
            })),
          vocationalEducationFramework: (vocationalDegrees.length > 0 && vocationalDegrees[0].educationalFramework)
            ? vocationalDegrees[0].educationalFramework
            : null,
          selfMotivatedEducationSubjects: material.educationalAlignment
            .filter((alignment) => alignment.source === koodistoSources.selfMotivatedSubjects)
            .map((alignment) => ({
              key: alignment.objectkey,
              source: alignment.source,
              alignmentType: alignment.alignmenttype,
              educationalFramework: alignment.educationalframework,
              targetName: alignment.targetname,
              targetUrl: alignment.targeturl,
            })),
          suitsAllSelfMotivatedSubjects: material.suitsAllSelfMotivatedSubjects,
          selfMotivatedEducationObjectives: material.educationalAlignment
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
          suitsAllBranches: material.suitsAllBranches,
          scienceBranchObjectives: material.educationalAlignment
            .filter((alignment) => alignment.source === koodistoSources.scienceBranchObjectives)
            .map((alignment) => ({
              key: alignment.objectkey,
              source: alignment.source,
              alignmentType: alignment.alignmenttype,
              educationalFramework: alignment.educationalframework,
              targetName: alignment.targetname,
              targetUrl: alignment.targeturl,
            })),
          higherEducationFramework: (branchesOfScience.length > 0 && branchesOfScience[0].educationalFramework)
            ? branchesOfScience[0].educationalFramework
            : null,
          accessibilityFeatures: material.accessibilityFeatures.map((feature) => ({
            key: feature.accessibilityfeaturekey,
            value: feature.value,
          })),
          accessibilityHazards: material.accessibilityHazards.map((hazard) => ({
            key: hazard.accessibilityhazardkey,
            value: hazard.value,
          })),
          typicalAgeRange: material.typicalAgeRange,
          timeRequired: material.timeRequired,
          publisher: material.publisher.map((publisher) => ({
            key: publisher.publisherkey,
            value: publisher.name,
          })),
          expires: material.expires,
          prerequisites: material.educationalAlignment
            .filter((alignment) => alignment.source === koodistoSources.prerequisites)
            .map((alignment) => ({
              key: alignment.objectkey,
              source: alignment.source,
              alignmentType: alignment.alignmenttype,
              targetName: alignment.targetname,
            })),
          license: material.license,
          externals: material.isBasedOn.map((reference) => ({
            author: reference.author.map((author) => (author.authorname)),
            url: reference.url,
            name: reference.materialname,
          })),
        };

        this.editMaterial$.next(editMaterial);
      } else {
        this.editMaterial$.next(null);
      }
    });
  }

  /**
   * Deletes file from backend.
   * @param {number} fileId
   */
  deleteFile(fileId: number): Observable<any> {
    if (sessionStorage.getItem(this.localStorageKey) !== null) {
      const fileUpload = JSON.parse(sessionStorage.getItem(this.localStorageKey));

      return this.http.delete(`${this.backendUrl}/material/file/${fileUpload.id}/${fileId}`)
        .pipe(
          catchError(BackendService.handleError),
        );
    }
  }

  /**
   * Deletes attachment from backend.
   * @param {number} attachmentId
   */
  deleteAttachment(attachmentId: number): Observable<any> {
    return this.http.delete(`${this.backendUrl}/material/attachment/${attachmentId}`)
      .pipe(
        catchError(BackendService.handleError),
      );
  }

  uploadFile(payload: FormData, materialId: number): Observable<UploadMessage> {
    return this.http.post(`${this.backendUrl}/material/file/${materialId}`, payload, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
      reportProgress: true,
      observe: 'events',
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * event.loaded / event.total);
            return {
              status: 'progress',
              message: progress,
            };

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
      catchError(BackendService.handleError),
    );
  }

  postLink(payload: LinkPost, materialId: number): Observable<LinkPostResponse> {
    return this.http.post<LinkPostResponse>(`${this.backendUrl}/material/link/${materialId}`, payload, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      catchError(BackendService.handleError),
    );
  }
}
