import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateCollectionPost } from '@models/collections/create-collection-post';
import { CreateCollectionResponse } from '@models/collections/create-collection-response';
import { catchError } from 'rxjs/operators';
import { AddToCollectionResponse } from '@models/collections/add-to-collection-response';
import { AddToCollectionPost } from '@models/collections/add-to-collection-post';
import { UserCollection } from '@models/collections/user-collection';
import { UserCollectionResponse } from '@models/collections/user-collection-response';
import { RemoveFromCollectionPost } from '@models/collections/remove-from-collection-post';
import { RemoveFromCollectionResponse } from '@models/collections/remove-from-collection-response';
import { Collection } from '@models/collections/collection';
import {
  CollectionForm,
  CollectionFormMaterial,
  CollectionFormMaterialAndHeading,
  CollectionFormMaterialAuthor,
} from '@models/collections/collection-form';
import { UpdateCollectionPut } from '@models/collections/update-collection-put';
import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { koodistoSources } from '../constants/koodisto-sources';

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

  private handleError(error: HttpErrorResponse) {
    console.error(error);

    return throwError('Something bad happened; please try again later.');
  }

  /**
   * Creates new collection.
   * @param payload {CreateCollectionPost}
   * @returns {Observable<CreateCollectionResponse>}
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
   * @param payload {AddToCollectionPost}
   * @returns {Observable<AddToCollectionResponse>}
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
   * @param payload {RemoveFromCollectionPost}
   * @returns {Observable<RemoveFromCollectionResponse>}
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
   * @param collectionId {string}
   */
  updateCollection(collectionId: string): void {
    this.http.get<Collection>(`${environment.backendUrl}/collection/getCollection/${collectionId}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((collection: Collection) => {
      this.collection$.next(collection);
    });
  }

  updateEditCollection(collectionId: string): void {
    this.http.get<Collection>(`${environment.backendUrl}/collection/getCollection/${collectionId}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((collection: Collection) => {
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

      collection.alignmentObjects.forEach((aObject: AlignmentObjectExtended) => {
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
        name: collection.collection.name,
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
          };
        }),
        materialsAndHeadings,
        description: collection.collection.description,
        educationalLevels: collection.educationalLevels,
        earlyChildhoodEducationSubjects,
        earlyChildhoodEducationObjectives,
        prePrimaryEducationSubjects,
        prePrimaryEducationObjectives,
        basicStudySubjects,
        basicStudyObjectives,
        basicStudyContents,
        currentUpperSecondarySchoolSelected: upperSecondarySchoolSubjects.length > 0,
        newUpperSecondarySchoolSelected: upperSecondarySchoolSubjectsNew.length > 0,
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

      this.editCollection$.next(collectionForm);
    });
  }

  updateCollectionDetails(collection: UpdateCollectionPut) {
    return this.http.put(`${environment.backendUrl}/collection/update`, collection)
      .pipe(
        catchError(this.handleError),
      );
  }
}
