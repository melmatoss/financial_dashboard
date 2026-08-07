import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CsvParserService, ParseResult } from '../../../data-access/import/csv-parser.service';
import { TransactionStore } from '../../../data-access/transactions/transation.store';

@Component({
  selector: 'app-import',
  imports: [CurrencyPipe],
  templateUrl: './import.html',
  styleUrl: './import.scss',
})
export class ImportComponent {
  private csvParser = inject(CsvParserService);
  private store = inject(TransactionStore);

  parseResult = signal<ParseResult | null>(null);
  importing = signal(false);
  importedCount = signal<number | null>(null);

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const result = await this.csvParser.parseFile(file);
    this.parseResult.set(result);
    this.importedCount.set(null);
  }

  async onConfirmImport(): Promise<void> {
    const result = this.parseResult();
    if (!result) return;

    this.importing.set(true);

    const validTransactions = result.rows
      .map(row => row.transaction)
      .filter(t => t !== null);

    for (const dto of validTransactions) {
      await this.store.addTransaction(dto);
    }

    this.importedCount.set(validTransactions.length);
    this.importing.set(false);
    this.parseResult.set(null);
  }

  onCancel(): void {
    this.parseResult.set(null);
  }
}