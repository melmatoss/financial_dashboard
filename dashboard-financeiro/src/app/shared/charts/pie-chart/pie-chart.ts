import { Component, ElementRef, OnDestroy, computed, effect, input, viewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export interface ChartDataPoint {
  name: string;
  value: number;
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

@Component({
  selector: 'app-pie-chart',
  imports: [CurrencyPipe],
  template: `
    <div class="donut-layout">
      <div class="donut-canvas-wrapper">
        <canvas #canvas></canvas>
        <div class="donut-center">
          <span class="donut-center-label">Total</span>
          <strong class="donut-center-value">{{ total() | currency:'BRL' }}</strong>
        </div>
      </div>

      <ul class="donut-legend">
        @for (item of legendItems(); track item.name) {
          <li>
            <span class="dot" [style.background]="item.color"></span>
            <div class="legend-text">
              <div class="legend-name">{{ item.name }}</div>
              <div class="legend-percent">{{ item.percent }}%</div>
            </div>
            <div class="legend-value">{{ item.value | currency:'BRL' }}</div>
          </li>
        }
      </ul>
    </div>
  `,
  styleUrl: './pie-chart.scss',
})
export class PieChartComponent implements OnDestroy {
  data = input.required<ChartDataPoint[]>();

  private canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart: Chart | null = null;

  total = computed(() => this.data().reduce((sum, d) => sum + d.value, 0));

  legendItems = computed(() => {
    const totalValue = this.total();
    return this.data().map((d, i) => ({
      name: d.name,
      value: d.value,
      percent: totalValue > 0 ? Math.round((d.value / totalValue) * 100) : 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  });

  constructor() {
    effect(() => {
      const points = this.data();
      const canvasElement = this.canvasRef().nativeElement;
      this.renderChart(canvasElement, points);
    });
  }

  private renderChart(canvas: HTMLCanvasElement, points: ChartDataPoint[]): void {
    const colors = points.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

    if (this.chart) {
      this.chart.data.labels = points.map(p => p.name);
      this.chart.data.datasets[0].data = points.map(p => p.value);
      this.chart.data.datasets[0].backgroundColor = colors;
      this.chart.update();
      return;
    }

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: points.map(p => p.name),
        datasets: [{
          data: points.map(p => p.value),
          backgroundColor: colors,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}