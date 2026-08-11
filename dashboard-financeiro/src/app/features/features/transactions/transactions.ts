import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionStore } from '../../../data-access/transactions/transation.store';
import { TransactionFormComponent } from '../../transactions/transaction-form/transaction-form';
import { CreateTransactionDTO, Transaction } from '../../../data-access/transactions/transaction.model';

@Component({
  selector: 'app-transactions',
  imports: [CurrencyPipe, DatePipe, TransactionFormComponent],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class TransactionsComponent {
  private store = inject(TransactionStore);

  transactions = this.store.filteredTransactions;
  loading = this.store.loading;
  isModalOpen = signal(false);
  transactionToDelete = signal<Transaction | null>(null);

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.updateFilters({ searchTerm: value });
  }

  askToRemove(transaction: Transaction): void {
    this.transactionToDelete.set(transaction);
  }

  cancelRemove(): void {
    this.transactionToDelete.set(null);
  }

  async confirmRemove(): Promise<void> {
    const transaction = this.transactionToDelete();
    if (!transaction) return;

    await this.store.removeTransaction(transaction.id);
    this.transactionToDelete.set(null);
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  async onSave(dto: CreateTransactionDTO): Promise<void> {
    await this.store.addTransaction(dto);
    this.isModalOpen.set(false);
  }

  onCancel(): void {
    this.isModalOpen.set(false);
  }
}