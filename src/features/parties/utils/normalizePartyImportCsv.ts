/**
 * Lightweight RFC4180-ish CSV helpers for party import/export.
 * Backend csv-parse rejects rows whose column count differs from the header
 * (common when address/name fields contain unescaped commas).
 */

function parseCsvRows(text: string): string[][] {
  const input = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]!;
    const next = input[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      row.push(field);
      field = '';
      continue;
    }
    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }
    if (ch === '\r') {
      continue;
    }
    field += ch;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop trailing fully-empty rows from final newline.
  while (rows.length > 0) {
    const last = rows[rows.length - 1]!;
    if (last.length === 1 && last[0] === '') rows.pop();
    else break;
  }

  return rows;
}

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function serializeCsvRows(rows: string[][]): string {
  return rows.map((cols) => cols.map(escapeCsvField).join(',')).join('\r\n') + '\r\n';
}

/**
 * Force every data row to match the header column count:
 * - extra cells are merged into the last column (keeps address text)
 * - missing cells are padded with empty strings
 * Fields are re-quoted so commas/newlines survive a second import.
 */
export function normalizePartyImportCsv(text: string): string {
  const rows = parseCsvRows(text);
  if (rows.length === 0) {
    throw new Error('CSV file is empty.');
  }

  const header = rows[0]!.map((h) => h.trim());
  const expected = header.length;
  if (expected < 1) {
    throw new Error('CSV header row is missing columns.');
  }

  const normalized: string[][] = [header];

  for (let r = 1; r < rows.length; r += 1) {
    const cells = rows[r]!.map((c) => c.trim());
    // Skip blank lines
    if (cells.every((c) => c === '')) continue;

    if (cells.length === expected) {
      normalized.push(cells);
      continue;
    }

    if (cells.length > expected) {
      const head = cells.slice(0, expected - 1);
      const tail = cells.slice(expected - 1).join(', ');
      normalized.push([...head, tail]);
      continue;
    }

    while (cells.length < expected) cells.push('');
    normalized.push(cells);
  }

  if (normalized.length < 2) {
    throw new Error('CSV has a header but no data rows.');
  }

  return serializeCsvRows(normalized);
}

/** Build a File ready for POST /parties/import. */
export async function preparePartyImportCsvFile(file: File): Promise<File> {
  const text = await file.text();
  const normalized = normalizePartyImportCsv(text);
  const name = file.name?.trim() || 'parties.csv';
  return new File([normalized], name.replace(/\.csv$/i, '') + '.csv', {
    type: 'text/csv',
    lastModified: Date.now(),
  });
}
