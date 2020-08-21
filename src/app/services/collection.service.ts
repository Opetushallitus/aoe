import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateCollectionPost } from '@models/collections/create-collection-post';
import { CreateCollectionResponse } from '@models/collections/create-collection-response';
import { catchError, map } from 'rxjs/operators';
import { AddToCollectionResponse } from '@models/collections/add-to-collection-response';
import { AddToCollectionPost } from '@models/collections/add-to-collection-post';
import { UserCollection } from '@models/collections/user-collection';
import { UserCollectionResponse } from '@models/collections/user-collection-response';
import { RemoveFromCollectionPost } from '@models/collections/remove-from-collection-post';
import { RemoveFromCollectionResponse } from '@models/collections/remove-from-collection-response';
import { CollectionResponse } from '@models/collections/collection-response';
import {
  CollectionForm,
  CollectionFormMaterial,
  CollectionFormMaterialAndHeading,
  CollectionFormMaterialAuthor,
} from '@models/collections/collection-form';
import { UpdateCollectionPut } from '@models/collections/update-collection-put';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { koodistoSources } from '../constants/koodisto-sources';
import { Collection } from '@models/collections/collection';
import { AlignmentObjects } from '@models/alignment-objects';
import { UploadMessage } from '@models/upload-message';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  public userCollections$ = new Subject<UserCollection[]>();
  public privateUserCollections$ = new Subject<UserCollection[]>();
  public publicUserCollections$ = new Subject<UserCollection[]>();
  public collection$ = new Subject<Collection>();
  public editCollection$ = new Subject<CollectionForm>();

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * Handles errors.
   * @param {HttpErrorResponse} error
   * @private
   */
  private handleError(error: HttpErrorResponse) {
    console.error(error);

    return throwError('Something bad happened; please try again later.');
  }

  /**
   * Creates new collection.
   * @param {CreateCollectionPost} payload
   * @returns {Observable<CreateCollectionResponse>} Response
   */
  createCollection(payload: CreateCollectionPost): Observable<CreateCollectionResponse> {
    return this.http.post<CreateCollectionResponse>(`${environment.backendUrl}/collection/create`, payload, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      catchError(this.handleError),
    );
  }

  /**
   * Updates array of collections created by user.
   */
  updateUserCollections(): void {
    this.http.get<UserCollectionResponse>(`${environment.backendUrl}/collection/userCollection`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((userCollectionResponse: UserCollectionResponse) => {
      const privateCollections: UserCollection[] = [];
      const publicCollections: UserCollection[] = [];

      // set all user collections
      this.userCollections$.next(userCollectionResponse.collections);

      userCollectionResponse.collections.forEach((collection: UserCollection) => {
        if (collection.publishedat === null) {
          privateCollections.push(collection);
        } else {
          publicCollections.push(collection);
        }
      });

      // set private user collections
      this.privateUserCollections$.next(privateCollections);

      // set public user collections
      this.publicUserCollections$.next(publicCollections);
    });
  }

  /**
   * Adds educational material(s) to selected collection.
   * @param {AddToCollectionPost} payload
   * @returns {Observable<AddToCollectionResponse>} Response
   */
  addToCollection(payload: AddToCollectionPost): Observable<AddToCollectionResponse> {
    return this.http.post<AddToCollectionResponse>(`${environment.backendUrl}/collection/addMaterial`, payload, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      catchError(this.handleError),
    );
  }

  /**
   * Removes educational material(s) from selected collection.
   * @param {RemoveFromCollectionPost} payload
   * @returns {Observable<RemoveFromCollectionResponse>} Response
   */
  removeFromCollection(payload: RemoveFromCollectionPost): Observable<RemoveFromCollectionResponse> {
    return this.http.post<RemoveFromCollectionResponse>(`${environment.backendUrl}/collection/removeMaterial`, payload, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(
      catchError(this.handleError),
    );
  }

  /**
   * Updates collection details.
   * @param {string} collectionId
   */
  updateCollection(collectionId: string): void {
    this.http.get<CollectionResponse>(`${environment.backendUrl}/collection/getCollection/${collectionId}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((collectionResponse: CollectionResponse) => {
      const alignmentObjects = this.extractAlignmentObjects(collectionResponse.alignmentObjects);

      const materialsAndHeadings: CollectionFormMaterialAndHeading[] = [];

      collectionResponse.educationalmaterials.forEach((material) => {
        materialsAndHeadings.push({
          id: material.id,
          priority: material.priority,
        });
      });

      collectionResponse.headings.forEach((heading) => {
        materialsAndHeadings.push({
          heading: heading.heading,
          description: heading.description,
          priority: heading.priority,
        });
      });

      materialsAndHeadings.sort((a, b) => a.priority - b.priority);

      const collection: Collection = {
        id: collectionResponse.collection.id,
        publishedAt: collectionResponse.collection.publishedat,
        updatedAt: collectionResponse.collection.updatedat,
        createdAt: collectionResponse.collection.createdat,
        name: collectionResponse.collection.name,
        description: collectionResponse.collection.description,
        keywords: collectionResponse.keywords,
        languages: collectionResponse.languages,
        educationalRoles: collectionResponse.educationalRoles,
        educationalUses: collectionResponse.educationalUses,
        educationalMaterials: collectionResponse.educationalmaterials,
        materialsAndHeadings: materialsAndHeadings,
        accessibilityFeatures: collectionResponse.accessibilityFeatures,
        accessibilityHazards: collectionResponse.accessibilityHazards,
        educationalLevels: collectionResponse.educationalLevels,
        earlyChildhoodEducationSubjects: alignmentObjects.earlyChildhoodEducationSubjects,
        earlyChildhoodEducationObjectives: alignmentObjects.earlyChildhoodEducationObjectives,
        earlyChildhoodEducationFramework: alignmentObjects.earlyChildhoodEducationSubjects[0]?.educationalFramework,
        prePrimaryEducationSubjects: alignmentObjects.prePrimaryEducationSubjects,
        prePrimaryEducationObjectives: alignmentObjects.prePrimaryEducationObjectives,
        prePrimaryEducationFramework: alignmentObjects.prePrimaryEducationSubjects[0]?.educationalFramework,
        basicStudySubjects: alignmentObjects.basicStudySubjects,
        basicStudyObjectives: alignmentObjects.basicStudyObjectives,
        basicStudyContents: alignmentObjects.basicStudyContents,
        basicStudyFramework: alignmentObjects.basicStudySubjects[0]?.educationalFramework,
        upperSecondarySchoolSubjects: alignmentObjects.upperSecondarySchoolSubjects,
        upperSecondarySchoolObjectives: alignmentObjects.upperSecondarySchoolObjectives,
        upperSecondarySchoolFramework: alignmentObjects.upperSecondarySchoolSubjects[0]?.educationalFramework,
        upperSecondarySchoolSubjectsNew: alignmentObjects.upperSecondarySchoolSubjectsNew,
        upperSecondarySchoolModulesNew: alignmentObjects.upperSecondarySchoolModulesNew,
        upperSecondarySchoolObjectivesNew: alignmentObjects.upperSecondarySchoolObjectivesNew,
        upperSecondarySchoolContentsNew: alignmentObjects.upperSecondarySchoolContentsNew,
        vocationalDegrees: alignmentObjects.vocationalDegrees,
        vocationalUnits: alignmentObjects.vocationalUnits,
        vocationalEducationObjectives: alignmentObjects.vocationalEducationObjectives,
        vocationalEducationFramework: alignmentObjects.vocationalDegrees[0]?.educationalFramework,
        selfMotivatedEducationSubjects: alignmentObjects.selfMotivatedEducationSubjects,
        selfMotivatedEducationObjectives: alignmentObjects.selfMotivatedEducationObjectives,
        scienceBranches: alignmentObjects.scienceBranches,
        scienceBranchObjectives: alignmentObjects.scienceBranchObjectives,
        higherEducationFramework: alignmentObjects.scienceBranches[0]?.educationalFramework,
        owner: collectionResponse.owner,
        authors: collectionResponse.authors,
        thumbnail: collectionResponse.thumbnail
          ? collectionResponse.thumbnail
          : 'assets/img/thumbnails/kokoelma.png',
      };

      this.collection$.next(collection);
    });
  }

  /**
   * Updates edit collection.
   * @param {string} collectionId
   */
  updateEditCollection(collectionId: string): void {
    this.http.get<CollectionResponse>(`${environment.backendUrl}/collection/getCollection/${collectionId}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((collection: CollectionResponse) => {
      const alignmentObjects = this.extractAlignmentObjects(collection.alignmentObjects);
      const materialsAndHeadings: CollectionFormMaterialAndHeading[] = [];

      collection.educationalmaterials.forEach((material) => {
        materialsAndHeadings.push({
          id: material.id,
          priority: material.priority,
        });
      });

      collection.headings.forEach((heading) => {
        materialsAndHeadings.push({
          heading: heading.heading,
          description: heading.description,
          priority: heading.priority,
        });
      });

      materialsAndHeadings.sort((a, b) => a.priority - b.priority);

      const collectionForm: CollectionForm = {
        id: collection.collection.id,
        isPublished: collection.collection.publishedat !== null,
        name: collection.collection.name,
        thumbnail: collection.thumbnail
         ? collection.thumbnail
         : 'assets/img/thumbnails/kokoelma.png',
        keywords: collection.keywords,
        languages: collection.languages,
        educationalRoles: collection.educationalRoles,
        educationalUses: collection.educationalUses,
        accessibilityFeatures: collection.accessibilityFeatures,
        accessibilityHazards: collection.accessibilityHazards,
        materials: collection.educationalmaterials.map((material): CollectionFormMaterial => {
          return {
            id: material.id,
            authors: material.author.map((author): CollectionFormMaterialAuthor => {
              return {
                author: author.authorname,
                organization: {
                  key: author.organizationkey,
                  value: author.organization,
                },
              };
            }),
            license: material.license,
            name: material.name,
            priority: material.priority,
            publishedAt: material.publishedat,
            description: material.description,
            thumbnail: material.thumbnail?.thumbnail
              ? material.thumbnail.thumbnail
              : `assets/img/thumbnails/${material.learningResourceTypes[0].learningresourcetypekey}.png`,
            learningResourceTypes: material.learningResourceTypes.map((type) => {
              return {
                key: type.learningresourcetypekey,
                value: type.value,
              };
            }),
          };
        }),
        materialsAndHeadings,
        description: collection.collection.description,
        educationalLevels: collection.educationalLevels,
        earlyChildhoodEducationSubjects: alignmentObjects.earlyChildhoodEducationSubjects,
        earlyChildhoodEducationObjectives: alignmentObjects.earlyChildhoodEducationObjectives,
        earlyChildhoodEducationFramework: alignmentObjects.earlyChildhoodEducationSubjects[0]?.educationalFramework,
        prePrimaryEducationSubjects: alignmentObjects.prePrimaryEducationSubjects,
        prePrimaryEducationObjectives: alignmentObjects.prePrimaryEducationObjectives,
        prePrimaryEducationFramework: alignmentObjects.prePrimaryEducationSubjects[0]?.educationalFramework,
        basicStudySubjects: alignmentObjects.basicStudySubjects,
        basicStudyObjectives: alignmentObjects.basicStudyObjectives,
        basicStudyContents: alignmentObjects.basicStudyContents,
        basicStudyFramework: alignmentObjects.basicStudySubjects[0]?.educationalFramework,
        currentUpperSecondarySchoolSelected: alignmentObjects.upperSecondarySchoolSubjects.length > 0,
        newUpperSecondarySchoolSelected: alignmentObjects.upperSecondarySchoolSubjectsNew.length > 0,
        upperSecondarySchoolSubjects: alignmentObjects.upperSecondarySchoolSubjects,
        upperSecondarySchoolObjectives: alignmentObjects.upperSecondarySchoolObjectives,
        upperSecondarySchoolFramework: alignmentObjects.upperSecondarySchoolSubjects[0]?.educationalFramework,
        upperSecondarySchoolSubjectsNew: alignmentObjects.upperSecondarySchoolSubjectsNew,
        upperSecondarySchoolModulesNew: alignmentObjects.upperSecondarySchoolModulesNew,
        upperSecondarySchoolObjectivesNew: alignmentObjects.upperSecondarySchoolObjectivesNew,
        upperSecondarySchoolContentsNew: alignmentObjects.upperSecondarySchoolContentsNew,
        vocationalDegrees: alignmentObjects.vocationalDegrees,
        vocationalUnits: alignmentObjects.vocationalUnits,
        vocationalEducationObjectives: alignmentObjects.vocationalEducationObjectives,
        vocationalEducationFramework: alignmentObjects.vocationalDegrees[0]?.educationalFramework,
        selfMotivatedEducationSubjects: alignmentObjects.selfMotivatedEducationSubjects,
        selfMotivatedEducationObjectives: alignmentObjects.selfMotivatedEducationObjectives,
        scienceBranches: alignmentObjects.scienceBranches,
        scienceBranchObjectives: alignmentObjects.scienceBranchObjectives,
        higherEducationFramework: alignmentObjects.scienceBranches[0]?.educationalFramework,
      };

      this.editCollection$.next(collectionForm);
    });
  }

  /**
   * Updates collection details.
   * @param {UpdateCollectionPut} collection
   */
  updateCollectionDetails(collection: UpdateCollectionPut) {
    return this.http.put(`${environment.backendUrl}/collection/update`, collection)
      .pipe(
        catchError(this.handleError),
      );
  }

  /**
   * Uploads thumbnail image for collection.
   * @param {string} base64Image
   * @param {string} collectionId
   * @returns {Observable<UploadMessage>} Upload message
   */
  uploadImage(base64Image: string, collectionId: string): Observable<UploadMessage> {
    return this.http.post<{ base64image: string }>(`${environment.backendUrl}/collection/uploadBase64Image/${collectionId}`, {
      base64image: base64Image,
    }, {
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
      catchError(this.handleError),
    );
  }

  /**
   * Extracts different alignment objects from object array.
   * @param alignmentObjects
   * @returns {AlignmentObjects} Alignment objects
   * @private
   */
  private extractAlignmentObjects(alignmentObjects): AlignmentObjects {
    const earlyChildhoodEducationSubjects: AlignmentObjectExtended[] = [];
    const earlyChildhoodEducationObjectives: AlignmentObjectExtended[] = [];
    const prePrimaryEducationSubjects: AlignmentObjectExtended[] = [];
    const prePrimaryEducationObjectives: AlignmentObjectExtended[] = [];
    const basicStudySubjects: AlignmentObjectExtended[] = [];
    const basicStudyObjectives: AlignmentObjectExtended[] = [];
    const basicStudyContents: AlignmentObjectExtended[] = [];
    const upperSecondarySchoolSubjects: AlignmentObjectExtended[] = [];
    const upperSecondarySchoolObjectives: AlignmentObjectExtended[] = [];
    const upperSecondarySchoolSubjectsNew: AlignmentObjectExtended[] = [];
    const upperSecondarySchoolModulesNew: AlignmentObjectExtended[] = [];
    const upperSecondarySchoolObjectivesNew: AlignmentObjectExtended[] = [];
    const upperSecondarySchoolContentsNew: AlignmentObjectExtended[] = [];
    const vocationalDegrees: AlignmentObjectExtended[] = [];
    const vocationalUnits: AlignmentObjectExtended[] = [];
    const vocationalEducationObjectives: AlignmentObjectExtended[] = [];
    const selfMotivatedEducationSubjects: AlignmentObjectExtended[] = [];
    const selfMotivatedEducationObjectives: AlignmentObjectExtended[] = [];
    const scienceBranches: AlignmentObjectExtended[] = [];
    const scienceBranchObjectives: AlignmentObjectExtended[] = [];

    alignmentObjects.map((aObject): AlignmentObjectExtended => {
      return {
        alignmentType: aObject.alignmenttype,
        educationalFramework: aObject.educationalframework,
        key: aObject.objectkey,
        source: aObject.source,
        targetName: aObject.targetname,
        targetUrl: aObject.targeturl,
      };
    }).forEach((aObject: AlignmentObjectExtended) => {
      switch (aObject.source) {
        case koodistoSources.earlyChildhoodSubjects:
          earlyChildhoodEducationSubjects.push(aObject);
          break;

        case koodistoSources.earlyChildhoodObjectives:
          earlyChildhoodEducationObjectives.push(aObject);
          break;

        case koodistoSources.prePrimarySubjects:
          prePrimaryEducationSubjects.push(aObject);
          break;

        case koodistoSources.prePrimaryObjectives:
          prePrimaryEducationObjectives.push(aObject);
          break;

        case koodistoSources.basicStudySubjects:
          basicStudySubjects.push(aObject);
          break;

        case koodistoSources.basicStudyObjectives:
          basicStudyObjectives.push(aObject);
          break;

        case koodistoSources.basicStudyContents:
          basicStudyContents.push(aObject);
          break;

        case koodistoSources.upperSecondarySubjects:
          upperSecondarySchoolSubjects.push(aObject);
          break;

        case koodistoSources.upperSecondaryObjectives:
          upperSecondarySchoolObjectives.push(aObject);
          break;

        case koodistoSources.upperSecondarySubjectsNew:
          upperSecondarySchoolSubjectsNew.push(aObject);
          break;

        case koodistoSources.upperSecondaryModulesNew:
          upperSecondarySchoolModulesNew.push(aObject);
          break;

        case koodistoSources.upperSecondaryObjectivesNew:
          upperSecondarySchoolObjectivesNew.push(aObject);
          break;

        case koodistoSources.upperSecondaryContentsNew:
          upperSecondarySchoolContentsNew.push(aObject);
          break;

        case koodistoSources.vocationalDegrees:
          vocationalDegrees.push(aObject);
          break;

        case koodistoSources.vocationalUnits:
          vocationalUnits.push(aObject);
          break;

        case koodistoSources.vocationalObjectives:
          vocationalEducationObjectives.push(aObject);
          break;

        case koodistoSources.selfMotivatedSubjects:
          selfMotivatedEducationSubjects.push(aObject);
          break;

        case koodistoSources.selfMotivatedObjectives:
          selfMotivatedEducationObjectives.push(aObject);
          break;

        case koodistoSources.scienceBranches:
          scienceBranches.push(aObject);
          break;

        case koodistoSources.scienceBranchObjectives:
          scienceBranchObjectives.push(aObject);
          break;
      }
    });

    return {
      earlyChildhoodEducationSubjects,
      earlyChildhoodEducationObjectives,
      prePrimaryEducationSubjects,
      prePrimaryEducationObjectives,
      basicStudySubjects,
      basicStudyObjectives,
      basicStudyContents,
      upperSecondarySchoolSubjects,
      upperSecondarySchoolObjectives,
      upperSecondarySchoolSubjectsNew,
      upperSecondarySchoolModulesNew,
      upperSecondarySchoolObjectivesNew,
      upperSecondarySchoolContentsNew,
      vocationalDegrees,
      vocationalUnits,
      vocationalEducationObjectives,
      selfMotivatedEducationSubjects,
      selfMotivatedEducationObjectives,
      scienceBranches,
      scienceBranchObjectives,
    };
  }
}
