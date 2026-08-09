import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PieChartComponent } from '../../../shared/charts/pie-chart/pie-chart';
import { TransactionStore } from '../../../data-access/transactions/transation.store';
import { BarChartComponent } from '../../../shared/charts/bar-chart/bar-chart';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, PieChartComponent, BarChartComponent, DatePipe, RouterLink],
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
  monthlyEvolution = this.store.monthlyEvolution;
  recentTransactions = this.store.recentTransactions;
  transactionCount = this.store.transactionCount;

  hasTransactions = computed(() => this.store.transactions().length > 0);
}