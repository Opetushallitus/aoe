import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SearchParams } from '@models/search/search-params';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { UsedFilter } from '@models/search/used-filter';

@Component({
    selector: 'app-taglist',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './taglist.component.html',
    styleUrls: ['./taglist.component.scss'],
})
export class TaglistComponent {
    private _elementId: string;
    private _tags: any[];
    private _title: string;
    private _card?: boolean;
    private _hiddenTagsAmount?: number;
    private _property?: string;
    private _searchProperty?: string;
    private _filterType?: string;
    private _suitsAll?: boolean;

    private from = 0;
    private resultsPerPage = 15;

    @Input() set elementId(value: string) {
        this._elementId = value;
    }
    get elementId(): string {
        return this._elementId;
    }

    @Input() set tags(value: any[]) {
        this._tags = value;
    }
    get tags(): any[] {
        return this._tags;
    }

    @Input() set title(value: string) {
        this._title = value;
    }
    get title(): string {
        return this._title;
    }

    @Input() set card(value: boolean) {
        this._card = value;
    }
    get card(): boolean {
        return this._card;
    }

    @Input() set hiddenTagsAmount(value: number) {
        this._hiddenTagsAmount = value;
    }
    get hiddenTagsAmount(): number {
        return this._hiddenTagsAmount;
    }

    @Input() set property(value: string) {
        this._property = value;
    }
    get property(): string {
        return this._property;
    }

    @Input() set searchProperty(value: string) {
        this._searchProperty = value;
    }
    get searchProperty(): string {
        return this._searchProperty;
    }

    @Input() set filterType(value: string) {
        this._filterType = value;
    }
    get filterType(): string {
        return this._filterType;
    }

    @Input() set suitsAll(value: boolean) {
        this._suitsAll = value;
    }
    get suitsAll(): boolean {
        return this._suitsAll;
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
