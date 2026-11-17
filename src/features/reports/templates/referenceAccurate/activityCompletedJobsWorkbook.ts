import { getMyReportColumns } from '../official/officialWorkbook';

/** Activity completed jobs list. Reference: activity-completed-jobs-list-report-format.xlsx. */
export const ACTIVITY_COMPLETED_JOBS_CODE = 'ACTIVITY_COMPLETED_JOBS_LIST_REPORT_FORMAT';
export const ACTIVITY_COMPLETED_JOBS_FILE = 'activity-completed-jobs-list-report-format.xlsx';

/** Header row and column order taken from the reference shared strings and sheet. */
export const ACTIVITY_COMPLETED_JOBS_HEADERS = [
  'Job No.',
  'Department',
  'POR',
  'POD',
  'No Of Pcs',
  'G.Weight',
  'Volume',
] as const;

export type ActivityCompletedJobRow = {
  jobNumber?: string | null;
  department?: string | null;
  por?: string | null;
  pod?: string | null;
  pieces?: string | number | null;
  grossWeight?: string | number | null;
  volume?: string | number | null;
};

function cell(value: string | number | null | undefined): string {
  if (value == null) return '';
  return String(value).trim();
}

export function activityCompletedJobsRow(row: ActivityCompletedJobRow): string[] {
  return [
    cell(row.jobNumber),
    cell(row.department),
    cell(row.por),
    cell(row.pod),
    cell(row.pieces),
    cell(row.grossWeight),
    cell(row.volume),
  ];
}

export function generateActivityCompletedJobsWorkbook(rows: ActivityCompletedJobRow[]): {
  bytes: Uint8Array;
  fileName: string;
} {
  const spec = getMyReportColumns(ACTIVITY_COMPLETED_JOBS_CODE);
  if (!spec) throw new Error(`Missing column spec for ${ACTIVITY_COMPLETED_JOBS_CODE}`);
  if (spec.headers.join('|') !== ACTIVITY_COMPLETED_JOBS_HEADERS.join('|')) {
    throw new Error(`${ACTIVITY_COMPLETED_JOBS_CODE} headers no longer match the reference workbook`);
  }
  if (spec.referenceFile !== ACTIVITY_COMPLETED_JOBS_FILE) {
    throw new Error(`${ACTIVITY_COMPLETED_JOBS_CODE} reference file changed`);
  }
  const dataRows = rows.map(activityCompletedJobsRow);
  const lastRow = Math.max(1, dataRows.length + 1);
  const sheetName = spec.sheetName.slice(0, 31);
  const bytes = buildActivityWorkbook(sheetName, [...ACTIVITY_COMPLETED_JOBS_HEADERS], dataRows, lastRow);
  return { bytes, fileName: `${ACTIVITY_COMPLETED_JOBS_CODE}.xlsx` };
}

function xml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function columnName(index: number): string {
  let n = index + 1;
  let name = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

function crc32(buf: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = (c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1);
  }
  return ~c >>> 0;
}

function storeZip(files: Array<{ name: string; data: Uint8Array }>): Uint8Array {
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const encoder = new TextEncoder();
  for (const file of files) {
    const name = encoder.encode(file.name);
    const local = new Uint8Array(30 + name.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(8, 0, true);
    view.setUint32(14, crc32(file.data), true);
    view.setUint32(18, file.data.length, true);
    view.setUint32(22, file.data.length, true);
    view.setUint16(26, name.length, true);
    local.set(name, 30);
    parts.push(local, file.data);
    const centralHeader = new Uint8Array(46 + name.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint32(16, crc32(file.data), true);
    centralView.setUint32(20, file.data.length, true);
    centralView.setUint32(24, file.data.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(name, 46);
    central.push(centralHeader);
    offset += local.length + file.data.length;
  }
  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  const chunks = [...parts, ...central, end];
  const total = chunks.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let cursor = 0;
  for (const chunk of chunks) {
    out.set(chunk, cursor);
    cursor += chunk.length;
  }
  return out;
}

function cellXml(value: string, ref: string, columnIndex: number, header: boolean): string {
  if (header) {
    return `<c r="${ref}" s="1" t="inlineStr"><is><t>${xml(value)}</t></is></c>`;
  }
  const numeric = columnIndex >= 4 && value !== '' && Number.isFinite(Number(value));
  if (numeric) {
    const style = columnIndex === 4 ? '3' : '2';
    return `<c r="${ref}" s="${style}"><v>${Number(value)}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr"><is><t>${xml(value)}</t></is></c>`;
}

function buildActivityWorkbook(
  sheetName: string,
  headers: string[],
  rows: string[][],
  lastRow: number,
): Uint8Array {
  const widths = [18, 24, 12, 12, 12, 14, 12];
  const cols = widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join('');
  const allRows = [headers, ...rows];
  const sheetRows = allRows
    .map((row, rowIndex) => {
      const cells = headers.map((_, columnIndex) =>
        cellXml(row[columnIndex] || '', `${columnName(columnIndex)}${rowIndex + 1}`, columnIndex, rowIndex === 0),
      );
      return `<row r="${rowIndex + 1}">${cells.join('')}</row>`;
    })
    .join('');
  const quoted = `'${sheetName.replace(/'/g, "''")}'`;
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${cols}</cols>
<sheetData>${sheetRows}</sheetData>
<autoFilter ref="A1:G${lastRow}"/>
<printOptions horizontalCentered="0"/>
<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>
<pageSetup orientation="landscape" paperSize="9" fitToWidth="1" fitToHeight="0" pageOrder="downThenOver"/>
</worksheet>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2"><numFmt numFmtId="164" formatCode="0.00"/><numFmt numFmtId="165" formatCode="0"/></numFmts>
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD9E2F3"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="4">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
</cellXfs>
</styleSheet>`;
  const encoder = new TextEncoder();
  return storeZip([
    {
      name: '[Content_Types].xml',
      data: encoder.encode(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
      ),
    },
    {
      name: '_rels/.rels',
      data: encoder.encode(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      ),
    },
    {
      name: 'xl/workbook.xml',
      data: encoder.encode(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xml(sheetName)}" sheetId="1" r:id="rId1"/></sheets><definedNames><definedName name="_xlnm.Print_Titles" localSheetId="0">${quoted}!$1:$1</definedName><definedName name="_xlnm.Print_Area" localSheetId="0">${quoted}!$A$1:$G$${lastRow}</definedName></definedNames></workbook>`,
      ),
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: encoder.encode(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      ),
    },
    { name: 'xl/styles.xml', data: encoder.encode(styles) },
    { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(sheetXml) },
  ]);
}
