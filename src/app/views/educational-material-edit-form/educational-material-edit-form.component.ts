import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-educational-material-edit-form',
  templateUrl: './educational-material-edit-form.component.html',
  styleUrls: ['./educational-material-edit-form.component.scss']
})
export class EducationalMaterialEditFormComponent implements OnInit {
  materialId: string;

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.materialId = this.route.snapshot.paramMap.get('materialId');
  }
}
