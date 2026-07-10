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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">{title}</h2>
        <Button onClick={onAdd} className="w-full sm:w-auto">+ Add New</Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          className="h-9 w-full sm:flex-1 sm:min-w-[12rem] sm:max-w-md rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
        />
        <div className="flex gap-2">
          <Button variant="secondary" size="md" className="flex-1 sm:flex-none">Filter ▾</Button>
          <Button variant="secondary" size="md" className="flex-1 sm:flex-none">Export</Button>
        </div>
      </div>

      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className="whitespace-nowrap">{col.label}</TableHead>
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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-[var(--color-neutral-400)]">
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
