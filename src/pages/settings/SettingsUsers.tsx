import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '../../components/ui/Table';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  lastLogin: string;
  status: 'Active' | 'Inactive' | 'Pending';
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

const mockUsers: SystemUser[] = [
  { id: '1', name: 'Shahzad Zafar',  email: 'shahzad@kfw.ae',  role: 'Admin',        department: 'Operations', lastLogin: '2026-06-29 09:30', status: 'Active',  permissions: ['all'] },
  { id: '2', name: 'Ahmed Ali',       email: 'ahmed@kfw.ae',    role: 'Finance',      department: 'Finance',    lastLogin: '2026-06-29 08:45', status: 'Active',  permissions: ['finance', 'invoices', 'reports'] },
  { id: '3', name: 'Omar Sheikh',     email: 'omar@kfw.ae',     role: 'Operations',   department: 'Operations', lastLogin: '2026-06-28 17:00', status: 'Active',  permissions: ['jobs', 'quotations', 'documents'] },
  { id: '4', name: 'Sara Hassan',     email: 'sara@kfw.ae',     role: 'HR',           department: 'HR',         lastLogin: '2026-06-28 16:30', status: 'Active',  permissions: ['hr', 'employees', 'leave'] },
  { id: '5', name: 'Khalid Mansoor',  email: 'khalid@kfw.ae',   role: 'Sales',        department: 'Sales',      lastLogin: '2026-06-27 14:00', status: 'Active',  permissions: ['quotations', 'customers'] },
  { id: '6', name: 'Fatima Al Ali',   email: 'fatima@kfw.ae',   role: 'Finance',      department: 'Finance',    lastLogin: '2026-06-26 11:00', status: 'Active',  permissions: ['invoices', 'finance'] },
  { id: '7', name: 'Ravi Kumar',      email: 'ravi@kfw.ae',     role: 'Operations',   department: 'Operations', lastLogin: '2026-06-25 10:00', status: 'Inactive', permissions: ['documents'] },
  { id: '8', name: 'New Invite',      email: 'newuser@kfw.ae',  role: 'Operations',   department: 'Operations', lastLogin: '—',                status: 'Pending', permissions: [] },
];

const mockRoles: Role[] = [
  { id: '1', name: 'Admin',       description: 'Full system access',                        userCount: 1, permissions: ['all'] },
  { id: '2', name: 'Operations',  description: 'Jobs, quotations, documents',               userCount: 3, permissions: ['jobs', 'quotations', 'documents', 'customers'] },
  { id: '3', name: 'Finance',     description: 'Invoices, payments, financial reports',     userCount: 2, permissions: ['finance', 'invoices', 'reports'] },
  { id: '4', name: 'Sales',       description: 'CRM, quotations, customer management',      userCount: 1, permissions: ['quotations', 'customers', 'reports'] },
  { id: '5', name: 'HR',          description: 'Employee management, leave, payroll',       userCount: 1, permissions: ['hr', 'employees', 'leave'] },
  { id: '6', name: 'WMS',         description: 'Warehouse, GRN, GDN, stock management',    userCount: 0, permissions: ['wms', 'stock'] },
  { id: '7', name: 'Read Only',   description: 'View-only access to all modules',           userCount: 0, permissions: ['view_all'] },
];

const ALL_PERMISSIONS = [
  { key: 'jobs',         label: 'Jobs & Shipments' },
  { key: 'quotations',   label: 'Quotations' },
  { key: 'customers',    label: 'Customers' },
  { key: 'documents',    label: 'Documents' },
  { key: 'finance',      label: 'Finance' },
  { key: 'invoices',     label: 'Invoices' },
  { key: 'hr',           label: 'HR Management' },
  { key: 'employees',    label: 'Employees' },
  { key: 'leave',        label: 'Leave Management' },
  { key: 'wms',          label: 'Warehouse (WMS)' },
  { key: 'reports',      label: 'Reports & MIS' },
  { key: 'masters',      label: 'Master Data' },
  { key: 'settings',     label: 'Settings' },
];

const statusVariant: Record<SystemUser['status'], 'success' | 'neutral' | 'warning'> = {
  Active:  'success',
  Inactive: 'neutral',
  Pending:  'warning',
};

type Tab = 'users' | 'roles';

