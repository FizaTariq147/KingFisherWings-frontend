/**
 * Legacy navy/orange chrome tokens for some invoice header bars (`TcBrandChrome`).
 * Not used by appended BL / Airway Terms PDFs.
 */
export const KINGFISHER_TC_HEADER_FOOTER = {
  navy: '#0A2942',
  orange: '#F26A00',
} as const;

/** Outer page frame: navy border + orange ring. */
export const KINGFISHER_TC_PAGE_FRAME = {
  borderWidth: 2,
  borderStyle: 'solid' as const,
  borderColor: KINGFISHER_TC_HEADER_FOOTER.navy,
  boxShadow: `0 0 0 1px ${KINGFISHER_TC_HEADER_FOOTER.orange}`,
};

/** Shared tagline under company name (T&C “WINGS GROUP” / modes line). */
export const KINGFISHER_TC_HEADER_TAGLINE = 'ALL MODES OF TRANSPORT';
