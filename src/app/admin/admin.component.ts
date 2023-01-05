import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { KoodistoService } from './services/koodisto.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AdminComponent implements OnInit {
    constructor(private titleSvc: Title,  public koodistoService: KoodistoService,) {}

    ngOnInit(): void {
        this.titleSvc.setTitle(`Bryssel ${environment.title}`);
        this.koodistoService.updateOrganizations();
        this.koodistoService.updateEducationalLevels();
        this.koodistoService.updateSubjectFilters();
    }
}
