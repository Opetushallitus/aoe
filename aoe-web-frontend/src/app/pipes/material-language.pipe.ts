import { Pipe, PipeTransform } from '@angular/core'
import { Material } from '@models/material'
import { Subtitle } from '@models/subtitle'

@Pipe({
    name: 'materialLanguage',
    standalone: false
})
export class MaterialLanguagePipe implements PipeTransform {
  transform(materials: Material[], lang: string): Material[] {
    return materials.filter((material: Material) => {
      if (
        material.language === lang ||
        material.subtitles.find((subtitle: Subtitle) => subtitle.srclang === lang)
      ) {
        return material
      }
    })
  }
}
