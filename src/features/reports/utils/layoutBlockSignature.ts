/**
 * Structural signature for catalogue / layout dedupe.
 * Mirrors scripts/lib/fresaLayoutDiversity.mjs blockSignature.
 */
export function layoutBlockSignature(blocks: unknown): string {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .map((b) => {
      if (!b || typeof b !== 'object') return String(b);
      const block = b as Record<string, unknown>;
      const parts = [String(block.type ?? '')];
      if (block.headerColor) parts.push(String(block.headerColor));
      if (block.cols != null) parts.push(`c${block.cols}`);
      if (block.align) parts.push(String(block.align));
      if (block.band) parts.push('band');
      if (block.showContact) parts.push('contact');
      if (block.variant) parts.push(String(block.variant));
      if (block.showCharges === false) parts.push('noCharges');
      if (block.showCharges === true) parts.push('charges');
      return parts.join(':');
    })
    .join('>');
}
