import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import type { CustomerShipmentRow } from '../types/customerService.types';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildAgentEdiXml(shipments: CustomerShipmentRow[]): string {
  const body = shipments
    .map(
      (row) => `  <Shipment>
    <JobId>${escapeXml(row.id)}</JobId>
    <ShipmentNo>${escapeXml(row.shipmentNo)}</ShipmentNo>
    <Client>${escapeXml(row.client)}</Client>
    <Origin>${escapeXml(row.origin)}</Origin>
    <Destination>${escapeXml(row.destination)}</Destination>
    <HBL>${escapeXml(row.hbl)}</HBL>
    <MBL>${escapeXml(row.mbl)}</MBL>
    <Status>${escapeXml(row.status)}</Status>
    <ETD>${escapeXml(row.etd)}</ETD>
    <ETA>${escapeXml(row.eta)}</ETA>
  </Shipment>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<AgentEDI generatedAt="${new Date().toISOString()}">\n${body}\n</AgentEDI>`;
}

export function downloadAgentEdiXml(shipments: CustomerShipmentRow[], filename = 'agent-edi.xml'): void {
  if (!shipments.length) return;
  const blob = new Blob([buildAgentEdiXml(shipments)], { type: 'application/xml;charset=utf-8' });
  triggerBlobDownload(blob, filename);
}
