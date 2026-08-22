import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  USER_FUNCTIONAL_FLAGS,
  USER_VISIBILITY_PERMISSIONS,
} from '../../constants/userPermissions';
import { UserStatusBadge } from '../UserStatusBadge';
import type { User } from '../../types/user.types';
import { formatUserRole } from '../../utils/formatUserRole';

interface UserOverviewPanelProps {
  user: User;
}

export function UserOverviewPanel({ user }: UserOverviewPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <dl className="space-y-0">
          <DetailRow label="Full name" value={`${user.first_name} ${user.last_name}`} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Phone" value={user.phone || '—'} />
          <DetailRow label="Avatar URL" value={user.avatar_url || '—'} />
          <DetailRow label="Status">
            <UserStatusBadge user={user} />
          </DetailRow>
          <DetailRow label="Last login" value={formatDate(user.last_login_at)} />
          <DetailRow label="Created" value={formatDate(user.created_at)} />
          <DetailRow label="Updated" value={formatDate(user.updated_at)} />
        </dl>
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Organization Assignment</CardTitle>
        </CardHeader>
        <dl className="space-y-0">
          <DetailRow label="Tenant ID" value={user.tenant_id} mono />
          <DetailRow label="Company ID" value={user.company_id || '—'} mono />
          <DetailRow label="Branch ID" value={user.branch_id || '—'} mono />
          <DetailRow label="Department ID" value={user.department_id || '—'} mono />
        </dl>
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Role and Status</CardTitle>
        </CardHeader>
        <dl className="space-y-0">
          <DetailRow label="Role" value={formatUserRole(user.role)} />
          <DetailRow label="Role IDs" value={formatList(user.role_ids)} />
          <DetailRow label="Permission IDs" value={formatList(user.permission_ids)} />
        </dl>
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Functional Flags</CardTitle>
        </CardHeader>
        <dl className="space-y-0">
          {USER_FUNCTIONAL_FLAGS.map((key) => (
            <DetailRow key={key} label={formatFieldLabel(key)} value={user[key] ? 'Yes' : 'No'} />
          ))}
        </dl>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Visibility Permissions</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          {USER_VISIBILITY_PERMISSIONS.map((key) => (
            <DetailRow key={key} label={formatFieldLabel(key)} value={user[key] ? 'Yes' : 'No'} />
          ))}
        </dl>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <DetailRow label="Allowed IPs" value={formatList(user.allowed_ips)} />
          <DetailRow label="Allowed MAC addresses" value={formatList(user.allowed_mac_addresses)} />
          <DetailRow label="Office hours start" value={user.office_hours_start || '—'} />
          <DetailRow label="Office hours end" value={user.office_hours_end || '—'} />
          <DetailRow label="Office hours timezone" value={user.office_hours_timezone || '—'} />
          <DetailRow label="Max concurrent sessions" value={String(user.max_concurrent_sessions)} />
        </dl>
      </Card>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 py-2.5 border-b border-[var(--color-neutral-50)] last:border-0">
      <dt className="text-xs text-[var(--color-neutral-500)]">{label}</dt>
      <dd
        className={`text-sm text-[var(--color-neutral-800)] ${mono ? 'font-mono text-xs break-all' : ''}`}
      >
        {children ?? value ?? '—'}
      </dd>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatList(values?: string[]) {
  if (!values?.length) return '—';
  return values.join(', ');
}

function formatFieldLabel(key: string) {
  return key
    .replace(/^can_see_/, 'Can see ')
    .replace(/^is_/, '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
