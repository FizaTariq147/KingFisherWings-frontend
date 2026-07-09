// REPLACE THIS FILE AT: src/features/superadmin/layout/SuperAdminSidebar/SuperAdminSidebar.tsx
// Only change from before: /admin/* -> /superadmin/* (matches real router), added Dashboard link

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, CreditCard, Activity, Settings, ScrollText } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard, enabled: true },
  { to: '/superadmin/tenants', label: 'Tenants', icon: Building2, enabled: true },
  { to: '/superadmin/billing', label: 'Billing', icon: CreditCard, enabled: false },
  { to: '/superadmin/monitoring', label: 'Monitoring', icon: Activity, enabled: false },
  { to: '/superadmin/settings', label: 'Settings', icon: Settings, enabled: false },
  { to: '/superadmin/audit-log', label: 'Audit Log', icon: ScrollText, enabled: false },
];

export function SuperAdminSidebar() {
  return (
    <aside className="w-60 bg-slate-900 text-slate-100 flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-slate-800">
        <p className="text-xs uppercase tracking-widest text-slate-500">KINGFISHER WINGS LOGISTIC</p>
        <p className="text-sm font-semibold text-amber-400">Platform Admin</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.enabled ? item.to : '#'}
            onClick={(e) => { if (!item.enabled) e.preventDefault(); }}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                !item.enabled
                  ? 'text-slate-600 cursor-not-allowed'
                  : isActive
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
            {!item.enabled && <span className="ml-auto text-[10px] text-slate-600">Soon</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}