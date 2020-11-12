import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SocialMetadata } from '@models/social-metadata/social-metadata';
import { environment } from '../../environments/environment';
import { UpdateSocialMetadataResponse } from '@models/social-metadata/update-social-metadata-response';

@Injectable({
  providedIn: 'root'
})
export class SocialMetadataService {
  public socialMetadata$ = new Subject<SocialMetadata>();
  public userSocialMetadata$ = new Subject<SocialMetadata>();

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
   * Updates social metadata details.
   * @param {number} materialId
   */
  updateSocialMetadata(materialId: number): void {
    this.http.get<SocialMetadata>(`${environment.backendUrl}/metadata/${materialId}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((metadata: SocialMetadata) => {
      this.socialMetadata$.next(metadata);
    });
  }

  /**
   * Updates users social metadata details.
   * @param {number} materialId
   */
  updateUserSocialMetadata(materialId: number): void {
    this.http.get<SocialMetadata>(`${environment.backendUrl}/usersMetadata/${materialId}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((metadata: SocialMetadata) => {
      this.userSocialMetadata$.next(metadata);
    });
  }

  /**
   * Updates educational material social metadata.
   * @param {number} materialId
   * @param {SocialMetadata} metadata
   * @returns {Observable<UpdateSocialMetadataResponse>}
   */
  putMaterialSocialMetadata(materialId: number, metadata: SocialMetadata): Observable<UpdateSocialMetadataResponse> {
    return this.http.put<any>(`${environment.backendUrl}/metadata/${materialId}`, metadata)
      .pipe(
        catchError(this.handleError),
      );
  }
}
