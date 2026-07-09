export type AuditAction =
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'DOCUMENT_GENERATED'
  | 'DOCUMENT_EMAILED'
  | 'SETTINGS_CHANGED'
  | 'PASSWORD_CHANGED'
  | 'PERMISSION_CHANGED'

export type AuditEntity =
  | 'USER'
  | 'ROLE'
  | 'JOB'
  | 'QUOTATION'
  | 'CUSTOMER'
  | 'INVOICE'
  | 'PAYMENT'
  | 'DOCUMENT'
  | 'SETTINGS'
  | 'SESSION'
  | 'PERMISSION'

export interface AuditLogEntry {
  id:          string
  action:      AuditAction
  entity:      AuditEntity
  entityId:    string | null
  entityLabel: string | null    // e.g. "KFW/AE/06/26/00141"
  userId:      string
  userName:    string
  userEmail:   string
  ipAddress:   string
  userAgent:   string | null
  before:      Record<string, unknown> | null
  after:       Record<string, unknown> | null
  meta:        Record<string, unknown> | null
  createdAt:   string           // ISO timestamp
}

export interface AuditLogFilters {
  userId?:     string
  action?:     AuditAction
  entity?:     AuditEntity
  dateFrom?:   string           // ISO date
  dateTo?:     string
  search?:     string           // free-text against entityLabel / userName
}

export interface AuditLogPage {
  data:       AuditLogEntry[]
  total:      number
  page:       number
  pageSize:   number
  totalPages: number
}