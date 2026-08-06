import { CsvParserService } from './csv-parser.service';

describe('CsvParserService', () => {
  let service: CsvParserService;

  beforeEach(() => {
    service = new CsvParserService();
  });

  function createCsvFile(content: string): File {
    return new File([content], 'extrato.csv', { type: 'text/csv' });
  }

  it('deve parsear uma linha válida corretamente', async () => {
    const csv = 'Data;Descricao;Valor\n01/08/2026;Salario;5000,00';
    const file = createCsvFile(csv);

    const result = await service.parseFile(file);

    expect(result.validCount).toBe(1);
    expect(result.errorCount).toBe(0);
    expect(result.rows[0].transaction).toEqual({
      description: 'Salario',
      amount: 5000,
      date: new Date(2026, 7, 1), // mês 7 = agosto (índice 0-based)
      type: 'income',
      categoryId: 'other',
    });
  });

  it('deve identificar despesa quando o valor é negativo', async () => {
    const csv = 'Data;Descricao;Valor\n02/08/2026;Aluguel;-1200,00';
    const file = createCsvFile(csv);

    const result = await service.parseFile(file);

    expect(result.rows[0].transaction?.type).toBe('expense');
    expect(result.rows[0].transaction?.amount).toBe(-1200);
  });

  it('deve converter valores com separador de milhar corretamente', async () => {
    const csv = 'Data;Descricao;Valor\n03/08/2026;Compra grande;1.234,56';
    const file = createCsvFile(csv);

    const result = await service.parseFile(file);

    expect(result.rows[0].transaction?.amount).toBe(1234.56);
  });

  it('deve marcar como erro quando a data está em formato inválido', async () => {
    const csv = 'Data;Descricao;Valor\n2026-08-01;Salario;5000,00';
    const file = createCsvFile(csv);

    const result = await service.parseFile(file);

    expect(result.validCount).toBe(0);
    expect(result.errorCount).toBe(1);
    expect(result.rows[0].errors).toContain('Data inválida: "2026-08-01"');
  });

  it('deve marcar como erro quando a descrição está vazia', async () => {
    const csv = 'Data;Descricao;Valor\n01/08/2026;;5000,00';
    const file = createCsvFile(csv);

    const result = await service.parseFile(file);

    expect(result.rows[0].errors).toContain('Descrição vazia');
  });

  it('deve ignorar linhas em branco no meio do arquivo', async () => {
    const csv = 'Data;Descricao;Valor\n01/08/2026;Salario;5000,00\n\n02/08/2026;Aluguel;-1200,00';
    const file = createCsvFile(csv);

    const result = await service.parseFile(file);

    expect(result.rows.length).toBe(2);
  });
});