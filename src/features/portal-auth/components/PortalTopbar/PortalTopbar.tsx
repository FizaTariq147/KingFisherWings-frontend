import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search } from 'lucide-react';
import { usePortalAuthStore } from '../../store/portalAuthStore';

export function PortalTopbar({
  unreadCount = 0,
  onMenuClick,
}: {
  unreadCount?: number;
  onMenuClick?: () => void;
}) {
  const navigate = useNavigate();
  const user = usePortalAuthStore((s) => s.user);
  const [query, setQuery] = useState('');

  const initial = (user?.fullName || user?.email || 'U').charAt(0).toUpperCase();

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate('/portal/track', { state: { ref: q } });
  };

  return (
    <header className="sticky top-0 z-20 bg-[#F4F7F9]">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:gap-4 lg:px-8 lg:py-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#5B6B7A] hover:bg-white hover:text-[#0A2942]"
        >
          <Menu size={20} />
        </button>

        <form onSubmit={onSubmit} className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA8B5]"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search shipments, quotes, invoices…"
            className="h-11 w-full rounded-full border-0 bg-white pl-11 pr-4 text-sm text-[#0A2942] shadow-[0_8px_24px_rgba(10,41,66,0.06)] outline-none placeholder:text-[#9AA8B5] focus:ring-2 focus:ring-[#0A2942]/10"
          />
        </form>

        <Link
          to="/portal/alerts"
          className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center text-[#5B6B7A] hover:text-[#0A2942]"
          aria-label={unreadCount > 0 ? `Alerts, ${unreadCount} unread` : 'Alerts'}
        >
          <Bell size={20} strokeWidth={1.8} />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF751F] px-1 text-center text-[10px] font-semibold leading-none text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </Link>

        <Link
          to="/portal/account"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF751F] text-sm font-semibold text-white shadow-[0_6px_14px_rgba(255,117,31,0.35)]"
          aria-label="Account"
        >
          {initial}
        </Link>
      </div>
    </header>
  );
}
