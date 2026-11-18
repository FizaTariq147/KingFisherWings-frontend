/**
 * Non-embedded reference fonts keep the BaseFont name and the reference Widths.
 * Embedded fonts keep Arimo outlines; their advance table is replaced before save.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { PDFArray, PDFDocument, PDFName, PDFString } from 'pdf-lib';

const require = createRequire(import.meta.url);
const StandardFontEmbedder = require('pdf-lib/cjs/core/embedders/StandardFontEmbedder.js').default;
const PDFFont = require('pdf-lib/cjs/api/PDFFont.js').default;

const STANDARD = new Map([
  ['Courier', 'Courier'],
  ['Courier-Bold', 'Courier-Bold'],
  ['Courier-Oblique', 'Courier-Oblique'],
  ['Courier-BoldOblique', 'Courier-BoldOblique'],
  ['Helvetica', 'Helvetica'],
  ['Helvetica-Bold', 'Helvetica-Bold'],
  ['Helvetica-Oblique', 'Helvetica-Oblique'],
  ['Helvetica-BoldOblique', 'Helvetica-BoldOblique'],
  ['Times-Roman', 'Times-Roman'],
  ['Times-Bold', 'Times-Bold'],
  ['Times-Italic', 'Times-Italic'],
  ['Times-BoldItalic', 'Times-BoldItalic'],
  ['Symbol', 'Symbol'],
  ['ZapfDingbats', 'ZapfDingbats'],
]);

export function baseFontName(name) {
  return String(name || 'Helvetica').replace(/^[A-Z]{6}\+/, '');
}

export function standardFontName(name) {
  return STANDARD.get(baseFontName(name)) || null;
}

export function widthTables(pages) {
  const tables = new Map();
  const spans = (pages || []).flatMap((page) => [
    ...(page.spans || []),
    ...(page.table?.rows || []).flat().filter(Boolean),
  ]);
  for (const span of spans) {
    const table = tables.get(span.font) || new Map();
    const chars = Array.from(span.glyphText || '');
    const advances = span.advances || [];
    for (let index = 0; index < Math.min(chars.length, advances.length); index += 1) {
      const code = chars[index].codePointAt(0);
      if (!table.has(code)) table.set(code, advances[index]);
    }
    tables.set(span.font, table);
  }
  return tables;
}

export function applyAdvanceTable(pdfFont, widthByCodePoint) {
  const embedder = pdfFont?.embedder;
  if (!embedder?.glyphs || !embedder.scale || !widthByCodePoint) return 0;
  let patched = 0;
  embedder.glyphs.forEach((glyph, index) => {
    if (!glyph) return;
    const code = glyph.codePoints?.[0];
    if (code == null || !widthByCodePoint.has(code)) return;
    const next = widthByCodePoint.get(code) / embedder.scale;
    const wrapper = Object.create(glyph);
    Object.defineProperty(wrapper, 'advanceWidth', { value: next, writable: true, configurable: true });
    embedder.glyphs[index] = wrapper;
    if (embedder.font?._glyphs && glyph.id != null) embedder.font._glyphs[glyph.id] = wrapper;
    patched += 1;
  });
  embedder.glyphCache?.invalidate?.();
  return patched;
}

function asNumber(value) {
  if (value == null) return null;
  if (typeof value.asNumber === 'function') return value.asNumber();
  const parsed = Number(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function freeze(value) {
  if (value == null) return null;
  if (typeof value.asNumber === 'function') return { kind: 'number', value: value.asNumber() };
  if (value.encodedName) return { kind: 'name', value: value.decodeText() };
  if (typeof value.decodeText === 'function' && typeof value.size !== 'function') return { kind: 'string', value: value.decodeText() };
  if (typeof value.size === 'function') {
    const items = [];
    for (let index = 0; index < value.size(); index += 1) items.push(freeze(value.lookup(index)));
    return { kind: 'array', value: items };
  }
  return null;
}

function thaw(frozen) {
  if (!frozen) return null;
  if (frozen.kind === 'number') return frozen.value;
  if (frozen.kind === 'name') return PDFName.of(frozen.value);
  if (frozen.kind === 'string') return PDFString.of(frozen.value);
  if (frozen.kind === 'array') return frozen.value.map((item) => thaw(item));
  return null;
}

function descriptorSnapshot(dict) {
  if (!dict || typeof dict.entries !== 'function') return null;
  const fields = {};
  for (const [key, raw] of dict.entries()) {
    const name = key.decodeText?.() || String(key);
    if (/^FontFile/.test(name)) continue;
    const frozen = freeze(dict.lookup(key));
    if (frozen) fields[name] = frozen;
  }
  return fields;
}

function encodingSnapshot(value) {
  if (!value) return { name: 'WinAnsiEncoding', differences: null };
  if (value.encodedName) return { name: value.decodeText(), differences: null };
  if (typeof value.lookup !== 'function') return { name: 'WinAnsiEncoding', differences: null };
  const base = value.lookup(PDFName.of('BaseEncoding'));
  const differences = value.lookup(PDFName.of('Differences'));
  return {
    name: base?.decodeText?.() || 'WinAnsiEncoding',
    differences: differences ? freeze(differences) : null,
  };
}

function streamBytes(value) {
  if (!value || typeof value.getContents !== 'function') return null;
  const contents = value.getContents();
  return contents ? Buffer.from(contents) : null;
}

export async function referenceFontSnapshots(pdfPath) {
  const doc = await PDFDocument.load(fs.readFileSync(pdfPath), { ignoreEncryption: true });
  const snapshots = new Map();
  for (const page of doc.getPages()) {
    const resources = page.node.lookup(PDFName.of('Resources'));
    const fonts = resources?.lookup(PDFName.of('Font'));
    if (!fonts || typeof fonts.entries !== 'function') continue;
    for (const [key] of fonts.entries()) {
      const font = fonts.lookup(key);
      if (!font || typeof font.lookup !== 'function') continue;
      const base = baseFontName(font.lookup(PDFName.of('BaseFont'))?.decodeText?.() || '');
        if (!base || snapshots.has(base)) continue;
      const descriptor = font.lookup(PDFName.of('FontDescriptor'));
      const hasFile = descriptor && typeof descriptor.entries === 'function'
        && [...descriptor.entries()].some(([name]) => /^FontFile/.test(name.decodeText?.() || ''));
      const descendants = font.lookup(PDFName.of('DescendantFonts'));
      if (hasFile || descendants instanceof PDFArray) continue;
      const widths = font.lookup(PDFName.of('Widths'));
      const encoding = encodingSnapshot(font.lookup(PDFName.of('Encoding')));
      snapshots.set(base, {
        baseFont: base,
        subtype: font.lookup(PDFName.of('Subtype'))?.decodeText?.() || 'Type1',
        encoding: encoding.name,
        differences: encoding.differences,
        firstChar: asNumber(font.lookup(PDFName.of('FirstChar'))),
        lastChar: asNumber(font.lookup(PDFName.of('LastChar'))),
        widths: widths ? freeze(widths) : null,
        toUnicode: streamBytes(font.lookup(PDFName.of('ToUnicode'))),
        descriptor: descriptorSnapshot(descriptor),
      });
    }
  }
  return snapshots;
}
class ReferenceFontEmbedder extends StandardFontEmbedder {
  constructor(standardName, baseFont, snapshot) {
    super(standardName, baseFont);
    this.fontName = baseFont;
    this.customName = baseFont;
    this.snapshot = snapshot || null;
    this.nameToByte = new Map();
    for (let code = 0; code <= 0x24f; code += 1) {
      let glyph;
      try { glyph = this.encoding.encodeUnicodeCodePoint(code); } catch { glyph = null; }
      if (glyph?.name && glyph.code != null && !this.nameToByte.has(glyph.name)) this.nameToByte.set(glyph.name, glyph.code);
    }
    const differences = snapshot?.differences?.value || [];
    let next = 0;
    for (const item of differences) {
      if (item?.kind === 'number') next = item.value;
      else if (item?.kind === 'name') {
        this.nameToByte.set(item.value, next);
        next += 1;
      }
    }
  }

  byteFor(char) {
    let glyph;
    try { glyph = this.encoding.encodeUnicodeCodePoint(char.codePointAt(0)); } catch { glyph = null; }
    if (!glyph) return null;
    return this.nameToByte.get(glyph.name) ?? glyph.code ?? null;
  }

  widthOfTextAtSize(text, size) {
    const widths = this.snapshot?.widths?.value;
    const first = this.snapshot?.firstChar ?? 0;
    let total = 0;
    for (const char of text) {
      if (widths) {
        const byte = this.byteFor(char);
        const index = byte == null ? -1 : byte - first;
        const item = index >= 0 && index < widths.length ? widths[index] : null;
        total += item?.value || 0;
      } else {
        let glyph;
        try { glyph = this.encoding.encodeUnicodeCodePoint(char.codePointAt(0)); } catch { glyph = null; }
        total += glyph ? (this.widthOfGlyph(glyph.name) || 0) : 0;
      }
    }
    return (total * size) / 1000;
  }

  encodeText(text) {
    if (!this.snapshot?.differences) return super.encodeText(text);
    const hex = [];
    for (const char of text) {
      const byte = this.byteFor(char) ?? 0;
      hex.push(byte.toString(16).padStart(2, '0'));
    }
    const PDFHexString = require('pdf-lib/cjs/core/objects/PDFHexString.js').default;
    return PDFHexString.of(hex.join(''));
  }

  embedIntoContext(context, ref) {
    const snapshot = this.snapshot;
    const bare = !snapshot || (!snapshot.descriptor && !snapshot.widths && !snapshot.differences && !snapshot.toUnicode);
    if (bare) return super.embedIntoContext(context, ref);
    const dict = {
      Type: 'Font',
      Subtype: snapshot.subtype || 'Type1',
      BaseFont: this.customName,
    };
    if (snapshot.differences) {
      dict.Encoding = context.obj({
        Type: 'Encoding',
        BaseEncoding: snapshot.encoding || 'WinAnsiEncoding',
        Differences: thaw(snapshot.differences),
      });
    } else if (snapshot.encoding) dict.Encoding = snapshot.encoding;
    if (snapshot.widths && snapshot.firstChar != null && snapshot.lastChar != null) {
      dict.FirstChar = snapshot.firstChar;
      dict.LastChar = snapshot.lastChar;
      dict.Widths = thaw(snapshot.widths);
    }
    if (snapshot.descriptor) {
      const fields = { Type: 'FontDescriptor', FontName: this.customName };
      for (const [key, value] of Object.entries(snapshot.descriptor)) {
        if (key === 'Type' || key === 'FontName') continue;
        fields[key] = thaw(value);
      }
      dict.FontDescriptor = context.register(context.obj(fields));
    }
    if (snapshot.toUnicode?.length) dict.ToUnicode = context.flateStream(snapshot.toUnicode);
    const fontDict = context.obj(dict);
    if (ref) {
      context.assign(ref, fontDict);
      return ref;
    }
    return context.register(fontDict);
  }
}

export function embedReferenceFont(doc, fontName, snapshot) {
  const base = baseFontName(fontName);
  const standard = standardFontName(base) || 'Helvetica';
  const embedder = new ReferenceFontEmbedder(standard, base, snapshot);
  const ref = doc.context.nextRef();
  const font = new PDFFont(ref, doc, embedder);
  doc.fonts.push(font);
  return font;
}

