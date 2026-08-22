import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { ChevronDown, Search, Maximize2, RotateCcw } from 'lucide-react';
import { FilterField, SelectInput, TextInput, DateInput } from '../../components/widgets/FilterField';
import { useCustomerCostingShipments, useCustomerJobCosting } from '@/features/customers/hooks/useCustomerService';
import { useCustomerFilterSelectOptions } from '@/features/customers/hooks/useCustomerServiceFilterOptions';
import type { CustomerShipmentFilters } from '@/features/customers/types/customerService.types';
import { defaultCustomerShipmentFilters } from '@/features/customers/utils/customerServiceDefaults';
import { getErrorMessage } from '@/features/management/utils/getErrorMessage';
import {
  DATE_RANGE_PRESETS,
  resolveDateRangePreset,
  type DateRangePreset,
} from '@/features/management/utils/managementFilters';
import { JOB_STATUSES } from '@/features/jobs/constants/job.constants';
import { CUSTOMER_SERVICE_PATHS, customerJobDetailPath } from '@/features/customers/utils/customerServicePaths';
import { exportShipmentsCsv } from '@/features/customers/utils/exportCustomerReport';
import { toggleTableFullscreen } from '@/features/customers/utils/tableFullscreen';

const columns = ['Origin', 'Client', 'Destination', 'Shipment No.', 'Shipment Date', 'Branch', 'Shipment Status'];

