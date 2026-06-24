import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export function Topbar({ title }: { title: string }) {
  const { toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-[var(--color-neutral-200)] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-800)] transition-colors"
        >
          ☰
        </button>
        <h1 className="text-sm font-semibold text-[var(--color-neutral-800)]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          className="h-8 w-48 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
        />
        {/* Notifications */}
        <button className="relative text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-800)]">
          🔔
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-danger-500)] text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-500)] flex items-center justify-center text-white text-xs font-semibold">
          {user?.name?.[0] ?? 'U'}
        </div>
      </div>
    </header>
  );
}