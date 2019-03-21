import { Component, OnInit } from '@angular/core';
import { KoodistoTestiService } from '../../services/koodisto-testi.service';

@Component({
  selector: 'app-koodisto-testi',
  templateUrl: './koodisto-testi.component.html',
})
export class KoodistoTestiComponent implements OnInit {
  public data: object;

  constructor(public koodistoSvc: KoodistoTestiService) { }

  ngOnInit(): void {
    // this.koodistoSvc.getOpetussuunnitelmat().subscribe(data => {
    this.koodistoSvc.getKielet().subscribe(data => {
      this.data = data;
    });
  }
}
