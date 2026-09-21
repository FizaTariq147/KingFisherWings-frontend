const STORAGE_PREFIX = 'kf.nvocc.quoteBookingLink.v1:';
const BOOKING_TO_QUOTE_PREFIX = 'kf.nvocc.bookingQuoteLink.v1:';

function keyForQuote(quotationId: string): string {
  return `${STORAGE_PREFIX}${quotationId.trim()}`;
}

function keyForBooking(bookingId: string): string {
  return `${BOOKING_TO_QUOTE_PREFIX}${bookingId.trim()}`;
}

/** Remember which NVOCC booking continues a quotation (Stage 1–2). */
export function rememberQuoteBookingLink(opts: {
  quotationId?: string | null;
  quoteNumber?: string | null;
  bookingId?: string | null;
}): void {
  if (typeof sessionStorage === 'undefined') return;
  const bookingId = opts.bookingId?.trim();
  if (!bookingId) return;
  try {
    const payload = JSON.stringify({
      bookingId,
      quoteNumber: opts.quoteNumber?.trim() || undefined,
      at: new Date().toISOString(),
    });
    if (opts.quotationId?.trim()) {
      sessionStorage.setItem(keyForQuote(opts.quotationId.trim()), payload);
      try {
        sessionStorage.setItem(
          keyForBooking(bookingId),
          JSON.stringify({
            quotationId: opts.quotationId.trim(),
            quoteNumber: opts.quoteNumber?.trim() || undefined,
            at: new Date().toISOString(),
          }),
        );
      } catch {
        /* ignore */
      }
    }
    if (opts.quoteNumber?.trim()) {
      sessionStorage.setItem(keyForQuote(`num:${opts.quoteNumber.trim()}`), payload);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

/** Reverse lookup: booking → quotation (set when quote↔booking link is remembered). */
export function readRememberedQuoteForBooking(bookingId?: string | null): {
  quotationId?: string;
  quoteNumber?: string;
} | null {
  if (typeof sessionStorage === 'undefined') return null;
  const id = bookingId?.trim();
  if (!id) return null;
  try {
    const raw = sessionStorage.getItem(keyForBooking(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      quotationId?: string;
      quoteNumber?: string;
    };
    if (!parsed?.quotationId?.trim() && !parsed?.quoteNumber?.trim()) return null;
    return {
      quotationId: parsed.quotationId?.trim(),
      quoteNumber: parsed.quoteNumber?.trim(),
    };
  } catch {
    return null;
  }
}

export function readRememberedBookingIdForQuote(opts: {
  quotationId?: string | null;
  quoteNumber?: string | null;
}): string | undefined {
  if (typeof sessionStorage === 'undefined') return undefined;
  try {
    const keys = [
      opts.quotationId?.trim() ? keyForQuote(opts.quotationId.trim()) : '',
      opts.quoteNumber?.trim() ? keyForQuote(`num:${opts.quoteNumber.trim()}`) : '',
    ].filter(Boolean);
    for (const key of keys) {
      const raw = sessionStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { bookingId?: string };
      if (parsed?.bookingId?.trim()) return parsed.bookingId.trim();
    }
  } catch {
    /* ignore */
  }
  return undefined;
}
