export interface ActiveSession {
  id:           string
  deviceType:   'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser:      string        // e.g. "Chrome 124"
  os:           string        // e.g. "Windows 11"
  ipAddress:    string
  location:     string | null // e.g. "Dubai, UAE" — geo-resolved by backend
  lastActiveAt: string        // ISO timestamp
  createdAt:    string        // ISO timestamp — session start
  isCurrent:    boolean       // backend compares session id to current JWT
}

export interface SessionListResponse {
  sessions: ActiveSession[]
}