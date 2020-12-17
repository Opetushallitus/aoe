import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { AoeUser, AoeUsersResponse } from '@models/admin/aoe-users-response';
import { ChangeOwnerResponse } from '@models/admin/change-owner-response';
import { ChangeOwnerPost } from '@models/admin/change-owner-post';
import { RemoveMaterialResponse } from '@models/admin/remove-material-response';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  public users$ = new Subject<AoeUser[]>();

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * Handles errors.
   * @param {HttpErrorResponse} error
   * @private
   */
  private handleError(error: HttpErrorResponse) {
    return throwError('Something bad happened; please try again later.');
  }

  /**
   * Checks if user has admin privileges.
   */
  getAdminStatus(): Observable<HttpResponse<string>> {
    return this.http.post(
      `${environment.backendUrl}/userinfo`,
      null,
      {
        observe: 'response',
        responseType: 'text',
      },
    ).pipe(
      catchError(this.handleError),
    );
  }

  /**
   * Updates list of aoe users.
   */
  updateUsers(): void {
    this.http.get<AoeUsersResponse>(`${environment.backendUrl}/aoeUsers`).subscribe((usersResponse: AoeUsersResponse) => {
      const users = usersResponse.users
        .sort((a: AoeUser, b: AoeUser) => +a.id - +b.id)
        .map((user: AoeUser) => {
          return {
            ...user,
            fullName: `${user.firstname} ${user.lastname}`
          };
        });

      this.users$.next(users);
    });
  }

  /**
   * Changes owner of educational material.
   * @param {ChangeOwnerPost} payload
   * @returns {Observable<ChangeOwnerResponse>}
   */
  changeMaterialOwner(payload: ChangeOwnerPost): Observable<ChangeOwnerResponse> {
    return this.http.post<ChangeOwnerResponse>(
      `${environment.backendUrl}/changeUser`,
      payload,
    ).pipe(
      catchError(this.handleError),
    );
  }

  removeMaterial(materialId: string): Observable<RemoveMaterialResponse> {
    return this.http.delete<RemoveMaterialResponse>(
      `${environment.backendUrl}/removeMaterial/${materialId}`,
    ).pipe(
      catchError(this.handleError),
    );
  }
}
