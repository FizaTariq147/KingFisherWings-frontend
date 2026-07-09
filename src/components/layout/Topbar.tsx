import { Menu, Bell, BookOpen, Search, UserCircle, HelpCircle, ChevronDown, LogOut } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'

interface TopbarProps {
  companyName?: string
  notificationCount?: number
  onLogout?: () => void
}

export function Topbar({ companyName = 'KINGFISHER WINGS LOGISTIC LLC', notificationCount = 0, onLogout }: TopbarProps) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const user = useAuthStore((s) => s.user)

  return (
    <header
      className="h-18 flex items-center justify-between px-4 text-white shrink-0"
      style={{ background: 'var(--color-topbar-bg)' }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="p-1 hover:opacity-80"
        >
          <Menu size={20} />
        </button>
        <span className="font-bold text-md tracking-wide">{companyName}</span>
      </div>

      <div className="flex items-center gap-5 text-xs">
        <button type="button" aria-label="Notifications" className="relative flex items-center hover:opacity-80">
          <Bell size={20} />
          {notificationCount > 0 && (
            <span
              className="absolute -top-1.5 -right-2 min-w-[16px] px-1 rounded-full text-[10px] font-bold text-white text-center"
              style={{ background: 'var(--color-secondary)' }}
            >
              {notificationCount}
            </span>
          )}
        </button>

        <button type="button" className="flex items-center gap-1.5 hover:opacity-80">
          <BookOpen size={20} /> Blog
        </button>

        <button type="button" className="flex items-center gap-1.5 hover:opacity-80">
          <Search size={20} /> Search
        </button>

        <span className="flex items-center gap-1.5">
          <UserCircle size={20} /> {user?.name ?? 'User'}
        </span>

        <button type="button" className="flex items-center gap-1 hover:opacity-80">
          <HelpCircle size={20} /> Help <ChevronDown size={12} />
        </button>

        <button type="button" onClick={onLogout} className="flex items-center gap-1.5 hover:opacity-80">
          <LogOut size={20} /> Log Out
        </button>
      </div>
    </header>
  )
}
