import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { SearchResults } from '@models/search/search-results';

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

  public searchResults$ = new Subject<SearchResults>();

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * Updates search results based on keywords.
   * @param {string} keywords
   */
  updateSearchResults(keywords: string): void {
    sessionStorage.setItem(environment.searchParams, JSON.stringify(keywords));

    this.http.post(`${this.apiUri}/elasticSearch/search`, keywords, this.httpOptions)
      .subscribe((results: SearchResults) => {
        sessionStorage.setItem(environment.searchResults, JSON.stringify(results));

        this.searchResults$.next(results);
      });
  }
}
