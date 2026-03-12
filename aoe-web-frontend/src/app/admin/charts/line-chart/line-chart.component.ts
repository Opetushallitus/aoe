import { Component, Input } from '@angular/core'
import { EChartsOption } from 'echarts'
import { NgxEchartsDirective } from 'ngx-echarts'

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  imports: [NgxEchartsDirective]
})
export class LineChartComponent {
  @Input() options: EChartsOption
}
