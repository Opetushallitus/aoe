import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KoodistoProxyService {
  private apiUri: string;
  private apiUriProd = 'https://koodisto.aoe.fi/api/v1';
  private apiUriDev = 'http://localhost:3000/api/v1';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {
    this.apiUri = environment.production ? this.apiUriProd : this.apiUriDev;
  }

  getData(rediskey: string, lang: string): Observable<any> {
    return this.http.get(`${this.apiUri}/${rediskey}/${lang}`, this.httpOptions);
  }
}
