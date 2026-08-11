import { http, HttpResponse } from 'msw';
import { Transaction } from '../data-access/transactions/transaction.model';
import { Category } from '../data-access/categories/categories.models';
const mockCategories: Category[] = [
  { id: 'food', name: 'Alimentação', color: '#f59e0b' },
  { id: 'transport', name: 'Transporte', color: '#3b82f6' },
  { id: 'rent', name: 'Moradia', color: '#ef4444' },
  { id: 'leisure', name: 'Lazer', color: '#8b5cf6' },
  { id: 'salary', name: 'Salário', color: '#10b981' },
  { id: 'other', name: 'Outros', color: '#6b7280' },
];

function storageKey(userId: string): string {
  return `dashboard-financeiro:transactions:${userId}`;
}

function loadTransactions(userId: string): Transaction[] {
  const stored = localStorage.getItem(storageKey(userId));
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as Transaction[];
    return parsed.map(t => ({
      ...t,
      date: new Date(t.date),
      createdAt: new Date(t.createdAt),
    }));
  } catch {
    return [];
  }
}

function saveTransactions(userId: string, transactions: Transaction[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(transactions));
}

export const handlers = [
  http.get('/api/transactions', ({ request }) => {
    const userId = request.headers.get('X-User-Id') ?? '';
    return HttpResponse.json(loadTransactions(userId));
  }),

  http.post('/api/transactions', async ({ request }) => {
    const userId = request.headers.get('X-User-Id') ?? '';
    const dto = await request.json() as Omit<Transaction, 'id' | 'source' | 'createdAt'>;

    const newTransaction: Transaction = {
      ...dto,
      id: crypto.randomUUID(),
      source: 'manual',
      createdAt: new Date(),
    };

    const transactions = loadTransactions(userId);
    transactions.push(newTransaction);
    saveTransactions(userId, transactions);

    return HttpResponse.json(newTransaction, { status: 201 });
  }),

  http.delete('/api/transactions/:id', ({ request, params }) => {
    const userId = request.headers.get('X-User-Id') ?? '';
    const { id } = params;

    const transactions = loadTransactions(userId);
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions.splice(index, 1);
      saveTransactions(userId, transactions);
    }

    return HttpResponse.json(null, { status: 204 });
  }),

  http.get('/api/categories', () => {
    return HttpResponse.json(mockCategories);
  }),
];