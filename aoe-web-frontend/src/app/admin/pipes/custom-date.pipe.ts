import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'customDate',
  standalone: false
})
export class CustomDatePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '-'
    }
    const date: Date = new Date(value)
    const day: number = date.getDate()
    const month: number = date.getMonth() + 1
    const year: number = date.getFullYear()
    const hours: string = `0${date.getHours()}`.slice(-2)
    const minutes: string = `0${date.getMinutes()}`.slice(-2)
    const seconds: string = `0${date.getSeconds()}`.slice(-2)
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`
  }
}
