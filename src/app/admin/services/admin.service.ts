import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { catchError } from 'rxjs/operators';
import {
  AoeUser,
  AoeUsersResponse,
  ChangeOwnerResponse,
  ChangeOwnerPost,
  RemoveMaterialResponse,
  MaterialInfoResponse,
} from '../model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  public users$ = new Subject<AoeUser[]>();
  public materialInfo$ = new Subject<MaterialInfoResponse>();

  constructor(private http: HttpClient) {}

  /**
   * Handles errors.
   * @param {HttpErrorResponse} _error
   * @private
   */
  private handleError(_error: HttpErrorResponse): Observable<never> {
    return throwError('Something bad happened; please try again later.');
  }

  /**
   * Updates list of aoe users.
   */
  updateUsers(): void {
    this.http
      .get<AoeUsersResponse>(`${environment.backendUrl}/aoeUsers`)
      .subscribe((usersResponse: AoeUsersResponse) => {
        const users = usersResponse.users
          .sort((a: AoeUser, b: AoeUser) => +a.id - +b.id)
          .map((user: AoeUser) => ({
            ...user,
            fullName: `${user.firstname} ${user.lastname}`,
          }));

        this.users$.next(users);
      });
  }

  /**
   * Changes owner of educational material.
   * @param {ChangeOwnerPost} payload
   * @returns {Observable<ChangeOwnerResponse>}
   */
  changeMaterialOwner(payload: ChangeOwnerPost): Observable<ChangeOwnerResponse> {
    return this.http
      .post<ChangeOwnerResponse>(`${environment.backendUrl}/changeUser`, payload)
      .pipe(catchError(this.handleError));
  }

  removeMaterial(materialId: string): Observable<RemoveMaterialResponse> {
    return this.http
      .delete<RemoveMaterialResponse>(`${environment.backendUrl}/removeMaterial/${materialId}`)
      .pipe(catchError(this.handleError));
  }

  updateMaterialInfo(materialId: string): void {
    this.http.get<MaterialInfoResponse>(`${environment.backendUrl}/names/${materialId}`).subscribe(
      (response: MaterialInfoResponse) => this.materialInfo$.next(response),
      () => this.materialInfo$.next(null),
    );
  }
}
