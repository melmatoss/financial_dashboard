import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TransactionStore } from '../../../data-access/transactions/transation.store';
import { CreateTransactionDTO } from '../../../data-access/transactions/transaction.model';
import {TransactionFormComponent } from "../../transactions/transaction-form/transaction-form";

@Component({
  selector: 'app-transactions',
  imports: [DatePipe, CurrencyPipe, TransactionFormComponent],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class TransactionsComponent {
  private store = inject(TransactionStore);

  transactions = this.store.filteredTransactions;
  loading = this.store.loading;
  isModalOpen = signal(false);

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.updateFilters({ searchTerm: value });
  }

  onRemove(id: string): void {
    this.store.removeTransaction(id);
  }

  //modal 
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