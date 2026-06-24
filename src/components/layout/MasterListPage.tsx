import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';

interface Column {
  key: string;
  label: string;
  mono?: boolean;
}

interface MasterListPageProps {
  title: string;
  columns: Column[];
  rows: Record<string, string>[];
  onAdd?: () => void;
}

export function MasterListPage({ title, columns, rows, onAdd }: MasterListPageProps) {
  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">{title}</h2>
        <Button onClick={onAdd}>+ Add New</Button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          className="h-9 w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
        />
        <Button variant="secondary" size="md">Filter ▾</Button>
        <Button variant="secondary" size="md">Export</Button>
      </div>

      {/* Table */}
      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key} mono={col.mono}>
                    {row[col.key]}
                  </TableCell>
                ))}
                <TableCell>
                  <Badge variant="success">Active</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-[var(--color-primary-500)] hover:underline">Edit</button>
                    <button className="text-xs text-[var(--color-danger-500)] hover:underline">Delete</button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[var(--color-neutral-400)]">
        <span>Showing 1–{rows.length} of {rows.length}</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 rounded border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]">←</button>
          <button className="px-3 py-1 rounded bg-[var(--color-primary-500)] text-white">1</button>
          <button className="px-3 py-1 rounded border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]">→</button>
        </div>
      </div>
    </div>
  );
}