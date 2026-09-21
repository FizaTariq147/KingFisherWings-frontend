/**
 * Brand colors sampled from official KingFisher_Terms_and_Conditions.pdf
 * (header bar / titles / footer chrome). Use only for report chrome.
 */
export const KINGFISHER_TC_HEADER_FOOTER = {
  /** Top-bar / title navy on the T&C page */
  navy: '#0A2942',
  /** Top-bar / WINGS GROUP / MULTIMODAL orange on the T&C page */
  orange: '#F26A00',
} as const;

/** Outer page frame: navy border + orange ring (matches T&C brand). */
export const KINGFISHER_TC_PAGE_FRAME = {
  borderWidth: 2,
  borderStyle: 'solid' as const,
  borderColor: KINGFISHER_TC_HEADER_FOOTER.navy,
  boxShadow: `0 0 0 1px ${KINGFISHER_TC_HEADER_FOOTER.orange}`,
};

/** Shared tagline under company name (T&C “WINGS GROUP” / modes line). */
export const KINGFISHER_TC_HEADER_TAGLINE = 'ALL MODES OF TRANSPORT';