export default function SettingsUsers() {
  const [activeTab, setActiveTab]     = useState<Tab>('users');
  const [search, setSearch]           = useState('');
  const [inviteModal, setInviteModal] = useState(false);
  const [roleModal, setRoleModal]     = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const { data: users = [] } = useQuery<SystemUser[]>({
    queryKey: ['system-users'],
    queryFn: async () => mockUsers,
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['system-roles'],
    queryFn: async () => mockRoles,
  });

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Users & Permissions</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">
            {users.filter((u) => u.status === 'Active').length} active users · {roles.length} roles
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'users' && (
            <Button onClick={() => setInviteModal(true)}>+ Invite User</Button>
          )}
          {activeTab === 'roles' && (
            <Button onClick={() => { setSelectedRole(null); setRoleModal(true); }}>+ New Role</Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-neutral-200)]">
        <div className="flex gap-0">
          {([
            { key: 'users', label: '👤 Users' },
            { key: 'roles', label: '🔐 Roles & Permissions' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[var(--color-primary-500)] text-[var(--color-primary-600)]'
                  : 'border-transparent text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-800)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Users',   value: users.length,                                              color: 'text-[var(--color-neutral-800)]' },
              { label: 'Active',        value: users.filter((u) => u.status === 'Active').length,         color: 'text-[var(--color-success-500)]' },
              { label: 'Pending Invite', value: users.filter((u) => u.status === 'Pending').length,       color: 'text-[var(--color-warning-500)]' },
              { label: 'Inactive',      value: users.filter((u) => u.status === 'Inactive').length,       color: 'text-[var(--color-neutral-400)]' },
            ].map((card) => (
              <Card key={card.label}>
                <p className="text-xs text-[var(--color-neutral-400)] mb-1">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </Card>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-80 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
          />

          {/* Users Table */}
          <Card padding="none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-xs font-semibold text-[var(--color-primary-700)] shrink-0">
                          {user.name === 'New Invite' ? '✉' : user.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-neutral-800)]">{user.name}</p>
                          <p className="text-xs text-[var(--color-neutral-400)]">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-primary-50)] text-[var(--color-primary-700)]">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell mono className="text-[var(--color-neutral-400)]">{user.lastLogin}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-[var(--color-primary-500)] hover:underline">Edit</button>
                        {user.status === 'Pending' && (
                          <button className="text-xs text-[var(--color-warning-500)] hover:underline">Resend</button>
                        )}
                        {user.status === 'Active' && (
                          <button className="text-xs text-[var(--color-warning-500)] hover:underline">Deactivate</button>
                        )}
                        {user.status === 'Inactive' && (
                          <button className="text-xs text-[var(--color-success-500)] hover:underline">Activate</button>
                        )}
                        <button className="text-xs text-[var(--color-danger-500)] hover:underline">Remove</button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-2 gap-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div>
                  <p className="font-semibold text-[var(--color-neutral-800)]">{role.name}</p>
                  <p className="text-xs text-[var(--color-neutral-400)] mt-0.5">{role.description}</p>
                </div>
                <Badge variant={role.userCount > 0 ? 'info' : 'neutral'}>
                  {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                </Badge>
              </CardHeader>

              {/* Permissions */}
              <div className="flex flex-wrap gap-1 mb-3">
                {role.permissions[0] === 'all' ? (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-success-100)] text-[var(--color-success-700)]">
                    All Permissions
                  </span>
                ) : (
                  role.permissions.map((perm) => (
                    <span key={perm} className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]">
                      {ALL_PERMISSIONS.find((p) => p.key === perm)?.label || perm}
                    </span>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => { setSelectedRole(role); setRoleModal(true); }}
                >
                  Edit Role
                </Button>
                {role.name !== 'Admin' && (
                  <Button variant="ghost" size="sm" className="text-[var(--color-danger-500)]">
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invite User Modal */}
      <Modal
        open={inviteModal}
        onClose={() => setInviteModal(false)}
        title="Invite New User"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteModal(false)}>Cancel</Button>
            <Button onClick={() => setInviteModal(false)}>Send Invitation</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--color-neutral-600)]">First Name</label>
              <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="First name..." />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--color-neutral-600)]">Last Name</label>
              <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="Last name..." />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-neutral-600)]">Email Address *</label>
            <input type="email" className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="user@company.ae" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--color-neutral-600)]">Role *</label>
              <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                <option value="">-- Select role --</option>
                {roles.map((r) => <option key={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--color-neutral-600)]">Department</label>
              <input type="text" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" placeholder="Department..." />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[var(--color-info-100)] border border-[var(--color-info-500)]/20">
            <p className="text-xs text-[var(--color-info-500)]">
              An invitation email will be sent to the user with a link to set their password and activate their account.
            </p>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        open={roleModal}
        onClose={() => setRoleModal(false)}
        title={selectedRole ? `Edit Role — ${selectedRole.name}` : 'New Role'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRoleModal(false)}>Cancel</Button>
            <Button onClick={() => setRoleModal(false)}>Save Role</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--color-neutral-600)]">Role Name *</label>
              <input
                type="text"
                defaultValue={selectedRole?.name}
                className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                placeholder="e.g. Operations Manager"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--color-neutral-600)]">Description</label>
              <input
                type="text"
                defaultValue={selectedRole?.description}
                className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                placeholder="Brief description..."
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--color-neutral-600)] uppercase mb-3">Module Permissions</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PERMISSIONS.map((perm) => {
                const hasPermission = selectedRole?.permissions[0] === 'all' ||
                  selectedRole?.permissions.includes(perm.key);
                return (
                  <label
                    key={perm.key}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={hasPermission}
                      className="rounded"
                    />
                    <span className="text-sm text-[var(--color-neutral-700)]">{perm.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}