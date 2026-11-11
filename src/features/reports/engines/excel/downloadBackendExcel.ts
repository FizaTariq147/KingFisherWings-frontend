/**
 * Ops lists prefer XLSX — FE does not implement a spreadsheet writer.
 * Downloads come from POST /reports/generate → job download (backend ExcelJS).
 */
export const EXCEL_EXPORT_STRATEGY = {
  clientWriter: false,
  backendPack: 'ops.list_generic',
  preferredFormats: ['XLSX', 'PDF', 'CSV'] as const,
  note: 'ReportGeneratePanel defaults ops_list to XLSX and uses report catalog generate/download',
} as const;
