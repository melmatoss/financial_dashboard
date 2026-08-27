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
        delimiter: '', // '' = PapaParse detecta automaticamente ; , ou tab
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

  private findColumn(raw: Record<string, string>, candidates: string[]): string | undefined {
    const keys = Object.keys(raw);
    for (const candidate of candidates) {
      const normalized = this.normalizeKey(candidate);
      const found = keys.find(k => this.normalizeKey(k) === normalized);
      if (found) return raw[found];
    }
    return undefined;
  }

  private normalizeKey(key: string): string {
    return key
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
      .trim()
      .toLowerCase();
  }

  private parseRow(raw: Record<string, string>): ParsedRow {
    const errors: string[] = [];

    const description = this.findColumn(raw, ['Descricao', 'Descrição', 'Historico', 'Histórico'])?.trim();
    if (!description) {
      errors.push('Descrição vazia');
    }

    const dateRaw = this.findColumn(raw, ['Data']);
    const date = this.parseDate(dateRaw);
    if (!date) {
      errors.push(`Data inválida: "${dateRaw}"`);
    }

    const amountRaw = this.findColumn(raw, ['Valor']);
    const amount = this.parseAmount(amountRaw);
    if (amount === null) {
      errors.push(`Valor inválido: "${amountRaw}"`);
    }

    if (errors.length > 0 || !date || amount === null || !description) {
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

  private parseDate(value: string | undefined): Date | null {
    if (!value) return null;

    const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;

    const [, day, month, year] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return isNaN(date.getTime()) ? null : date;
  }

  private parseAmount(value: string | undefined): number | null {
    if (!value) return null;

    const trimmed = value.trim();
    const hasComma = trimmed.includes(',');
    const hasDot = trimmed.includes('.');

    let normalized: string;

    if (hasComma && hasDot) {
      const lastComma = trimmed.lastIndexOf(',');
      const lastDot = trimmed.lastIndexOf('.');
      normalized = lastComma > lastDot
        ? trimmed.replace(/\./g, '').replace(',', '.')  // 1.234,56 (BR)
        : trimmed.replace(/,/g, '');                     // 1,234.56 (internacional)
    } else if (hasComma) {
      normalized = trimmed.replace(',', '.');             // 350,50
    } else {
      normalized = trimmed;                                // 287.00
    }

    const amount = parseFloat(normalized);
    return isNaN(amount) ? null : amount;
  }
}