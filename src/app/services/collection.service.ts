import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateCollectionPost } from '@models/collections/create-collection-post';
import { CreateCollectionResponse } from '@models/collections/create-collection-response';
import { catchError } from 'rxjs/operators';
import { AddToCollectionResponse } from '@models/collections/add-to-collection-response';
import { AddToCollectionPost } from '@models/collections/add-to-collection-post';
import { Collection } from '@models/collections/collection';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  public userCollections$ = new Subject<Collection[]>(); // @todo: replace any with Collection

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
    this.http.get<Collection[]>(`${environment.backendUrl}/collection/usercollections`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((collections: Collection[]) => {
      this.userCollections$.next(collections);
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
}
