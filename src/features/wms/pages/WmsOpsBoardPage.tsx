import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { isUuid } from '@/lib/isUuid';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import { statusBadgeClass } from '../components/WmsDocumentDetail';
import {
  useWmsItemOptions,
  useWmsJobOptions,
  useWmsPartyOptions,
  useWmsWarehouseOptions,
} from '../components/WmsFormHelpers';
import { WmsPageHeader } from '../components/WmsPageHeader';
import { useWmsOpsBoard } from '../hooks/useWms';
import type { WmsOpsBoardRow } from '../types/wms.types';
import { getErrorMessage } from '../utils/getErrorMessage';

function buildLabelMap(options: Array<{ value: string; label: string }>): Map<string, string> {
  const map = new Map<string, string>();
  for (const opt of options) {
    if (opt.value) map.set(opt.value, opt.label);
  }
  return map;
}

function resolveLabel(
  id: string | undefined,
  explicitName: string | undefined,
  map: Map<string, string>,
): string {
  if (explicitName?.trim()) return explicitName.trim();
  if (id && map.has(id)) return map.get(id)!;
  if (id && !isUuid(id)) return id;
  return '—';
}

function rowTitle(row: WmsOpsBoardRow, itemMap: Map<string, string>): string {
  if (row.document_number?.trim()) return row.document_number.trim();
  if (row.label?.trim() && !isUuid(row.label)) return row.label.trim();
  const itemLabel =
    [row.item_code, row.item_name].filter(Boolean).join(' — ') ||
    (row.item_id ? itemMap.get(row.item_id) : undefined);
  if (itemLabel) return itemLabel;
  return row.id && !isUuid(row.id) ? row.id : row.id ? `Lot ${row.id.slice(0, 8)}` : '—';
}

function OpsBoardTable({
  rows,
  linkPrefix,
  empty,
  partyMap,
  jobMap,
  warehouseMap,
  itemMap,
  showItem,
}: {
  rows: WmsOpsBoardRow[];
  linkPrefix?: string;
  empty: string;
  partyMap: Map<string, string>;
  jobMap: Map<string, string>;
  warehouseMap: Map<string, string>;
  itemMap: Map<string, string>;
  showItem?: boolean;
}) {
  if (!rows.length) {
    return <p className="px-4 pb-4 text-sm text-[var(--color-neutral-400)]">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-neutral-100)] text-xs uppercase tracking-wide text-[var(--color-neutral-500)]">
            <th className="px-4 py-2 font-medium">{showItem ? 'Lot / item' : 'Document'}</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Party</th>
            <th className="px-4 py-2 font-medium">Job</th>
            <th className="px-4 py-2 font-medium">Warehouse</th>
            <th className="px-4 py-2 font-medium">Customer send</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const title = rowTitle(row, itemMap);
            const statusOrLabel = row.status || row.label || '—';
            const partyLabel = resolveLabel(row.party_id, row.party_name, partyMap);
            const jobLabel = resolveLabel(row.job_id, row.job_number, jobMap);
            const warehouseLabel = resolveLabel(row.warehouse_id, row.warehouse_name, warehouseMap);
            const href = linkPrefix && row.id ? `${linkPrefix}/${row.id}` : undefined;
            return (
              <tr
                key={row.id || `${title}-${index}`}
                className="border-b border-[var(--color-neutral-50)] last:border-0"
              >
                <td className="px-4 py-2 font-medium text-[var(--color-neutral-800)]">
                  {href ? (
                    <Link className="underline-offset-2 hover:underline" to={href}>
                      {title}
                    </Link>
                  ) : (
                    title
                  )}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(statusOrLabel)}`}
                  >
                    {statusOrLabel}
                  </span>
                </td>
                <td className="px-4 py-2 text-[var(--color-neutral-700)]">{partyLabel}</td>
                <td className="px-4 py-2 text-[var(--color-neutral-700)]">{jobLabel}</td>
                <td className="px-4 py-2 text-[var(--color-neutral-700)]">{warehouseLabel}</td>
                <td className="px-4 py-2 text-[var(--color-neutral-600)]">
                  {row.customer_send_status || '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function WmsOpsBoardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useWmsOpsBoard();
  const { options: partyOptions } = useWmsPartyOptions();
  const { options: jobOptions } = useWmsJobOptions();
  const { options: warehouseOptions } = useWmsWarehouseOptions();
  const { options: itemOptions } = useWmsItemOptions();

  const partyMap = useMemo(() => buildLabelMap(partyOptions), [partyOptions]);
  const jobMap = useMemo(() => buildLabelMap(jobOptions), [jobOptions]);
  const warehouseMap = useMemo(() => buildLabelMap(warehouseOptions), [warehouseOptions]);
  const itemMap = useMemo(() => buildLabelMap(itemOptions), [itemOptions]);

  const tableProps = {
    partyMap,
    jobMap,
    warehouseMap,
    itemMap,
  };

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={WMS_ROUTE_PREFIX}
        backLabel="Warehouse"
        title="WMS ops board"
        description="Inbound ASN yard, outbound GDO/DISPATCHED, lot OVERDUE / OVER_BILL, customer send flags."
        actions={
          <Button type="button" variant="secondary" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading ops board…</p>
      ) : isError ? (
        <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="overflow-hidden p-0">
            <CardHeader className="px-4 pt-4">
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Inbound ASNs
              </CardTitle>
            </CardHeader>
            <OpsBoardTable
              {...tableProps}
              rows={data?.inbound_asns ?? []}
              linkPrefix={`${WMS_ROUTE_PREFIX}/asns`}
              empty="No inbound ASNs on the board."
            />
          </Card>

          <Card className="overflow-hidden p-0">
            <CardHeader className="px-4 pt-4">
              <CardTitle>Outbound GDOs</CardTitle>
            </CardHeader>
            <OpsBoardTable
              {...tableProps}
              rows={data?.outbound_gdos ?? []}
              linkPrefix={`${WMS_ROUTE_PREFIX}/gdos`}
              empty="No outbound GDOs on the board."
            />
          </Card>

          <Card className="overflow-hidden p-0">
            <CardHeader className="px-4 pt-4">
              <CardTitle>OVERDUE lots</CardTitle>
            </CardHeader>
            <OpsBoardTable
              {...tableProps}
              rows={data?.overdue_lots ?? []}
              showItem
              empty="No OVERDUE lots."
            />
          </Card>

          <Card className="overflow-hidden p-0">
            <CardHeader className="px-4 pt-4">
              <CardTitle>OVER_BILL lots</CardTitle>
            </CardHeader>
            <OpsBoardTable
              {...tableProps}
              rows={data?.over_bill_lots ?? []}
              showItem
              empty="No OVER_BILL lots."
            />
          </Card>
        </div>
      )}
    </div>
  );
}
