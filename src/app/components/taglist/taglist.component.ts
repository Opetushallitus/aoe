import { Component, Input } from '@angular/core';
import { SearchParams } from '@models/search/search-params';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { UsedFilter } from '@models/search/used-filter';
import { isObservable, Observable, of } from 'rxjs';

@Component({
    selector: 'app-taglist',
    templateUrl: './taglist.component.html',
    styleUrls: ['./taglist.component.scss'],
})
export class TaglistComponent {
    @Input() elementId: string;
    @Input() title: string;
    @Input() card?: boolean;
    @Input() hiddenTagsAmount?: number;
    @Input() property?: string;
    @Input() searchProperty?: string;
    @Input() filterType?: string;
    @Input() suitsAll?: boolean;

    private from = 0;
    private resultsPerPage = 15;
    private _tags$: Observable<any>;

    @Input() set tags(value: Record<string, unknown>[] | Observable<any>) {
        if (!isObservable(value)) {
            this._tags$ = of(value);
        }
        this._tags$ = value as Observable<any>;
    }

    get tags(): any {
        return this._tags$;
    }

    constructor(private router: Router) {}

    search(key: string, value: string): void {
        const searchParams: SearchParams = {
            keywords: null,
            filters: {
                [this.filterType]: [key],
            },
            from: this.from,
            size: this.resultsPerPage,
        };

        const usedFilters: UsedFilter[] = [
            {
                key: key,
                value: value,
                type: this.filterType,
            },
        ];

        sessionStorage.setItem(environment.searchParams, JSON.stringify(searchParams));
        sessionStorage.setItem(environment.usedFilters, JSON.stringify(usedFilters));

        this.router.navigate(['/haku']).then();
    }
}
