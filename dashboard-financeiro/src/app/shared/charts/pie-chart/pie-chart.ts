import { Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export interface ChartDataPoint {
  name: string;
  value: number;
}

@Component({
  selector: 'app-pie-chart',
  template: `<canvas #canvas></canvas>`,
})
export class PieChartComponent implements OnDestroy {
  data = input.required<ChartDataPoint[]>();

  private canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart: Chart | null = null;

  constructor() {
    effect(() => {
      const points = this.data();
      const canvasElement = this.canvasRef().nativeElement;
      this.renderChart(canvasElement, points);
    });
  }

  private renderChart(canvas: HTMLCanvasElement, points: ChartDataPoint[]): void {
    if (this.chart) {
      this.chart.data.labels = points.map(p => p.name);
      this.chart.data.datasets[0].data = points.map(p => p.value);
      this.chart.update();
      return;
    }

    this.chart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: points.map(p => p.name),
        datasets: [{
          data: points.map(p => p.value),
          backgroundColor: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'],
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}