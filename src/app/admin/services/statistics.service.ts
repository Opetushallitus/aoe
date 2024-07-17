import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import {
  StatisticsIntervalResponse,
  StatisticsPortionsPost,
  StatisticsPortionsResponse,
  StatisticsTimespanPost,
} from '../model';
import { IntervalEnum } from '@admin/model/enumeration/AnalyticsEnums';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
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
   * Search requests and material activity.
   * @param {StatisticsTimespanPost} payload
   * @returns {Observable<StatisticsIntervalResponse>}
   * @param {string} interval
   * @param {string} activity
   */
  getIntervalTotals(
    payload: StatisticsTimespanPost,
    interval: string,
    activity: string,
  ): Observable<StatisticsIntervalResponse> {
    return this.http
      .post<StatisticsIntervalResponse>(`${environment.statisticsBackendUrl}/${activity}/${interval}/total`, payload, {
        headers: new HttpHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Gets expired materials.
   * @param {StatisticsPortionsPost} payload
   * @returns {Observable<StatisticsPortionsResponse>}
   */
  getExpiredMaterials(payload: StatisticsPortionsPost): Observable<StatisticsPortionsResponse> {
    return this.http
      .post<StatisticsPortionsResponse>(`${environment.statisticsBackendUrl}/educationallevel/expired`, payload, {
        headers: new HttpHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Gets all materials.
   * @param {StatisticsPortionsPost} payload
   * @param {string} subject
   * @returns {Observable<StatisticsPortionsResponse>}
   */
  getPublishedMaterials(payload: StatisticsPortionsPost, subject: string): Observable<StatisticsPortionsResponse> {
    return this.http
      .post<StatisticsPortionsResponse>(`${environment.statisticsBackendUrl}/` + subject + `/all`, payload, {
        headers: new HttpHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  dateToString(date: Date, interval: IntervalEnum): string {
    switch (interval) {
      case IntervalEnum.DAY:
        return (
          date.getFullYear() +
          '-' +
          String(date.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(date.getDate()).padStart(2, '0')
        );
      case IntervalEnum.WEEK:
        const oneJan: Date = new Date(date.getFullYear(), 0, 1);
        const numberOfDays: number = Math.floor((date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
        const result: number = Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
        return date.getFullYear() + '-' + String(result).padStart(2, '0');
      case IntervalEnum.MONTH:
        return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    }
  }

  //creates an array of dates that can be used for xAxis
  createArrayOfDates(startDate: Date, endDate: Date, selectedInterval: IntervalEnum): string[] {
    const dateToBeAdded: Date = new Date(startDate); // Create a copy to avoid changing the referenced form value.
    const datesArray: string[] = [];
    switch (selectedInterval) {
      case IntervalEnum.DAY:
        // YYYY-MM-DD
        while (dateToBeAdded < endDate) {
          const formattedDate: string = this.dateToString(dateToBeAdded, IntervalEnum.DAY);
          datesArray.push(formattedDate);
          dateToBeAdded.setDate(dateToBeAdded.getDate() + 1);
        }
        break;
      case IntervalEnum.WEEK:
        // YYYY-ww
        while (dateToBeAdded < endDate) {
          const formattedDate: string = this.dateToString(dateToBeAdded, IntervalEnum.WEEK);
          if (datesArray.indexOf(formattedDate) == -1) {
            datesArray.push(formattedDate);
          }
          dateToBeAdded.setDate(dateToBeAdded.getDate() + 1);
        }
        break;
      case IntervalEnum.MONTH:
        // YYYY-MM
        while (dateToBeAdded < endDate) {
          const formattedDate: string = this.dateToString(dateToBeAdded, IntervalEnum.MONTH);
          if (datesArray.indexOf(formattedDate) == -1) {
            datesArray.push(formattedDate);
          }
          dateToBeAdded.setDate(dateToBeAdded.getDate() + 1);
        }
        break;
    }
    return datesArray;
  }
}
