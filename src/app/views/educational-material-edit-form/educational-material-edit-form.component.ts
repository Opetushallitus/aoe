import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BackendService } from '@services/backend.service';
import { Subscription } from 'rxjs';
import { EducationalMaterialForm } from '@models/educational-material-form';

@Component({
  selector: 'app-educational-material-edit-form',
  templateUrl: './educational-material-edit-form.component.html',
  styleUrls: ['./educational-material-edit-form.component.scss']
})
export class EducationalMaterialEditFormComponent implements OnInit, OnDestroy {
  materialId: string;
  materialSubscription: Subscription;
  material: EducationalMaterialForm;
  tabId: number;
  routeSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private backendSvc: BackendService,
  ) { }

  ngOnInit(): void {
    this.materialId = this.route.snapshot.paramMap.get('materialId');

    this.materialSubscription = this.backendSvc.editMaterial$.subscribe((material: EducationalMaterialForm) => {
      this.material = material;
    });
    this.backendSvc.updateEditMaterial(+this.materialId);

    this.routeSubscription = this.route.paramMap.subscribe((params: Params) => {
      this.tabId = params.get('tabId');

      if (!this.tabId) {
        this.router.navigate(['/muokkaa-oppimateriaalia', this.materialId, 1]);
      }
    });
  }

  ngOnDestroy(): void {
    this.materialSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }
}
