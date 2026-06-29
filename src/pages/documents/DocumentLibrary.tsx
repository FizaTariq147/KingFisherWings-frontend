import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface Document {
  id: string;
  name: string;
  type: 'BL' | 'HAWB' | 'MAWB' | 'HBL' | 'Manifest' | 'Invoice' | 'Packing' | 'Certificate';
  jobRef: string;
  uploadDate: string;
  size: string;
  uploadedBy: string;
  mode: 'Air' | 'Sea' | 'Road';
}

const mockDocuments: Document[] = [
  { id: '1',  name: 'House Air Waybill',      type: 'HAWB',        jobRef: 'KFW/AE/06/26/00141', uploadDate: '2026-06-22', size: '320 KB', uploadedBy: 'Shahzad Zafar', mode: 'Air' },
  { id: '2',  name: 'Master Air Waybill',     type: 'MAWB',        jobRef: 'KFW/AE/06/26/00141', uploadDate: '2026-06-22', size: '280 KB', uploadedBy: 'Shahzad Zafar', mode: 'Air' },
  { id: '3',  name: 'Commercial Invoice',     type: 'Invoice',     jobRef: 'KFW/AE/06/26/00141', uploadDate: '2026-06-20', size: '245 KB', uploadedBy: 'Ahmed Ali',     mode: 'Air' },
  { id: '4',  name: 'Packing List',           type: 'Packing',     jobRef: 'KFW/AE/06/26/00141', uploadDate: '2026-06-20', size: '180 KB', uploadedBy: 'Ahmed Ali',     mode: 'Air' },
  { id: '5',  name: 'Bill of Lading',         type: 'BL',          jobRef: 'KFW/SE/06/26/00089', uploadDate: '2026-06-18', size: '410 KB', uploadedBy: 'Shahzad Zafar', mode: 'Sea' },
  { id: '6',  name: 'House Bill of Lading',   type: 'HBL',         jobRef: 'KFW/SE/06/26/00089', uploadDate: '2026-06-18', size: '390 KB', uploadedBy: 'Shahzad Zafar', mode: 'Sea' },
  { id: '7',  name: 'Cargo Manifest',         type: 'Manifest',    jobRef: 'KFW/SE/06/26/00089', uploadDate: '2026-06-19', size: '520 KB', uploadedBy: 'Omar Sheikh',   mode: 'Sea' },
  { id: '8',  name: 'Certificate of Origin',  type: 'Certificate', jobRef: 'KFW/SI/06/26/00034', uploadDate: '2026-06-15', size: '210 KB', uploadedBy: 'Ahmed Ali',     mode: 'Sea' },
  { id: '9',  name: 'Commercial Invoice',     type: 'Invoice',     jobRef: 'KFW/SI/06/26/00034', uploadDate: '2026-06-15', size: '230 KB', uploadedBy: 'Omar Sheikh',   mode: 'Sea' },
  { id: '10', name: 'House Air Waybill',      type: 'HAWB',        jobRef: 'KFW/AE/06/26/00140', uploadDate: '2026-06-21', size: '300 KB', uploadedBy: 'Shahzad Zafar', mode: 'Air' },
];

const docTypeIcons: Record<Document['type'], string> = {
  BL:          '🚢',
  HAWB:        '✈️',
  MAWB:        '✈️',
  HBL:         '🚢',
  Manifest:    '📋',
  Invoice:     '💰',
  Packing:     '📦',
  Certificate: '🏅',
};

const docTypeVariant: Record<Document['type'], 'info' | 'success' | 'warning' | 'neutral'> = {
  BL:          'info',
  HAWB:        'info',
  MAWB:        'info',
  HBL:         'info',
  Manifest:    'warning',
  Invoice:     'success',
  Packing:     'neutral',
  Certificate: 'warning',
};

const DOC_TYPES = ['All', 'BL', 'HAWB', 'MAWB', 'HBL', 'Manifest', 'Invoice', 'Packing', 'Certificate'] as const;

export default function DocumentLibrary() {
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => mockDocuments,
  });

  const filtered = documents.filter((doc) => {
    const matchSearch =
      doc.jobRef.toLowerCase().includes(search.toLowerCase()) ||
      doc.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || doc.type === typeFilter;
    const matchFrom = !dateFrom || doc.uploadDate >= dateFrom;
    const matchTo   = !dateTo   || doc.uploadDate <= dateTo;
    return matchSearch && matchType && matchFrom && matchTo;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Document Library</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">{documents.length} documents total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">⬇ Export List</Button>
          <Button>⬆ Upload Document</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          {/* Search */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-neutral-600)]">Search</label>
            <input
              type="text"
              placeholder="Job no. or document name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-64 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
            />
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-neutral-600)]">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-neutral-600)]">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
            />
          </div>

          {/* Reset */}
          <Button
            variant="ghost"
            size="md"
            onClick={() => { setSearch(''); setTypeFilter('All'); setDateFrom(''); setDateTo(''); }}
          >
            Reset
          </Button>
        </div>

        {/* Doc Type Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {DOC_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                typeFilter === t
                  ? 'bg-[var(--color-primary-500)] text-white'
                  : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-200)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Card>

      {/* Results count */}
      <p className="text-sm text-[var(--color-neutral-400)]">
        Showing {filtered.length} of {documents.length} documents
      </p>

      {/* Document Grid */}
      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-[var(--color-neutral-400)]">
            <p className="text-4xl mb-3">📂</p>
            <p className="text-sm font-medium">No documents found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              {/* Top Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center text-xl">
                  {docTypeIcons[doc.type]}
                </div>
                <Badge variant={docTypeVariant[doc.type]}>{doc.type}</Badge>
              </div>

              {/* Doc Name */}
              <p className="text-sm font-semibold text-[var(--color-neutral-800)] mb-1 truncate">
                {doc.name}
              </p>

              {/* Job Ref */}
              <p className="text-xs font-mono text-[var(--color-primary-600)] mb-1">
                {doc.jobRef}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-[var(--color-neutral-400)] mb-3">
                <span>{doc.uploadDate}</span>
                <span>{doc.size}</span>
              </div>

              <p className="text-xs text-[var(--color-neutral-400)] mb-3">
                By {doc.uploadedBy}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1">
                  👁 View
                </Button>
                <Button variant="primary" size="sm" className="flex-1">
                  ⬇ Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}