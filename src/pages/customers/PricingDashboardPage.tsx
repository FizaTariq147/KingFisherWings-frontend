import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Search, ChevronDown } from 'lucide-react';
import { FilterField, SelectInput, TextInput, DateInput } from '../../components/widgets/FilterField';
import { useCustomerPricingDashboard } from '@/features/customers/hooks/useCustomerService';
import { useCustomerFilterSelectOptions } from '@/features/customers/hooks/useCustomerServiceFilterOptions';
import type { CustomerPricingFilters } from '@/features/customers/types/customerService.types';
import { defaultCustomerPricingFilters } from '@/features/customers/utils/customerServiceDefaults';
import { getErrorMessage } from '@/features/management/utils/getErrorMessage';
import {
  DATE_RANGE_PRESETS,
  resolveDateRangePreset,
  type DateRangePreset,
} from '@/features/management/utils/managementFilters';
import { ENQUIRY_STATUSES } from '@/features/crm/constants/crm.constants';
import { CUSTOMER_SERVICE_PATHS } from '@/features/customers/utils/customerServicePaths';
import { downloadCsvFile, exportEnquiriesCsv } from '@/features/customers/utils/exportCustomerReport';

const tabs = ['Open Enquiry Report', 'Quotation status-wise statistics'] as const;

export default function PricingDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [branch, setBranch] = useState('All');
  const [client, setClient] = useState('All');
  const [salesPerson, setSalesPerson] = useState('All');
  const [department, setDepartment] = useState('All');
  const [origin, setOrigin] = useState('All');
  const [destination, setDestination] = useState('All');
  const [enquiryNo, setEnquiryNo] = useState('');
  const [createdUser, setCreatedUser] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState(true);
  const [activeFilters, setActiveFilters] = useState<CustomerPricingFilters>(() =>
    defaultCustomerPricingFilters(),
  );

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

  const query = useCustomerPricingDashboard(activeFilters, submitted);
  const filters = useCustomerFilterSelectOptions();

  const openEnquiries = useMemo(() => {
    let rows = query.data?.openEnquiries ?? [];
    if (submitted && search.trim()) {
      const term = search.trim().toLowerCase();
      rows = rows.filter((row) =>
        [row.enquiryNo, row.client, row.serviceType, row.status].join(' ').toLowerCase().includes(term),
      );
    }
    return rows;
  }, [query.data?.openEnquiries, search, submitted]);

  const quotationStats = query.data?.quotationStats ?? [];

  const handleSubmit = () => {
    if (!fromDate && !toDate && datePreset !== 'custom') applyPreset(datePreset);
    setActiveFilters({
      tab: activeTab === tabs[0] ? 'open_enquiries' : 'quotation_stats',
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      branch_id: branch,
      client,
      salesperson_id: salesPerson,
      department: department !== 'All' ? department : undefined,
      origin: origin !== 'All' ? origin : undefined,
      destination: destination !== 'All' ? destination : undefined,
      enquiry_no: enquiryNo || undefined,
      created_user: createdUser !== 'All' ? createdUser : undefined,
      status,
      limit: 100,
    });
    setSubmitted(true);
  };

  return (
    <div className="space-y-3">
      <PageBackLink to="/customers" label="Back to Customers" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Pricing Dashboard</h2>
          <button
            type="button"
            onClick={() => navigate(CUSTOMER_SERVICE_PATHS.createEnquiry)}
            className="bg-[#FF751F] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
          >
            Create Enquiry
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <FilterField label="Date Range">
            <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700">
              <select
                value={datePreset}
                onChange={(e) => applyPreset(e.target.value as DateRangePreset)}
                className="w-full bg-transparent focus:outline-none"
              >
                {DATE_RANGE_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
          </FilterField>

          <FilterField label="From Date">
            <DateInput value={fromDate} onChange={(e) => { setFromDate(e.target.value); setDatePreset('custom'); }} />
          </FilterField>

          <FilterField label="To Date">
            <DateInput value={toDate} onChange={(e) => { setToDate(e.target.value); setDatePreset('custom'); }} />
          </FilterField>

          <FilterField label="Branch">
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

          <FilterField label="Enquiry No">
            <TextInput value={enquiryNo} onChange={(e) => setEnquiryNo(e.target.value)} />
          </FilterField>

          <FilterField label="Created User">
            <SelectInput options={filters.salesPersons} value={createdUser} onChange={(e) => setCreatedUser(e.target.value)} />
          </FilterField>

          <FilterField label="Enquiry Status">
            <SelectInput options={['All', ...ENQUIRY_STATUSES]} value={status} onChange={(e) => setStatus(e.target.value)} />
          </FilterField>
        </div>

        <div className="flex justify-end px-5 pb-4">
          <button type="button" onClick={handleSubmit} className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity">
            <span className="text-[#FF751F]">➜</span>
            Submit
          </button>
        </div>

        <div className="flex bg-[#0A2942]">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setActiveFilters((prev) => ({
                  ...prev,
                  tab: tab === tabs[0] ? 'open_enquiries' : 'quotation_stats',
                }));
                setSubmitted(true);
              }}
              className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab ? 'bg-[#0A2942] text-white' : 'text-white/70 hover:text-white bg-[#0A2942]/80'
              }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF751F]" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200 bg-[#F5F7FA]">
          <button type="button" className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
            <Search size={13} />
            <ChevronDown size={12} />
          </button>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
          />
          <button type="button" onClick={handleSubmit} className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors">
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeTab === tabs[0]) {
                exportEnquiriesCsv(openEnquiries, 'pricing-open-enquiries.csv');
              } else {
                downloadCsvFile(
                  'quotation-status-stats.csv',
                  ['Status', 'Count'],
                  quotationStats.map((row) => [row.status, String(row.count)]),
                );
              }
            }}
            disabled={activeTab === tabs[0] ? !openEnquiries.length : !quotationStats.length}
            className="bg-gray-100 border border-gray-300 hover:bg-gray-200 disabled:opacity-50 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors"
          >
            Export Report
          </button>
        </div>

        <div className="min-h-56">
          {query.isLoading ? (
            <div className="flex items-center justify-center h-56 text-sm text-gray-400">Loading pricing dashboard…</div>
          ) : query.isError ? (
            <div className="flex items-center justify-center h-56 px-5 text-sm text-red-600 text-center">
              {getErrorMessage(query.error, 'Could not load pricing dashboard.')}
            </div>
          ) : !submitted ? (
            <div className="flex items-center justify-center h-56">
              <Search size={40} className="text-gray-300" />
            </div>
          ) : activeTab === tabs[0] ? (
            openEnquiries.length === 0 ? (
              <div className="flex items-center justify-center h-56">
                <Search size={40} className="text-gray-300" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Enquiry No.</th>
                      <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Client</th>
                      <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Service</th>
                      <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Status</th>
                      <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openEnquiries.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => navigate(CUSTOMER_SERVICE_PATHS.enquiryDetail(item.id))}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-2 text-blue-600">{item.enquiryNo}</td>
                        <td className="px-4 py-2 text-gray-700">{item.client}</td>
                        <td className="px-4 py-2 text-gray-700">{item.serviceType}</td>
                        <td className="px-4 py-2 text-gray-700">{item.status}</td>
                        <td className="px-4 py-2 text-gray-700">{item.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : quotationStats.length === 0 ? (
            <div className="flex items-center justify-center h-56">
              <Search size={40} className="text-gray-300" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Quotation Status</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#0A2942]">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {quotationStats.map((row) => (
                    <tr key={row.status} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700">{row.status}</td>
                      <td className="px-4 py-2 text-gray-700">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
