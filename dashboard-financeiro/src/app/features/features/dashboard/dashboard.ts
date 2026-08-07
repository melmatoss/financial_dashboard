import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PieChartComponent } from '../../../shared/charts/pie-chart/pie-chart';
import { TransactionStore } from '../../../data-access/transactions/transation.store';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, PieChartComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  private store = inject(TransactionStore);

  balance = this.store.balance;
  totalIncome = this.store.totalIncome;
  totalExpense = this.store.totalExpense;
  loading = this.store.loading;
  error = this.store.error;
  expensesByCategory = this.store.expensesByCategory;
}