import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { SearchParams } from '@models/search/search-params';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { UsedFilter } from '@models/search/used-filter';

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
    private _tags: any[];

    @Input() set tags(value: any[]) {
        console.debug('tags: ', value);
        this._tags = value;
        this.changeDetectorRef.detectChanges();
    }

    get tags(): any {
        return this._tags;
    }

    constructor(private changeDetectorRef: ChangeDetectorRef, private router: Router) {}

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
