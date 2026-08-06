import { Injectable } from '@angular/core';
import Papa from 'papaparse';
import { CreateTransactionDTO } from '../transactions/transaction.model';

export interface ParsedRow {
  raw: Record<string, string>;
  transaction: CreateTransactionDTO | null;
  errors: string[];
}

export interface ParseResult {
  rows: ParsedRow[];
  validCount: number;
  errorCount: number;
}

@Injectable({ providedIn: 'root' })
export class CsvParserService {

  parseFile(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true,
        complete: (results) => {
          const rows = (results.data as Record<string, string>[])
            .map(raw => this.parseRow(raw));

          resolve({
            rows,
            validCount: rows.filter(r => r.transaction !== null).length,
            errorCount: rows.filter(r => r.transaction === null).length,
          });
        },
        error: (error: Error) => reject(error),
      });
    });
  }

  private parseRow(raw: Record<string, string>): ParsedRow {
    const errors: string[] = [];

    const description = raw['Descricao']?.trim();
    if (!description) {
      errors.push('Descrição vazia');
    }

    const date = this.parseDate(raw['Data']);
    if (!date) {
      errors.push(`Data inválida: "${raw['Data']}"`);
    }

    const amount = this.parseAmount(raw['Valor']);
    if (amount === null) {
      errors.push(`Valor inválido: "${raw['Valor']}"`);
    }

    if (errors.length > 0 || !date || amount === null) {
      return { raw, transaction: null, errors };
    }

    return {
      raw,
      errors: [],
      transaction: {
        description,
        amount,
        date,
        type: amount < 0 ? 'expense' : 'income',
        categoryId: 'other',
      },
    };
  }

  private parseDate(value: string): Date | null {
    if (!value) return null;

    const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;

    const [, day, month, year] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return isNaN(date.getTime()) ? null : date;
  }

  private parseAmount(value: string): number | null {
    if (!value) return null;

    const normalized = value.trim().replace(/\./g, '').replace(',', '.');
    const amount = parseFloat(normalized);

    return isNaN(amount) ? null : amount;
  }
}