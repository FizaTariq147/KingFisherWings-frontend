import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import type {
  CustomerEnquiryRow,
  CustomerSailingRow,
  CustomerShipmentRow,
  CustomerTrackingRow,
} from '../types/customerService.types';

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function toCsv(headers: string[], rows: string[][]): string {
  return [headers.map(escapeCsv).join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\n');
}

export function downloadCsvFile(filename: string, headers: string[], rows: string[][]): void {
  const blob = new Blob([toCsv(headers, rows)], { type: 'text/csv;charset=utf-8;' });
  triggerBlobDownload(blob, filename);
}

export function exportShipmentsCsv(rows: CustomerShipmentRow[] | CustomerTrackingRow[], filename: string): void {
  downloadCsvFile(
    filename,
    ['Shipment No.', 'Client', 'Origin', 'Destination', 'Branch', 'Status', 'ETD', 'Sales Person'],
    rows.map((row) => [
      row.shipmentNo,
      row.client,
      row.origin,
      row.destination,
      row.branch,
      row.status,
      row.etd,
      row.salesPerson,
    ]),
  );
}

export function exportEnquiriesCsv(rows: CustomerEnquiryRow[], filename: string): void {
  downloadCsvFile(
    filename,
    ['Enquiry No.', 'Client', 'Origin', 'Destination', 'Service', 'Status', 'Sales Person', 'Created'],
    rows.map((row) => [
      row.enquiryNo,
      row.client,
      row.origin,
      row.destination,
      row.serviceType,
      row.status,
      row.salesPerson,
      row.createdAt,
    ]),
  );
}

export function exportSailingScheduleCsv(rows: CustomerSailingRow[], filename: string): void {
  downloadCsvFile(
    filename,
    ['Carrier', 'Vessel', 'Sailing No.', 'POL', 'POD', 'ETD', 'ETA', 'Jobs'],
    rows.map((row) => [
      row.carrier,
      row.vessel,
      row.sailingNo,
      row.pol,
      row.pod,
      row.etd,
      row.eta,
      String(row.jobCount),
    ]),
  );
}

export function exportGroupedCountCsv(
  groups: Array<[string, number]>,
  filename: string,
  labelColumn: string,
): void {
  downloadCsvFile(filename, [labelColumn, 'Count'], groups.map(([label, count]) => [label, String(count)]));
}
