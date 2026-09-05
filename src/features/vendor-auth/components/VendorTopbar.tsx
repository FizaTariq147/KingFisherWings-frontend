import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, Plus, Search } from 'lucide-react';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { firstName } from '../utils/vendorDashboardFormat';

export function VendorTopbar({
  notificationCount = 0,
  onMenuClick,
}: {
  notificationCount?: number;
  onMenuClick?: () => void;
}) {
  const navigate = useNavigate();
  const user = useVendorAuthStore((s) => s.user);
  const [query, setQuery] = useState('');
  const displayName = firstName(user?.fullName, user?.email);
  const initial = displayName.charAt(0).toUpperCase();

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    if (q.includes('alert') || q.includes('notif')) {
      navigate('/vendor/alerts');
      return;
    }
    if (q.includes('dispute')) {
      navigate('/vendor/disputes');
      return;
    }
    if (q.includes('payment') || q.includes('advance')) {
      navigate('/vendor/payments');
      return;
    }
    navigate('/vendor/invoices', { state: { search: query.trim() } });
  };

  return (
    <header className="sticky top-0 z-20 bg-[#F4F7F9]">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:gap-4 lg:px-8 lg:py-4">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Toggle navigation"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#5B6B7A] hover:bg-white hover:text-[#0A2942]"
          >
            <Menu size={20} />
          </button>
        ) : null}

        <form onSubmit={onSubmit} className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA8B5]"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search invoices, payments, disputes"
            className="h-11 w-full rounded-full border-0 bg-white pl-11 pr-4 text-sm text-[#0A2942] shadow-[0_8px_24px_rgba(10,41,66,0.06)] outline-none placeholder:text-[#9AA8B5] focus:ring-2 focus:ring-[#0A2942]/10"
          />
        </form>

        <Link
          to="/vendor/payment-requests"
          className="hidden h-10 shrink-0 items-center gap-1.5 rounded-full border border-[#E4EAF0] bg-white px-3.5 text-sm font-medium text-[#0A2942] shadow-[0_8px_24px_rgba(10,41,66,0.04)] hover:bg-[#F8FAFB] sm:inline-flex"
        >
          <Plus size={15} />
          New request
        </Link>

        <Link
          to="/vendor/alerts"
          className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center text-[#5B6B7A] hover:text-[#0A2942]"
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={1.8} />
          {notificationCount > 0 ? (
            <span className="absolute right-1 top-1 h-4 min-w-4 rounded-full bg-[#FF751F] px-1 text-center text-[10px] font-semibold leading-4 text-white">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          ) : null}
        </Link>

        <Link
          to="/vendor/account"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white py-1 pl-1 pr-2.5 shadow-[0_8px_24px_rgba(10,41,66,0.06)]"
          aria-label="Account"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#5B3A2E] text-sm font-semibold text-white">
            {initial}
          </span>
          <span className="hidden max-w-[120px] truncate text-sm font-medium text-[#0A2942] sm:inline">
            {displayName}
          </span>
        </Link>
      </div>
    </header>
  );
}
