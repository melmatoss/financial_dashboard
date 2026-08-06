import { http, HttpResponse } from 'msw';
import { Transaction } from '../data-access/transactions/transaction.model';

const mockTransactions: Transaction[] = [
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

export const handlers = [
  http.get('/api/transactions', () => {
    return HttpResponse.json(mockTransactions);
  }),

  http.post('/api/transactions', async ({ request }) => {
    const newTransaction = await request.json();
    return HttpResponse.json(newTransaction, { status: 201 });
  }),

  http.delete('/api/transactions/:id', ({ params }) => {
    const { id } = params;
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTransactions.splice(index, 1);
    }
    return HttpResponse.json(null, { status: 204 });
  })
];