import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { TodoDetailCell } from '@/components/dashboard/TodoDetailCell';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import type { Priority, TodoRow } from '@/types/dashboard.types';

const PRIORITY_VARIANT: Record<Priority, 'danger' | 'warning' | 'info'> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'info',
};

/**
 * Todo list panel — kept on the dashboard.
 * No tasks API is wired yet, so this shows an empty state (never dummy rows).
 * When GET /tasks (or equivalent) is available, feed `todos` from that query.
 */
export function TodoListWidget({
  todos = [],
  isLoading = false,
  isError = false,
}: {
  todos?: TodoRow[];
  isLoading?: boolean;
  isError?: boolean;
}) {
  return (
    <DashboardCard
      title="Todo List"
      accent="neutral"
      isLoading={isLoading}
      isEmpty={!isLoading && (isError || todos.length === 0)}
      emptyMessage={
        isError ? 'Unable to load todos.' : 'Nothing on the todo list.'
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-6">&nbsp;</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Assigned</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {todos.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <input
                  type="checkbox"
                  className="accent-[var(--color-secondary)]"
                  aria-label={`Mark "${row.details.slice(0, 30)}…" done`}
                />
              </TableCell>
              <TableCell className="max-w-[320px]">
                <TodoDetailCell text={row.details} />
              </TableCell>
              <TableCell>
                <Badge variant={PRIORITY_VARIANT[row.priority]}>{row.priority}</Badge>
              </TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell className="max-w-[140px] truncate">
                <div title={row.assigned}>{row.assigned}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCard>
  );
}

export default TodoListWidget;
