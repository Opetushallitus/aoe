import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { SearchResults } from '@models/search/search-results';
import { CollectionSearchResults } from '@models/search/collection-search-results';
import { CollectionSearchParams } from '@models/search/collection-search-params';
import { SearchParams } from '@models/search/search-params';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  public searchResults$ = new Subject<SearchResults>();
  public collectionSearchResults$ = new Subject<CollectionSearchResults>();

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * Updates search results based on search params.
   * @param {SearchParams} searchParams
   */
  updateSearchResults(searchParams: SearchParams): void {
    sessionStorage.setItem(environment.searchParams, JSON.stringify(searchParams));

    this.http.post<SearchResults>(`${environment.backendUrl}/elasticSearch/search`, searchParams, {
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
   * @param {CollectionSearchParams} searchParams
   */
  updateCollectionSearchResults(searchParams: CollectionSearchParams): void {
    sessionStorage.setItem(environment.collectionSearchParams, JSON.stringify(searchParams));

    this.http.post<CollectionSearchResults>(`${environment.backendUrl}/elasticSearch/searchCollections`, searchParams, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((results: CollectionSearchResults) => {
      sessionStorage.setItem(environment.collectionSearchResults, JSON.stringify(results));

      this.collectionSearchResults$.next(results);
    });
  }
}
