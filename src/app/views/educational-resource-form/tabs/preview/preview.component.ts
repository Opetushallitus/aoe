import { Component, OnInit } from '@angular/core';
import { getLocalStorageData } from '../../../../shared/shared.module';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
})
export class PreviewComponent implements OnInit {
  private localStorageKey = 'aoe.new-educational-resource';
  public savedData: any;

  constructor() { }

  ngOnInit() {
    this.savedData = getLocalStorageData(this.localStorageKey);
  }
}
