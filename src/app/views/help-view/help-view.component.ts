import { Component } from '@angular/core';

@Component({
  selector: 'app-help-view',
  templateUrl: './help-view.component.html',
})
export class HelpViewComponent {
  log(event: boolean) {
    console.log(`Accordion has been ${event ? 'opened' : 'closed'}`);
  }
}
