import { Component, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTransactionDTO } from '../../../data-access/transactions/transaction.model';

@Component({
  selector: 'app-transaction-form',
  imports: [ReactiveFormsModule],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.scss',
})
export class TransactionFormComponent {
  private fb = new FormBuilder();

  saved = output<CreateTransactionDTO>();
  cancelled = output<void>();

  form = this.fb.nonNullable.group({
    description: ['', [Validators.required, Validators.minLength(3)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    type: ['expense' as 'income' | 'expense', Validators.required],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    categoryId: ['other', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const amount = raw.type === 'expense' ? -Math.abs(raw.amount) : Math.abs(raw.amount);

    this.saved.emit({
      description: raw.description,
      amount,
      type: raw.type,
      date: new Date(raw.date),
      categoryId: raw.categoryId,
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}