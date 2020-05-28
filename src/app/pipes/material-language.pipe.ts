import { Pipe, PipeTransform } from '@angular/core';
import { Material } from '@models/material';

@Pipe({
  name: 'materialLanguage'
})
export class MaterialLanguagePipe implements PipeTransform {
  transform(materials: Material[], lang: string): any {
    return materials.filter((material: Material) => material.language === lang);
  }
}
