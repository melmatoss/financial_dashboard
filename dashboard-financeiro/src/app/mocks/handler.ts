import { http, HttpResponse } from 'msw';
import { Transaction } from '../data-access/transactions/transaction.model';
import { Category } from '../data-access/categories/categories.models';

const STORAGE_KEY = 'dashboard-financeiro:transactions';

const defaultTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Salário',
    amount: 5000,
    date: new Date('2026-08-01'),
    categoryId: 'salary',
    type: 'income',
    source: 'manual',
    createdAt: new Date('2026-08-01')
  },
  {
    id: '2',
    description: 'Supermercado',
    amount: -350,
    date: new Date('2026-08-03'),
    categoryId: 'food',
    type: 'expense',
    source: 'manual',
    createdAt: new Date('2026-08-03')
  }
];

const mockCategories: Category[] = [
  { id: 'food', name: 'Alimentação', color: '#f59e0b' },
  { id: 'transport', name: 'Transporte', color: '#3b82f6' },
  { id: 'rent', name: 'Moradia', color: '#ef4444' },
  { id: 'leisure', name: 'Lazer', color: '#8b5cf6' },
  { id: 'salary', name: 'Salário', color: '#10b981' },
  { id: 'other', name: 'Outros', color: '#6b7280' },
];

function loadTransactions(): Transaction[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultTransactions;

  try {
    const parsed = JSON.parse(stored) as Transaction[];
    return parsed.map(t => ({
      ...t,
      date: new Date(t.date),
      createdAt: new Date(t.createdAt),
    }));
  } catch {
    return defaultTransactions;
  }
}

function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

let mockTransactions: Transaction[] = loadTransactions();

export const handlers = [
  http.get('/api/transactions', () => {
    return HttpResponse.json(mockTransactions);
  }),

  http.post('/api/transactions', async ({ request }) => {
    const dto = await request.json() as Omit<Transaction, 'id' | 'source' | 'createdAt'>;

    const newTransaction: Transaction = {
      ...dto,
      id: crypto.randomUUID(),
      source: 'manual',
      createdAt: new Date(),
    };

    mockTransactions.push(newTransaction);
    saveTransactions(mockTransactions);

    return HttpResponse.json(newTransaction, { status: 201 });
  }),

  http.delete('/api/transactions/:id', ({ params }) => {
    const { id } = params;
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTransactions.splice(index, 1);
      saveTransactions(mockTransactions);
    }
    return HttpResponse.json(null, { status: 204 });
  }),

  http.get('/api/categories', () => {
    return HttpResponse.json(mockCategories);
  }),
];