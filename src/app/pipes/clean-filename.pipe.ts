import { Pipe, PipeTransform } from '@angular/core';
import { validateFilename } from '../shared/shared.module';

@Pipe({
  name: 'cleanFilename'
})
export class CleanFilenamePipe implements PipeTransform {
  transform(value: string): string {
    return value ? validateFilename(value) : '';
  }
}
