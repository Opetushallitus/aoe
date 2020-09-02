import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { SearchResult, SearchResults } from '@models/search/search-results';
import { SearchParams } from '@models/search/search-params';
import { deduplicate } from '../shared/shared.module';
import { KeyValue } from '@angular/common';
import { SearchFilterEducationalSubject, SearchFilters } from '@models/search/search-filters';

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
  public searchFilters$ = new Subject<SearchFilters>();

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * Updates search results based on keywords.
   * @param {SearchParams} keywords
   */
  updateSearchResults(keywords: SearchParams): void {
    sessionStorage.setItem(environment.searchParams, JSON.stringify(keywords));

    this.http.post(`${this.apiUri}/elasticSearch/search`, keywords, this.httpOptions)
      .subscribe((results: SearchResults) => {
        this.searchResults$.next(results);
      });
  }

  updateSearchFilters(searchParams: SearchParams): void {
    delete searchParams.from;
    delete searchParams.size;

    this.http.post(`${this.apiUri}/elasticSearch/search`, searchParams, this.httpOptions)
      .subscribe((results: SearchResults) => {
        let languages: string[] = [];
        let authors: string[] = [];
        let organizations: KeyValue<string, string>[] = [];
        let roles: KeyValue<string, string>[] = [];
        let keywords: KeyValue<string, string>[] = [];
        let subjects: SearchFilterEducationalSubject[] = [];
        let teaches: KeyValue<string | number, string>[] = [];

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
            subjects.push(subject);
          });

          // teaches
          result.teaches?.forEach((teach) => {
            teaches.push({
              key: teach.key,
              value: teach.value,
            });
          });
        });

        languages = [...new Set(languages)];
        authors = [...new Set(authors)].sort((a, b) => a.localeCompare(b));
        organizations = deduplicate(organizations, 'key').sort((a, b) => a.value.localeCompare(b.value));
        roles = deduplicate(roles, 'key').sort((a, b) => a.value.localeCompare(b.value));
        keywords = deduplicate(keywords, 'key').sort((a, b) => a.value.localeCompare(b.value));
        subjects = deduplicate(subjects, 'key').sort((a, b) => a.value.localeCompare(b.value));
        teaches = deduplicate(teaches, 'key').sort((a, b) => a.value.localeCompare(b.value));

        this.searchFilters$.next({
          languages,
          authors,
          organizations,
          roles,
          keywords,
          subjects,
          teaches,
        });
      });
  }
}
