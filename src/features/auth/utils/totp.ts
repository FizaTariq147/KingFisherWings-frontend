const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function toBase32(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let output = ''
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += BASE32[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    output += BASE32[(value << (5 - bits)) & 31]
  }
  return output
}

function fromBase32(secret: string): Uint8Array {
  const cleaned = secret.toUpperCase().replace(/[\s=-]/g, '')
  let bits = 0
  let value = 0
  const bytes: number[] = []
  for (const char of cleaned) {
    const idx = BASE32.indexOf(char)
    if (idx < 0) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return new Uint8Array(bytes)
}

/** RFC 4648 base32 secret for TOTP (160-bit). */
export function generateTotpSecret(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return toBase32(bytes)
}

export function buildOtpauthUrl(secret: string, account: string): string {
  const label = encodeURIComponent(`KingFisher:${account || 'user'}`)
  const issuer = encodeURIComponent('KingFisher')
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`
}

export function totpQrImageUrl(otpauthUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(otpauthUrl)}`
}

/** Current 6-digit TOTP (SHA-1, 30s). */
export async function generateTotpCode(secret: string, period = 30): Promise<string> {
  const keyBytes = fromBase32(secret)
  const counter = Math.floor(Date.now() / 1000 / period)
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  view.setUint32(0, 0)
  view.setUint32(4, counter)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  )
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, buffer))
  const offset = signature[signature.length - 1] & 0x0f
  const binary =
    ((signature[offset] & 0x7f) << 24) |
    (signature[offset + 1] << 16) |
    (signature[offset + 2] << 8) |
    signature[offset + 3]
  return String(binary % 1_000_000).padStart(6, '0')
}

export function remainingTotpSeconds(period = 30): number {
  return period - (Math.floor(Date.now() / 1000) % period)
}
