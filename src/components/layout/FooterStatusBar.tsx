import type { DashboardFooterInfo } from '@/types/dashboard.types'

interface FooterStatusBarProps {
  info: DashboardFooterInfo
}

export function FooterStatusBar({ info }: FooterStatusBarProps) {
  return (
    <div className="flex flex-col sm:flex-row text-[13px] shrink-0">
      <div
        className="flex-1 px-4 py-2.5 text-white truncate"
        style={{ background: '#0A2942' }}
        title={info.userEmail}
      >
        <span className="font-bold">User :</span> {info.userEmail}
      </div>
      <div
        className="flex-1 px-4 py-2.5 text-center text-white"
        style={{ background: '#FF751F' }}
      >
        {info.timestamp} &middot; {info.timezone}
      </div>
      <div
        className="flex-1 px-4 py-2.5 text-center sm:text-right text-white"
        style={{ background: '#DE1F26' }}
      >
        Powered by {info.poweredBy}
      </div>
    </div>
  )
}