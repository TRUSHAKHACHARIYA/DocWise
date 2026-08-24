import { DocumentParser, ParseContext, ParsedDocument } from './parser.types';

const CSV_EXTENSION = /\.(csv|tsv)$/i;

/**
 * CSV/TSV parser: converts tabular data into readable text rows.
 * The first row is treated as a header and repeated per record so that
 * individual chunks retain column context.
 */
export class CsvParser implements DocumentParser {
  readonly name = 'csv';

  supports(mimeType: string, fileName?: string): boolean {
    if (mimeType === 'text/csv' || mimeType === 'application/csv') {
      return true;
    }
    if (mimeType === 'text/tab-separated-values') {
      return true;
    }
    return Boolean(fileName && CSV_EXTENSION.test(fileName));
  }

  async parse({ buffer, fileName, mimeType }: ParseContext): Promise<ParsedDocument> {
    const raw = buffer.toString('utf-8');
    const isTsv = mimeType === 'text/tab-separated-values' || fileName?.toLowerCase().endsWith('.tsv');
    const delimiter = this.detectDelimiter(raw, isTsv ? '\t' : ',');

    const records = this.parseCsv(raw, delimiter);
    if (records.length === 0) {
      return { text: '', fileName, mimeType };
    }

    const header = records[0].map(cell => cell.trim());
    const lines: string[] = [header.join(' | ')];

    for (let i = 1; i < records.length; i++) {
      const row = records[i];
      if (row.every(cell => cell.trim().length === 0)) {
        continue;
      }

      const parts = row
        .map((cell, col) => (cell.trim() ? `${header[col] ?? `col${col + 1}`}: ${cell.trim()}` : ''))
        .filter(Boolean);

      lines.push(parts.join('; '));
    }

    return {
      text: lines.join('\n'),
      fileName,
      mimeType: isTsv ? 'text/tab-separated-values' : 'text/csv',
    };
  }

  private detectDelimiter(text: string, fallback: string): string {
    const sample = text.split('\n').slice(0, 5).join('\n');
    const commas = (sample.match(/,/g) ?? []).length;
    const tabs = (sample.match(/\t/g) ?? []).length;
    const semicolons = (sample.match(/;/g) ?? []).length;

    if (fallback === '\t' && tabs >= Math.max(commas, semicolons)) {
      return '\t';
    }
    if (semicolons > commas && semicolons > tabs) {
      return ';';
    }
    if (tabs > commas) {
      return '\t';
    }
    return ',';
  }

  /**
   * RFC 4180-style CSV parsing with quote handling.
   */
  private parseCsv(text: string, delimiter: string): string[][] {
    const records: string[][] = [];
    let field = '';
    let record: string[] = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (inQuotes) {
        if (char === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += char;
        }
        continue;
      }

      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        record.push(field);
        field = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && text[i + 1] === '\n') {
          i++;
        }
        record.push(field);
        records.push(record);
        field = '';
        record = [];
      } else {
        field += char;
      }
    }

    if (field.length > 0 || record.length > 0) {
      record.push(field);
      records.push(record);
    }

    return records.filter(r => r.some(cell => cell.trim().length > 0));
  }
}
