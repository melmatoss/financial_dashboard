import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Transaction, CreateTransactionDTO } from './transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/transactions';

  getAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.baseUrl).pipe(
      map(transactions => transactions.map(t => this.deserializeDates(t)))
    );
  }

  create(dto: CreateTransactionDTO): Observable<Transaction> {
    return this.http.post<Transaction>(this.baseUrl, dto).pipe(
      map(t => this.deserializeDates(t))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private deserializeDates(transaction: Transaction): Transaction {
    return {
      ...transaction,
      date: new Date(transaction.date),
      createdAt: new Date(transaction.createdAt),
    };
  }
}