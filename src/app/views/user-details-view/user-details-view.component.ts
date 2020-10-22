import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-details-view',
  templateUrl: './user-details-view.component.html',
  styleUrls: ['./user-details-view.component.scss']
})
export class UserDetailsViewComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private titleSvc: Title,
  ) { }

  ngOnInit(): void {
    this.setTitle();
  }

  setTitle(): void {
    this.translate.get('titles.userDetails').subscribe((title: string) => {
      this.titleSvc.setTitle(`${title} ${environment.title}`);
    });
  }
}
