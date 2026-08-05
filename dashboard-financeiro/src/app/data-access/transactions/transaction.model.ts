export interface Transaction {
  id: string;
  description: string;
  amount: number;          // positivo = receita, negativo = despesa
  date: Date;
  categoryId: string;
  type: 'income' | 'expense';
  source: 'manual' | 'import';
  createdAt: Date;
}

export interface TransactionFilters {
  period: 'week' | 'month' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  searchTerm?: string;
}

export interface CreateTransactionDTO {
  description: string;
  amount: number;
  date: Date;
  categoryId: string;
  type: 'income' | 'expense';
}