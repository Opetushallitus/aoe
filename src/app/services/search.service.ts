import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  apiUri = environment.backendUrl;

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
    }),
  };

  public searchResults$ = new Subject<any>();

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * Updates search results based on keywords.
   * @param {string} keywords
   */
  updateSearchResults(keywords: string): void {
    this.http.post(`${this.apiUri}/elasticSearch/search`, keywords, this.httpOptions)
      .subscribe((results: any) => {
        this.searchResults$.next(results.body);
      });
  }
}
