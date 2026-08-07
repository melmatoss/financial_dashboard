import { Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export interface MonthlyDataPoint {
  month: string;
  income: number;
  expense: number;
}

@Component({
  selector: 'app-bar-chart',
  template: `<canvas #canvas></canvas>`,
})
export class BarChartComponent implements OnDestroy {
  data = input.required<MonthlyDataPoint[]>();

  private canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart: Chart | null = null;

  constructor() {
    effect(() => {
      const points = this.data();
      const canvasElement = this.canvasRef().nativeElement;
      this.renderChart(canvasElement, points);
    });
  }

  private renderChart(canvas: HTMLCanvasElement, points: MonthlyDataPoint[]): void {
    const labels = points.map(p => p.month);
    const incomeData = points.map(p => p.income);
    const expenseData = points.map(p => p.expense);

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = incomeData;
      this.chart.data.datasets[1].data = expenseData;
      this.chart.update();
      return;
    }

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Receitas', data: incomeData, backgroundColor: '#10b981' },
          { label: 'Despesas', data: expenseData, backgroundColor: '#ef4444' },
        ],
      },
      options: {
        responsive: true,
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