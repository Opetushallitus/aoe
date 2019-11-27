import { Component, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
})
export class DialogComponent {
  bsModalRef: BsModalRef;
  title: string;
  message: string;

  constructor(private bsModalSvc: BsModalService) { }

  openDialog(template: TemplateRef<any>): void {
    this.bsModalRef = this.bsModalSvc.show(template, {class: 'modal-sm'});
  }

  confirm(): void {
    this.message = 'Confirmed';
    this.bsModalRef.hide();
  }

  decline(): void {
    this.message = 'Declined';
    this.bsModalRef.hide();
  }
}
