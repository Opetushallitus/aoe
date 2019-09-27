import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KoodistoProxyService {
  private apiUri = 'https://koodisto.aoe.fi/api/v1';

  private httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  /**
   * Returns data from koodisto-service by rediskey and language.
   * @param {string} rediskey
   * @param {string} lang
   */
  getData(rediskey: string, lang: string): Observable<any> {
    return this.http.get(`${this.apiUri}/${rediskey}/${lang}`, this.httpOptions);
  }
}
