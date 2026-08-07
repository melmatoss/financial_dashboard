import { Injectable, computed, signal, resource, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TransactionService } from './transaction.service';
import { Transaction, TransactionFilters, CreateTransactionDTO } from './transaction.model';
import { ChartDataPoint } from '../../shared/charts/pie-chart/pie-chart';

@Injectable({ providedIn: 'root' })
export class TransactionStore {
  private transactionService = inject(TransactionService);

  private _filters = signal<TransactionFilters>({ period: 'month' });
  filters = this._filters.asReadonly();

  private transactionsResource = resource({
    loader: () => firstValueFrom(this.transactionService.getAll())
  });

  transactions = computed(() => this.transactionsResource.value() ?? []);
  loading = computed(() => this.transactionsResource.isLoading());
  error = computed(() => this.transactionsResource.error());

  filteredTransactions = computed(() => {
    const all = this.transactions();
    const filters = this._filters();

    return all.filter(t => {
      if (filters.categoryId && t.categoryId !== filters.categoryId) return false;
      if (filters.searchTerm && !t.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      return true;
    });
  });

  totalIncome = computed(() =>
    this.filteredTransactions()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  totalExpense = computed(() =>
    this.filteredTransactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  );

  balance = computed(() => this.totalIncome() - this.totalExpense());

  // Mapeamento temporário de categorias
  private categoryNames: Record<string, string> = {
    food: 'Alimentação',
    transport: 'Transporte',
    rent: 'Moradia',
    leisure: 'Lazer'
  };

  // Dados prontos para o gráfico
  expensesByCategory = computed<ChartDataPoint[]>(() => {
    const grouped = new Map<string, number>();

    for (const transaction of this.filteredTransactions()) {
      if (transaction.type !== 'expense') continue;

      grouped.set(
        transaction.categoryId,
        (grouped.get(transaction.categoryId) ?? 0) + Math.abs(transaction.amount)
      );
    }

    return Array.from(grouped.entries()).map(([categoryId, total]) => ({
      name: this.categoryNames[categoryId] ?? 'Sem categoria',
      value: total
    }));
  });

  async addTransaction(dto: CreateTransactionDTO): Promise<void> {
    await firstValueFrom(this.transactionService.create(dto));
    this.transactionsResource.reload();
  }

  async removeTransaction(id: string): Promise<void> {
    await firstValueFrom(this.transactionService.delete(id));
    this.transactionsResource.reload();
  }

  updateFilters(filters: Partial<TransactionFilters>): void {
    this._filters.update(current => ({ ...current, ...filters }));
  }
}