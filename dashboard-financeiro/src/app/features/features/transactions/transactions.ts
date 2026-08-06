import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TransactionStore } from '../../../data-access/transactions/transation.store';

@Component({
  selector: 'app-transactions',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class TransactionsComponent {
  private store = inject(TransactionStore);

  transactions = this.store.filteredTransactions;
  loading = this.store.loading;

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.updateFilters({ searchTerm: value });
  }

  onRemove(id: string): void {
    this.store.removeTransaction(id);
  }
}