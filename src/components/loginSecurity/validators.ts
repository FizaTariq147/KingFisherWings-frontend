// ── IP validation ─────────────────────────────────────────────────────────
const IPV4_RE  = /^(\d{1,3}\.){3}\d{1,3}$/
const CIDR_RE  = /^(\d{1,3}\.){3}\d{1,3}\/(\d|[1-2]\d|3[0-2])$/

function isValidOctet(n: string): boolean {
  const v = parseInt(n, 10)
  return v >= 0 && v <= 255
}

export function validateIpRange(value: string): string | null {
  const trimmed = value.trim()

  if (CIDR_RE.test(trimmed)) {
    const [ip] = trimmed.split('/')
    const octets = ip.split('.')
    if (octets.every(isValidOctet)) return null
    return 'Invalid IP address in CIDR range'
  }

  if (IPV4_RE.test(trimmed)) {
    const octets = trimmed.split('.')
    if (octets.every(isValidOctet)) return null
    return 'IP address octets must be 0–255'
  }

  return 'Enter a valid IP (e.g. 192.168.1.1) or CIDR range (e.g. 192.168.1.0/24)'
}

// ── MAC validation ─────────────────────────────────────────────────────────
const MAC_COLON_RE = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/
const MAC_DASH_RE  = /^([0-9A-Fa-f]{2}-){5}[0-9A-Fa-f]{2}$/

export function validateMac(value: string): string | null {
  const trimmed = value.trim().toUpperCase()
  if (MAC_COLON_RE.test(trimmed) || MAC_DASH_RE.test(trimmed)) return null
  return 'Enter a valid MAC address (e.g. AA:BB:CC:DD:EE:FF)'
}

export function normalizeMac(value: string): string {
  return value.trim().toUpperCase().replace(/-/g, ':')
}

// ── Time validation ────────────────────────────────────────────────────────
export function validateTimeRange(start: string, end: string): string | null {
  if (start >= end) return 'End time must be after start time'
  return null
}