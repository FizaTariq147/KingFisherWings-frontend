/**
 * Shared PDF branding inspection helpers from Phase 3.1 acceptance.
 * Used by Phase 3.1 audit and Phase 2.5 Draft/Draft-2 preflight.
 * Does not implement branding — only inspects generated PDF bytes.
 */
import crypto from 'node:crypto';
import { PDFDocument } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export const FRESA_BYTE_RE =
  /fresa\s*technologies|fresatechnologies\.com|www\.fresa|\/fresa[-_]/gi;

/** Non-global: safe for repeated .test() across many PDFs. */
export const FRESA_TEXT_RE =
  /\bfresa\s+technologies\b|\bfresatechnologies\b|\bwww\.fresa\b|\bfresa\s+demo\b/i;

/** Org fixture used by Phase 3.1 harness generate path. */
export const PHASE31_ORG_NAME = 'Phase31 Audit Org LLC';

export async function extractPdfText(buf) {
  try {
    const doc = await getDocument({ data: new Uint8Array(buf), useSystemFonts: true }).promise;
    const parts = [];
    for (let i = 1; i <= doc.numPages; i += 1) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      parts.push(content.items.map((it) => ('str' in it ? it.str : '')).join(' '));
    }
    return parts.join('\n');
  } catch (e) {
    return `<<text_extract_failed:${e instanceof Error ? e.message : String(e)}>>`;
  }
}

/**
 * Inspect PDF bytes for Fresa branding markers and optional org-name text.
 * html2canvas production PDFs typically have no text layer — use brandingProof
 * from the Phase 3.1 harness for org verification.
 */
export async function inspectPdfBranding(buf, { orgName = PHASE31_ORG_NAME } = {}) {
  const latin = buf.toString('latin1');
  const byteHits = [...latin.matchAll(FRESA_BYTE_RE)].map((m) => m[0]);
  const uniqueByteHits = [...new Set(byteHits.map((h) => h.toLowerCase()))];

  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  const pageCount = doc.getPageCount();
  const pages = [];
  for (let i = 0; i < pageCount; i += 1) {
    const { width, height } = doc.getPage(i).getSize();
    pages.push({
      index: i + 1,
      widthPt: Math.round(width * 10) / 10,
      heightPt: Math.round(height * 10) / 10,
    });
  }

  const title = doc.getTitle() || '';
  const author = doc.getAuthor() || '';
  const subject = doc.getSubject() || '';
  const keywords = doc.getKeywords() || '';
  const creator = doc.getCreator() || '';
  const producer = doc.getProducer() || '';
  const metaBlob = [title, author, subject, keywords, creator, producer].join(' | ');
  const metaFresa = FRESA_TEXT_RE.test(metaBlob) || FRESA_BYTE_RE.test(metaBlob);

  const jpegCount = (latin.match(/\xff\xd8\xff/g) || []).length;
  const pngCount = (latin.match(/\x89PNG\r\n\x1a\n/g) || []).length;

  const text = await extractPdfText(buf);
  const textFresa = FRESA_TEXT_RE.test(text);
  const orgFound = orgName ? text.toLowerCase().includes(orgName.toLowerCase()) : false;
  const fresaLogoDetected = uniqueByteHits.length > 0 || textFresa || metaFresa;

  return {
    pageCount,
    pages,
    sha256: crypto.createHash('sha256').update(buf).digest('hex'),
    byteMarkers: uniqueByteHits,
    textFresa,
    metaFresa,
    metadata: { title, author, subject, keywords, creator, producer },
    imageHints: { jpegSignatures: jpegCount, pngSignatures: pngCount },
    textSnippet: text.replace(/\s+/g, ' ').trim().slice(0, 280),
    orgNameFound: orgFound,
    fresaLogoDetected,
  };
}

/**
 * Verdict for a Phase 3.1 harness generate result + inspect payload.
 * Requires org brandingProof (raster PDFs lack a text layer).
 */
export function verdictGenerateBranding({
  ok,
  source,
  brandingProof,
  inspect,
  expectedOrgName = PHASE31_ORG_NAME,
}) {
  if (!ok) return { pass: false, verdict: 'FAIL', reason: 'generate_failed' };
  if (String(source || '').includes('fresa_cdn_sample')) {
    return { pass: false, verdict: 'FAIL', reason: 'silent_fresa_sample_source' };
  }
  if (inspect?.fresaLogoDetected) {
    return { pass: false, verdict: 'FAIL', reason: 'fresa_markers_in_pdf' };
  }
  if (!(inspect?.pageCount >= 1)) {
    return { pass: false, verdict: 'FAIL', reason: 'empty_pdf' };
  }
  if (!brandingProof || brandingProof.companyName !== expectedOrgName) {
    return { pass: false, verdict: 'FAIL', reason: 'org_name_not_applied' };
  }
  if (!brandingProof.logoUrlProvided) {
    return { pass: false, verdict: 'FAIL', reason: 'org_logo_not_applied' };
  }
  if (!brandingProof.entityBound) {
    return { pass: false, verdict: 'FAIL', reason: 'not_entity_bound' };
  }
  return { pass: true, verdict: 'PASS', reason: 'org_branding_no_fresa' };
}
