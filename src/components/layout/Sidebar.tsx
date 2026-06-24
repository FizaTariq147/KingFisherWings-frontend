import { useUIStore } from '../../store/uiStore';
import { cn } from '../../lib/utils';

const navItems = [
  { label: 'Dashboard',     icon: '📊', path: '/' },
  { label: 'Customers',     icon: '👥', path: '/customers' },
  { label: 'Quotations',    icon: '💬', path: '/quotations' },
  { label: 'Air Export',    icon: '✈️', path: '/jobs/air-export' },
  { label: 'Sea Export',    icon: '🚢', path: '/jobs/sea-export' },
  { label: 'Sea Import',    icon: '🚢', path: '/jobs/sea-import' },
  { label: 'Documentation', icon: '📄', path: '/documentation' },
  { label: 'Finance',       icon: '💰', path: '/finance' },
  { label: 'NVOCC',         icon: '🏢', path: '/nvocc' },
  { label: 'HR',            icon: '👤', path: '/hr' },
  { label: 'Masters',       icon: '⚙️', path: '/masters' },
  { label: 'Reports',       icon: '📈', path: '/reports' },
];

export function Sidebar() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-[var(--color-sidebar-bg)] text-[var(--color-sidebar-text)] transition-all duration-300',
      sidebarCollapsed ? 'w-16' : 'w-60'
    )}>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
          FG
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-sm text-white">Fresa Gold</span>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="text-base">{item.icon}</span>
            {!sidebarCollapsed && <span>{item.label}</span>}
          </a>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-white/10 text-xs text-white/40">
        {!sidebarCollapsed && 'Kingfisher Wings LLC'}
      </div>
    </aside>
  );
}