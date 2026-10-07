import type { Party } from '@/features/parties/types/party.types';

/** Build address/contact lines from a party master for report layout blocks. */
export function partyToFormatPdfLines(party: Party | null | undefined): string[] {
  if (!party) return [];
  const lines: string[] = [];
  const name = party.name?.trim() || party.short_name?.trim();
  if (name) lines.push(name);

  const addr = party.addresses?.find((a) => a.is_default) ?? party.addresses?.[0];
  if (addr) {
    for (const part of [
      addr.address_line1,
      addr.address_line2,
      [addr.city, addr.state, addr.postal_code].filter(Boolean).join(', '),
      addr.country_code,
    ]) {
      const v = String(part ?? '').trim();
      if (v) lines.push(v);
    }
  } else if (party.address?.trim()) {
    lines.push(party.address.trim());
    const cityLine = [party.city, party.country_code].filter(Boolean).join(', ');
    if (cityLine) lines.push(cityLine);
  } else {
    const cityLine = [party.city, party.country_code].filter(Boolean).join(', ');
    if (cityLine) lines.push(cityLine);
  }

  const contact = party.contacts?.find((c) => c.is_primary) ?? party.contacts?.[0];
  const phone = party.phone || contact?.phone || contact?.mobile;
  const email = party.email || contact?.email;
  if (phone?.trim()) lines.push(phone.trim());
  if (email?.trim()) lines.push(email.trim());
  if (party.vat_number?.trim()) lines.push(`VAT: ${party.vat_number.trim()}`);

  return lines.filter(Boolean);
}

export function linesFromNameAddress(opts: {
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  extra?: Array<string | null | undefined>;
}): string[] {
  const lines: string[] = [];
  if (opts.name?.trim()) lines.push(opts.name.trim());
  if (opts.address?.trim()) {
    for (const part of opts.address.split(/\n|·/).map((s) => s.trim()).filter(Boolean)) {
      lines.push(part);
    }
  }
  if (opts.phone?.trim()) lines.push(opts.phone.trim());
  if (opts.email?.trim()) lines.push(opts.email.trim());
  for (const e of opts.extra ?? []) {
    if (e?.trim()) lines.push(e.trim());
  }
  return lines;
}
