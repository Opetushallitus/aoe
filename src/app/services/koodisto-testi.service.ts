import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KoodistoTestiService {
  private apiUri = 'http://localhost:3000/api/v1';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) { }

  getLanguages(lang: string): Observable<any> {
    return this.http.get(`${this.apiUri}/kielet/${lang}`, this.httpOptions);
  }

  getOrganisations(lang: string): Observable<any> {
    return this.http.get(`${this.apiUri}/organisaatiot/${lang}`, this.httpOptions);
  }
}
