export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

export interface OfficeHoursDay {
  day:     DayOfWeek
  enabled: boolean
  start:   string   // "HH:MM" 24-hour
  end:     string   // "HH:MM" 24-hour
}

export interface LoginSecurityConfig {
  userId:              string
  ipRestrictionEnabled: boolean
  allowedIpRanges:     string[]   // CIDR or single IP e.g. "192.168.1.0/24", "10.0.0.1"
  macRestrictionEnabled: boolean
  allowedMacAddresses: string[]   // e.g. "AA:BB:CC:DD:EE:FF"
  officeHoursEnabled:  boolean
  officeHours:         OfficeHoursDay[]
  timezone:            string     // IANA e.g. "Asia/Dubai"
  multiLoginAllowed:   boolean
}

// PATCH /users/:id (allowed_ips, allowed_mac_addresses, office hours)
export type LoginSecurityPayload = Omit<LoginSecurityConfig, 'userId'>

export const DAYS_OF_WEEK: { day: DayOfWeek; label: string; short: string }[] = [
  { day: 'MON', label: 'Monday',    short: 'Mon' },
  { day: 'TUE', label: 'Tuesday',   short: 'Tue' },
  { day: 'WED', label: 'Wednesday', short: 'Wed' },
  { day: 'THU', label: 'Thursday',  short: 'Thu' },
  { day: 'FRI', label: 'Friday',    short: 'Fri' },
  { day: 'SAT', label: 'Saturday',  short: 'Sat' },
  { day: 'SUN', label: 'Sunday',    short: 'Sun' },
]

export const DEFAULT_OFFICE_HOURS: OfficeHoursDay[] = DAYS_OF_WEEK.map(({ day }) => ({
  day,
  enabled: !['SAT', 'SUN'].includes(day),
  start:   '09:00',
  end:     '18:00',
}))