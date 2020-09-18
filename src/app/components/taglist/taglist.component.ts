import { Component, Input, OnInit } from '@angular/core';
import { SearchParams } from '@models/search/search-params';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-taglist',
  templateUrl: './taglist.component.html',
  styleUrls: ['./taglist.component.scss']
})
export class TaglistComponent implements OnInit {
  @Input() elementId: string;
  @Input() tags: any[];
  @Input() title: string;
  @Input() card?: boolean;
  @Input() hiddenTagsAmount?: number;
  @Input() property?: string;
  @Input() searchProperty?: string;
  @Input() filterType?: string;
  private from = 0;
  private resultsPerPage = 15;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  search(searchValue: string): void {
    const searchParams: SearchParams = {
      keywords: null,
      filters: {
        [this.filterType]: [searchValue],
      },
      from: this.from,
      size: this.resultsPerPage,
    };

    sessionStorage.setItem(environment.searchParams, JSON.stringify(searchParams));

    this.router.navigate(['/haku']);
  }
}
