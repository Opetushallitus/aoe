import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { SearchResults } from '@models/search/search-results';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  public searchResults$ = new Subject<SearchResults>();
  public collectionSearchResults$ = new Subject<any>(); // @todo: model

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * Updates search results based on keywords.
   * @param {string} keywords
   */
  updateSearchResults(keywords: string): void {
    sessionStorage.setItem(environment.searchParams, JSON.stringify(keywords));

    this.http.post(`${environment.backendUrl}/elasticSearch/search`, keywords, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((results: SearchResults) => {
      sessionStorage.setItem(environment.searchResults, JSON.stringify(results));

      this.searchResults$.next(results);
    });
  }

  /**
   * Updates collection search results based on search params.
   * @param {any} searchParams
   */
  updateCollectionSearchResults(searchParams: any): void {
    // @todo: save search params in session storage

    this.http.post(`${environment.backendUrl}/elasticSearch/searchCollections`, searchParams, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((results: any) => {
      // @todo: save search results in session storage

      this.collectionSearchResults$.next(results);
    });
  }
}
