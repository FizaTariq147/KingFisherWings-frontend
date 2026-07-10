import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { superAdminAuthService } from '@/features/superadmin/services/superAdminAuth.service';
import { useSuperAdminAuthStore } from '@/features/superadmin/store/superAdminAuthStore';

export function SuperAdminTopbar() {
  const navigate = useNavigate();
  const user = useSuperAdminAuthStore((s) => s.user);
  const logout = useSuperAdminAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await superAdminAuthService.logout();
    } catch {
      // clear local session regardless
    } finally {
      logout();
      navigate('/superadmin/login', { replace: true });
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <p className="text-sm text-slate-400">Platform Admin</p>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">
          {user ? `${user.firstName} ${user.lastName}` : ''}
        </span>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
