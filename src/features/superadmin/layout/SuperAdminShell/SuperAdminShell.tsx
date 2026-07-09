// PASTE THIS AT: src/features/superadmin/layout/SuperAdminShell/SuperAdminShell.tsx

import { Outlet } from 'react-router-dom';
import { SuperAdminSidebar } from '../SuperAdminSidebar';
import { SuperAdminTopbar } from '../SuperAdminTopbar';

export function SuperAdminShell() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SuperAdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