export default function CostingSearchPage() {
  const navigate = useNavigate();
  const tableRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [branch, setBranch] = useState('All');
  const [client, setClient] = useState('All');
  const [salesPerson, setSalesPerson] = useState('All');
  const [department, setDepartment] = useState('All');
  const [origin, setOrigin] = useState('All');
  const [destination, setDestination] = useState('All');
  const [shipmentNo, setShipmentNo] = useState('');
  const [shipper, setShipper] = useState('-Select-');
  const [consignee, setConsignee] = useState('-Select-');
  const [createdUser, setCreatedUser] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState(true);
  const [activeFilters, setActiveFilters] = useState<CustomerShipmentFilters>(() =>
    defaultCustomerShipmentFilters(),
  );
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const applyPreset = (preset: DateRangePreset) => {
    setDatePreset(preset);
    if (preset === 'custom') return;
    const range = resolveDateRangePreset(preset);
    if (range) {
      setFromDate(range.from_date);
      setToDate(range.to_date);
    }
  };

  useEffect(() => {
    applyPreset('this_month');
  }, []);

  const query = useCustomerCostingShipments(activeFilters, submitted);
  const costingQuery = useCustomerJobCosting(selectedJobId, Boolean(selectedJobId));
  const filters = useCustomerFilterSelectOptions();

  const filteredRows = useMemo(() => {
    let rows = query.data ?? [];
    if (submitted && search.trim()) {
      const term = search.trim().toLowerCase();
      rows = rows.filter((row) =>
        [row.shipmentNo, row.client, row.origin, row.destination, row.status]
          .join(' ')
          .toLowerCase()
          .includes(term),
      );
    }
    return rows;
  }, [query.data, search, submitted]);

  const handleSubmit = () => {
    if (!fromDate && !toDate && datePreset !== 'custom') applyPreset(datePreset);
    setActiveFilters({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      branch_id: branch,
      client,
      salesperson_id: salesPerson,
      department: department !== 'All' ? department : undefined,
      origin,
      destination,
      shipment_no: shipmentNo || undefined,
      shipper_id: shipper !== '-Select-' ? shipper : undefined,
      consignee_id: consignee !== '-Select-' ? consignee : undefined,
      created_user: createdUser !== 'All' ? createdUser : undefined,
      status,
      limit: 100,
    });
    setSubmitted(true);
    setSelectedJobId(null);
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/customers" label="Back to Customers" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50"
            >
              <ChevronDown size={14} className={`transition-transform ${collapsed ? '-rotate-90' : ''}`} />
            </button>
            <h2 className="text-[17px] font-medium text-gray-800">Shipment Costing Search</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate(CUSTOMER_SERVICE_PATHS.createJob)}
            className="bg-[#FF751F] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
          >
            Create Shipment
          </button>
        </div>

        {!collapsed && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
            <FilterField label="Date Range">
              <div className="flex gap-2">
                <div className="w-24 shrink-0">
                  <SelectInput options={['Shipmer', 'Booking', 'ETD']} value="Shipmer" onChange={() => undefined} />
                </div>
                <div className="flex-1 relative">
                  <select
                    value={datePreset}
                    onChange={(e) => applyPreset(e.target.value as DateRangePreset)}
                    className="w-full appearance-none border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F] bg-white"
                  >
                    {DATE_RANGE_PRESETS.map((preset) => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </FilterField>

            <FilterField label="From Date">
              <DateInput value={fromDate} onChange={(e) => { setFromDate(e.target.value); setDatePreset('custom'); }} />
            </FilterField>

            <FilterField label="To Date">
              <DateInput value={toDate} onChange={(e) => { setToDate(e.target.value); setDatePreset('custom'); }} />
            </FilterField>

            <FilterField label="Created Branch">
              <SelectInput options={filters.branches} value={branch} onChange={(e) => setBranch(e.target.value)} />
            </FilterField>

            <FilterField label="Client">
              <SelectInput options={filters.clients} value={client} onChange={(e) => setClient(e.target.value)} />
            </FilterField>

            <FilterField label="Sales Person">
              <SelectInput options={filters.salesPersons} value={salesPerson} onChange={(e) => setSalesPerson(e.target.value)} />
            </FilterField>

            <FilterField label="Department">
              <SelectInput options={filters.departments} value={department} onChange={(e) => setDepartment(e.target.value)} />
            </FilterField>

            <FilterField label="Origin">
              <SelectInput options={filters.ports} value={origin} onChange={(e) => setOrigin(e.target.value)} />
            </FilterField>

            <FilterField label="Destination">
              <SelectInput options={filters.ports} value={destination} onChange={(e) => setDestination(e.target.value)} />
            </FilterField>

            <FilterField label="Shipment No.">
              <TextInput value={shipmentNo} onChange={(e) => setShipmentNo(e.target.value)} />
            </FilterField>

            <FilterField label="Shipper">
              <SelectInput options={filters.shippers} value={shipper} onChange={(e) => setShipper(e.target.value)} />
            </FilterField>

            <FilterField label="Consignee">
              <SelectInput options={filters.consignees} value={consignee} onChange={(e) => setConsignee(e.target.value)} />
            </FilterField>

            <FilterField label="Created User">
              <SelectInput options={filters.salesPersons} value={createdUser} onChange={(e) => setCreatedUser(e.target.value)} />
            </FilterField>

            <FilterField label="Status">
              <SelectInput options={['All', ...JOB_STATUSES]} value={status} onChange={(e) => setStatus(e.target.value)} />
            </FilterField>

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <FilterField label="Type">
                  <SelectInput options={['All']} value="All" onChange={() => undefined} />
                </FilterField>
              </div>
              <button type="button" onClick={handleSubmit} className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity mb-0.5">
                <span className="text-[#FF751F]">➜</span>
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[15px] font-medium text-gray-800">Shipment List</h2>
          <button
            type="button"
            onClick={() => void toggleTableFullscreen(tableRef)}
            className="text-gray-400 hover:text-gray-600"
            title="Fullscreen table"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-200 bg-[#F5F7FA]">
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
              <Search size={13} />
              <ChevronDown size={12} />
            </button>
            <input
              type="text"
              placeholder="Search: Full Text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            />
            <button type="button" onClick={handleSubmit} className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors">
              Go
            </button>
            <button
              type="button"
              onClick={() => exportShipmentsCsv(filteredRows, 'costing-shipments.csv')}
              disabled={!filteredRows.length}
              className="ml-1 bg-gray-100 border border-gray-300 hover:bg-gray-200 disabled:opacity-50 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors"
            >
              Primary Report
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedJobId) {
                  const row = filteredRows.find((item) => item.id === selectedJobId);
                  if (row) navigate(customerJobDetailPath(row));
                }
              }}
              disabled={!selectedJobId}
              className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              View Job
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setSelectedJobId(null);
              setSearch('');
            }}
            className="flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 bg-white hover:bg-gray-50"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>

        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                {columns.map((col) => (
                  <th key={col} className="text-left font-medium text-gray-700 px-5 py-2.5 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-14 text-center text-sm text-gray-400">
                    Loading shipments…
                  </td>
                </tr>
              ) : query.isError ? (
                <tr>
                  <td colSpan={columns.length} className="py-14 text-center text-sm text-red-600">
                    {getErrorMessage(query.error, 'Could not load shipments.')}
                  </td>
                </tr>
              ) : !submitted || filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-14">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-gray-300" />
                      <span className="text-sm text-gray-500">No data found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedJobId(row.id)}
                    onDoubleClick={() => navigate(customerJobDetailPath(row))}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedJobId === row.id ? 'bg-orange-50' : ''}`}
                  >
                    <td className="px-5 py-2.5 text-gray-700">{row.origin}</td>
                    <td className="px-5 py-2.5 text-gray-700">{row.client}</td>
                    <td className="px-5 py-2.5 text-gray-700">{row.destination}</td>
                    <td className="px-5 py-2.5 text-blue-600">{row.shipmentNo}</td>
                    <td className="px-5 py-2.5 text-gray-700">{row.shipmentDate}</td>
                    <td className="px-5 py-2.5 text-gray-700">{row.branch}</td>
                    <td className="px-5 py-2.5 text-gray-700">{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-md">
        <div className="px-5 py-3 border-b border-gray-200">
          <h2 className="text-[15px] font-medium text-gray-800">Costing</h2>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-gray-500">
            Selected Shipment No. :{' '}
            <span className="text-gray-700">{costingQuery.data?.shipmentNo || (selectedJobId ? 'Loading…' : '')}</span>
            {selectedJobId && (
              <button
                type="button"
                onClick={() => {
                  const row = filteredRows.find((item) => item.id === selectedJobId);
                  if (row) navigate(customerJobDetailPath(row));
                }}
                className="ml-3 text-blue-600 hover:underline text-sm"
              >
                View job
              </button>
            )}
          </p>
          <p className="text-sm font-semibold text-gray-800 text-center py-2">
            Sale - (Qty x Amount Per Unit x Ex.Rate) | Cost - (Qty x Amount Per Unit x Ex.Rate)
          </p>
          {costingQuery.isLoading && selectedJobId && (
            <p className="text-sm text-gray-400 text-center">Loading costing…</p>
          )}
          {costingQuery.isError && (
            <p className="text-sm text-red-600 text-center">{getErrorMessage(costingQuery.error)}</p>
          )}
          {costingQuery.data && (
            <>
              <div className="flex justify-center gap-6 text-sm text-gray-700">
                <span>Revenue: {costingQuery.data.revenue.toFixed(2)} {costingQuery.data.currency}</span>
                <span>Cost: {costingQuery.data.cost.toFixed(2)} {costingQuery.data.currency}</span>
                <span>GP: {costingQuery.data.grossProfit.toFixed(2)} {costingQuery.data.currency}</span>
              </div>
              {(costingQuery.data.saleLines.length > 0 || costingQuery.data.costLines.length > 0) && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm mt-2">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-3 py-2 text-left">Type</th>
                        <th className="px-3 py-2 text-left">Description</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                        <th className="px-3 py-2 text-right">Ex.Rate</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...costingQuery.data.saleLines, ...costingQuery.data.costLines].map((line) => (
                        <tr key={line.id} className="border-b border-gray-100">
                          <td className="px-3 py-2">{line.isCost ? 'Cost' : 'Sale'}</td>
                          <td className="px-3 py-2">{line.description}</td>
                          <td className="px-3 py-2 text-right">{line.quantity}</td>
                          <td className="px-3 py-2 text-right">{line.unitPrice.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">{line.exchangeRate.toFixed(4)}</td>
                          <td className="px-3 py-2 text-right">{line.lineTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
