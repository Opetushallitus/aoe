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

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  public userCollections$ = new Subject<UserCollection[]>();
  public privateUserCollections$ = new Subject<UserCollection[]>();
  public publicUserCollections$ = new Subject<UserCollection[]>();

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
}
