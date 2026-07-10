import type { ReactNode } from 'react'
import { Menu, Bell, BookOpen, Search, UserCircle, HelpCircle, ChevronDown, LogOut } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'

interface TopbarProps {
  companyName?: string
  notificationCount?: number
  onLogout?: () => void
}

function ActionButton({
  children,
  label,
  onClick,
  className = '',
}: {
  children: ReactNode
  label: string
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex items-center gap-1.5 hover:opacity-80 shrink-0 ${className}`}
    >
      {children}
      <span className="hidden lg:inline">{label}</span>
    </button>
  )
}

export function Topbar({
  companyName = 'KINGFISHER WINGS LOGISTIC LLC',
  notificationCount = 0,
  onLogout,
}: TopbarProps) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const openMobileSidebar = useUIStore((s) => s.openMobileSidebar)
  const user = useAuthStore((s) => s.user)

  const handleMenuClick = () => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      openMobileSidebar()
      return
    }
    toggleSidebar()
  }

  return (
    <header
      className="h-14 md:h-16 flex items-center justify-between gap-2 px-3 sm:px-4 text-white shrink-0 min-w-0"
      style={{ background: 'var(--color-topbar-bg)' }}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={handleMenuClick}
          aria-label="Toggle navigation"
          className="p-1.5 hover:opacity-80 shrink-0"
        >
          <Menu size={20} />
        </button>
        <span className="font-bold text-sm sm:text-base tracking-wide truncate min-w-0">
          {companyName}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 text-xs shrink-0">
        <button type="button" aria-label="Notifications" className="relative flex items-center hover:opacity-80 p-1">
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

        <ActionButton label="Blog" className="hidden sm:flex">
          <BookOpen size={20} />
        </ActionButton>

        <ActionButton label="Search" className="hidden md:flex">
          <Search size={20} />
        </ActionButton>

        <span className="hidden md:flex items-center gap-1.5 max-w-[8rem] lg:max-w-[12rem] min-w-0">
          <UserCircle size={20} className="shrink-0" />
          <span className="truncate">{user?.name ?? 'User'}</span>
        </span>

        <button type="button" className="hidden xl:flex items-center gap-1 hover:opacity-80 shrink-0">
          <HelpCircle size={20} />
          <span className="hidden lg:inline">Help</span>
          <ChevronDown size={12} />
        </button>

        <ActionButton label="Log Out" onClick={onLogout}>
          <LogOut size={20} />
        </ActionButton>
      </div>
    </header>
  )
}
