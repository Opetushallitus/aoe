import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { SearchResult, SearchResults } from '@models/search/search-results';
import { CollectionSearchResults } from '@models/search/collection-search-results';
import { CollectionSearchParams } from '@models/search/collection-search-params';
import { SearchParams } from '@models/search/search-params';
import { deduplicate } from '../shared/shared.module';
import { KeyValue } from '@angular/common';
import { SearchFilterEducationalSubject, SearchFilters } from '@models/search/search-filters';
import { sortOptions } from '../constants/sort-options';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  public searchResults$ = new Subject<SearchResults>();
  public collectionSearchResults$ = new Subject<CollectionSearchResults>();
  public searchFilters$ = new Subject<SearchFilters>();

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * Updates search results based on search params.
   * @param {SearchParams} searchParams
   */
  updateSearchResults(searchParams: SearchParams): void {
    sessionStorage.setItem(environment.searchParams, JSON.stringify(searchParams));

    if (searchParams.sort) {
      searchParams.sort = sortOptions[searchParams.sort].sort;
    }

    this.http.post<SearchResults>(`${environment.backendUrl}/elasticSearch/search`, searchParams, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((results: SearchResults) => {
      this.searchResults$.next(results);
    });
  }

  /**
   * Updates collection search results based on search params.
   * @param {CollectionSearchParams} searchParams
   */
  updateCollectionSearchResults(searchParams: CollectionSearchParams): void {
    sessionStorage.setItem(environment.collectionSearchParams, JSON.stringify(searchParams));

    this.http.post<CollectionSearchResults>(`${environment.backendUrl}/elasticSearch/collection/search`, searchParams, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((results: CollectionSearchResults) => {
      sessionStorage.setItem(environment.collectionSearchResults, JSON.stringify(results));

      this.collectionSearchResults$.next(results);
    });
  }

  updateSearchFilters(searchParams: SearchParams): void {
    delete searchParams.from;
    delete searchParams.size;

    this.http.post(`${environment.backendUrl}/elasticSearch/search`, searchParams, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).subscribe((results: SearchResults) => {
      let languages: string[] = [];
      let authors: string[] = [];
      let organizations: KeyValue<string, string>[] = [];
      let roles: KeyValue<string, string>[] = [];
      let keywords: KeyValue<string, string>[] = [];
      let subjects: SearchFilterEducationalSubject[] = [];
      let teaches: KeyValue<string, string>[] = [];
      let uses: KeyValue<string, string>[] = [];
      let hazards: KeyValue<string, string>[] = [];
      let features: KeyValue<string, string>[] = [];
      let licenses: KeyValue<string, string>[] = [];

      results.results.forEach((result: SearchResult) => {
        // languages
        result.languages?.forEach((lang: string) => {
          languages.push(lang.toLowerCase());
        });

        // authors and organizations
        result.authors.forEach((author) => {
          if (author.authorname !== '') {
            authors.push(author.authorname.trim());
          }

          if (author.organization !== '') {
            organizations.push({
              key: author.organizationkey.trim(),
              value: author.organization.trim(),
            });
          }
        });

        // educational roles
        result.educationalRoles?.forEach((role) => {
          roles.push({
            key: role.educationalrolekey,
            value: role.value,
          });
        });

        // keywords
        result.keywords?.forEach((keyword) => {
          keywords.push({
            key: keyword.keywordkey,
            value: keyword.value,
          });
        });

        // subjects
        result.educationalSubjects?.forEach((subject) => {
          subjects.push({
            key: subject.key.toString(),
            source: subject.source,
            value: subject.value,
          });
        });

        // teaches
        result.teaches?.forEach((teach) => {
          teaches.push({
            key: teach.key.toString(),
            value: teach.value,
          });
        });

        // educational uses
        result.educationalUses?.forEach((use) => {
          uses.push({
            key: use.educationalusekey,
            value: use.value,
          });
        });

        // accessibility hazards
        result.accessibilityHazards?.forEach((hazard) => {
          hazards.push({
            key: hazard.accessibilityhazardkey,
            value: hazard.value,
          });
        });

        // accessibility features
        result.accessibilityFeatures?.forEach((feature) => {
          features.push({
            key: feature.accessibilityfeaturekey,
            value: feature.value,
          });
        });

        // licenses
        if (result.license?.key && result.license?.value) {
          licenses.push({
            key: result.license.key,
            value: result.license.value,
          });
        }
      });

      languages = [...new Set(languages)];
      authors = [...new Set(authors)].sort((a, b) => a.localeCompare(b));
      organizations = deduplicate(organizations, 'key').sort((a, b) => a.value.localeCompare(b.value));
      roles = deduplicate(roles, 'key').sort((a, b) => a.value.localeCompare(b.value));
      keywords = deduplicate(keywords, 'key').sort((a, b) => a.value.localeCompare(b.value));
      subjects = deduplicate(subjects, 'key').sort((a, b) => a.value.localeCompare(b.value));
      teaches = deduplicate(teaches, 'key').sort((a, b) => a.value.localeCompare(b.value));
      uses = deduplicate(uses, 'key').sort((a, b) => a.value.localeCompare(b.value));
      hazards = deduplicate(hazards, 'key').sort((a, b) => a.value.localeCompare(b.value));
      features = deduplicate(features, 'key').sort((a, b) => a.value.localeCompare(b.value));
      licenses = deduplicate(licenses, 'key').sort((a, b) => a.value.localeCompare(b.value));

      this.searchFilters$.next({
        languages,
        authors,
        organizations,
        roles,
        keywords,
        subjects,
        teaches,
        uses,
        hazards,
        features,
        licenses,
      });
    });
  }
}
