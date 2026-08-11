import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Transaction, CreateTransactionDTO } from './transaction.model';
import { AuthService } from '../../core/services/auth';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly baseUrl = '/api/transactions';

  private authHeaders(): HttpHeaders {
    const userId = this.authService.currentUser()?.id ?? '';
    return new HttpHeaders({ 'X-User-Id': userId });
  }

  getAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.baseUrl, { headers: this.authHeaders() }).pipe(
      map(transactions => transactions.map(t => this.deserializeDates(t)))
    );
  }

  create(dto: CreateTransactionDTO): Observable<Transaction> {
    return this.http.post<Transaction>(this.baseUrl, dto, { headers: this.authHeaders() }).pipe(
      map(t => this.deserializeDates(t))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }

  private deserializeDates(transaction: Transaction): Transaction {
    return {
      ...transaction,
      date: new Date(transaction.date),
      createdAt: new Date(transaction.createdAt),
    };
  }
}