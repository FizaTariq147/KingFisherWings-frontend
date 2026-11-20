/**
 * Resolve invoice-spec dynamic spans with reports/binding-dictionary.csv.
 * Does not write the specs. Missing labels stay unresolved.
 *
 *   node tools/reports/invoice-bindings.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { layoutRepeatingCharges } from './invoice-rows.mjs';
import { amountInWords } from './amount-words.mjs';
import { isAllowlisted } from './allowlist.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function normalizeLabel(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function loadDictionary() {
  const lines = fs.readFileSync(path.join(root, 'reports/binding-dictionary.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
  const rows = new Map();
  for (const line of lines) {
    const [label, binding, family] = line.split(',');
    if (!label || !binding) continue;
    if (!rows.has(label) || family === 'invoice') rows.set(label, binding);
  }
  return rows;
}

const CURRENCY_LABEL = /^(inr|usd|aed|eur|gbp|sgd|vnd|pkr)$/;

export function nearestLabel(span, spans) {
  const left = spans
    .filter((other) => other.role === 'static' && other !== span && Math.abs(other.y - span.y) <= 2 && other.x < span.x)
    .sort((a, b) => (span.x - (a.x + (a.width || 0))) - (span.x - (b.x + (b.width || 0))));
  const moneyCaption = left.find((candidate) => {
    const key = normalizeLabel(candidate.text);
    return /^(total|sub total|subtotal|grand total|vat|tax)\b/.test(key) && !/^total no\b/.test(key);
  });
  const label = moneyCaption || left.find((candidate) => {
    const key = normalizeLabel(candidate.text);
    // Skip punctuation, single letters, and sample values sitting between a label and this cell.
    if (!key || key.length <= 1 || CURRENCY_LABEL.test(key)) return false;
    if (looksLikeSampleValue(candidate.text)) return false;
    return true;
  }) || left[0];
  if (label) return label;
  return spans
    .filter((other) => other.role === 'static' && other !== span && other.y > span.y + 2 && other.x < span.x + span.width && other.x + other.width > span.x)
    .sort((a, b) => (a.y - span.y) - (b.y - span.y))[0] || null;
}

export function bindingForLabel(label, dictionary) {
  const key = normalizeLabel(label);
  if (!key) return '';
  if (dictionary.has(key)) return dictionary.get(key);
  if (key.length >= 4) {
    const matches = [...dictionary.keys()].filter((entry) => entry.startsWith(key));
    if (matches.length === 1) return dictionary.get(matches[0]);
  }
  const generic = new Set(['total', 'amount', 'date', 'type', 'tax', 'gst', 'no']);
  let best = '';
  let bestLength = 0;
  for (const entry of dictionary.keys()) {
    if (entry.length < 4 || generic.has(entry)) continue;
    const hit = key === entry || key.startsWith(`${entry} `) || key.endsWith(` ${entry}`) || key.includes(` ${entry} `);
    if (hit && entry.length > bestLength) {
      best = dictionary.get(entry);
      bestLength = entry.length;
    }
  }
  return best;
}

export function invoiceFamilyCodes() {
  const text = fs.readFileSync(path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts'), 'utf8');
  const codes = [];
  const pattern = /"code": "([^"]+)"([\s\S]*?)"contexts": \[([\s\S]*?)\]/g;
  for (const match of text.matchAll(pattern)) {
    if (/"invoice"/.test(match[3])) codes.push(match[1]);
  }
  return codes;
}

function classicMoney(value) {
  const number = value == null || value === '' ? 0 : Number(value);
  if (!Number.isFinite(number)) return '0.00';
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** Format dates the way the India tax-invoice samples print them (28-JAN-19). */
export function formatReportDate(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (/^\d{1,2}-[A-Za-z]{3}-\d{2,4}$/.test(raw)) return raw.toUpperCase();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return raw;
  const day = match[3];
  const month = MONTHS[Number(match[2]) - 1];
  const year = match[1].slice(2);
  if (!month) return raw;
  return `${day}-${month}-${year}`;
}

function looksLikeSampleValue(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw || raw.length <= 2) return false;
  if (/^[:.;,|/\\-]+$/.test(raw)) return false;
  const key = normalizeLabel(raw);
  if (/^(bill to|shipper|consignee|invoice no|invoice no date|due date|tax invoice|amount|total|qty|currency|phone|gstin no)$/.test(key)) return false;
  if (/\bno\s*\/?\s*date\b/.test(key) && !/\d/.test(raw)) return false;
  if (isNumericText(raw)) return true;
  if (/^\d{1,2}[/-][A-Za-z]{3}[/-]\d{2,4}$/.test(raw)) return true;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return true;
  if (/^[A-Z0-9][A-Z0-9 /&.,'-]{5,}$/i.test(raw) && /[A-Za-z]{3}/.test(raw) && /\d/.test(raw)) return true;
  if (/^[A-Z0-9][A-Z0-9 /&.,'-]{8,}$/i.test(raw) && /(?:PVT|LTD|LLC|INC|CO\.|COMPANY|LOGISTICS|TRADING)/i.test(raw)) return true;
  return false;
}

function headerScore(text) {
  const key = normalizeLabel(text);
  if (!key || key.length <= 1) return -1;
  if (/^(amount|%|t|inr)$/.test(key)) return 0;
  if (/\b(non|taxable|axable|sgst|cgst|igst|ugst|fcy|total)\b/.test(key)) return 10 + key.length;
  return key.length;
}

function headerAbove(span, spans) {
  const candidates = spans.filter((other) => {
    if (other.role !== 'static' || other.y <= span.y + 2 || other.y > span.y + 140) return false;
    const left = other.x;
    const right = other.x + (other.width || 0);
    return left < span.x + (span.width || 0) + 14 && right > span.x - 14;
  });
  candidates.sort((a, b) => {
    const center = span.x + (span.width || 0) / 2;
    const distance = (item) => Math.abs(item.x + (item.width || 0) / 2 - center);
    return headerScore(b.text) - headerScore(a.text) || (a.y - span.y) - (b.y - span.y) || distance(a) - distance(b);
  });
  return candidates[0] || null;
}

/** Prefer the field label left of a same-row colon (Job No. : value). */
function colonLabel(span, spans) {
  const colon = spans
    .filter((other) => other.role === 'static' && Math.abs(other.y - span.y) <= 2 && String(other.text || '').trim() === ':' && other.x < span.x)
    .sort((a, b) => (span.x - a.x) - (span.x - b.x))[0];
  if (!colon) return null;
  const parts = spans
    .filter((other) => (
      other.role === 'static'
      && Math.abs(other.y - span.y) <= 2
      && other.x < colon.x
      && colon.x - other.x < 130
      && !looksLikeSampleValue(other.text)
      && !/^(ami|td|o)$/i.test(String(other.text || '').trim())
    ))
    .sort((a, b) => a.x - b.x);
  if (!parts.length) return null;
  return { ...parts[0], text: parts.map((part) => part.text).join(' ') };
}

function labelForSpan(span, spans) {
  const colon = colonLabel(span, spans);
  if (colon) return colon;
  const near = nearestLabel(span, spans);
  const nearKey = normalizeLabel(near?.text || '');
  if (nearKey && nearKey.length > 1 && !/^(amount|total|qty|quantity|currency|curr)$/.test(nearKey) && !looksLikeSampleValue(near?.text) && !/rupee|only$/i.test(nearKey)) {
    return near;
  }
  const above = headerAbove(span, spans);
  if (!above) return near;
  const aboveKey = normalizeLabel(above.text);
  if (aboveKey === 'axable' || aboveKey === 'taxable') {
    const non = spans.find((other) => (
      other.role === 'static'
      && normalizeLabel(other.text) === 'non'
      && Math.abs(other.y - above.y) <= 14
      && other.x <= above.x
      && above.x - other.x < 45
    ));
    return { ...above, text: non ? 'Non Taxable Amount' : 'Taxable Amount' };
  }
  return above;
}

function lineAmount(line) {
  if (line?.line_total != null && Number.isFinite(Number(line.line_total))) return Number(line.line_total);
  const qty = Number(line?.quantity ?? 0);
  const price = Number(line?.unit_price ?? 0);
  const tax = Number(line?.tax_amount ?? 0);
  return qty * price + tax;
}

function isNumericText(text) {
  return /^-?[\d,]+(\.\d+)?$/.test(String(text || '').trim());
}

export function aliasBinding(key) {
  if (!key) return '';
  if (/\bsgst\b/.test(key) && /%/.test(key)) return 'invoice.sgstRate';
  if (/\bcgst\b/.test(key) && /%/.test(key)) return 'invoice.cgstRate';
  if (/\b(igst|ugst)\b/.test(key) && /%/.test(key)) return 'invoice.igstRate';
  if (/\bsgst\b/.test(key)) return 'invoice.sgstTotal';
  if (/\bcgst\b/.test(key)) return 'invoice.cgstTotal';
  if (/\b(igst|ugst)\b/.test(key)) return 'invoice.igstTotal';
  if (key === 'non' || /\bnon\s*taxable\b/.test(key) || key.includes('nontaxable')) return 'invoice.nonTaxable';
  if (key === 'subtotal' || key.startsWith('subtotal') || key.startsWith('sub total')) return 'invoice.amount';
  if (key === 'taxable' || key === 'axable' || key.startsWith('taxable')) return 'invoice.amount';
  if (key === 'vat' || key.startsWith('vat ') || key === 'tax' || key === 'gst') return 'invoice.tax';
  if (key === 'total' || key === 'grand total' || key.startsWith('grand total') || key === 'total amount' || key === 'total amount inr' || key.startsWith('total amount')) return 'invoice.total';
  if (key === 'bill to' || key.startsWith('bill to')) return 'party.billTo';
  if (key.includes('gstin')) return 'party.gstin';
  if (key === 'phone' || key.startsWith('phone ')) return 'party.phone';
  if (key === 'shipper' || key.startsWith('shipper')) return 'party.shipper';
  if (key === 'consignee' || key.startsWith('consignee')) return 'party.consignee';
  if (key === 'vessel' || key.startsWith('vessel') || key.includes('vessel voyage')) return 'shipment.vesselVoyage';
  if (key.startsWith('container')) return 'cargo.containerNo';
  if (key === 'type' || key.includes('container type')) return 'cargo.containerType';
  if (key.includes('no of pcs') || key.includes('packages')) return 'cargo.pieces';
  if (key.includes('gross weight')) return 'cargo.grossWeight';
  if (key === 'volume' || key.startsWith('volume ')) return 'cargo.measurement';
  if (key === 'hbl' || key.startsWith('hbl ')) return 'shipment.hbl';
  if (key.startsWith('shipment')) return 'shipment.number';
  if (key.startsWith('reference') || key === 'ref' || key.startsWith('ref no')) return 'shipment.reference';
  if (key.includes('voyage') || key.includes('flight')) return 'shipment.voyage';
  if (key.includes('inco')) return 'job.incoterms';
  if (key.includes('p o') || key.includes('po no') || key.includes('lpo')) return 'invoice.lpo';
  if (key === 'balance' || key.startsWith('balance ')) return 'invoice.outstanding';
  if (key.includes('due date')) return 'invoice.dueDate';
  if (key.includes('invoice no') && key.includes('date')) return 'invoice.numberDate';
  if (key.startsWith('invoice no') || key === 'invoice number') return 'invoice.number';
  if (key.includes('department')) return 'job.department';
  if (key.includes('job no')) return 'job.numberDate';
  if (key.includes('place of receipt')) return 'shipment.placeOfReceipt';
  if (key.includes('place of delivery')) return 'shipment.placeOfDelivery';
  if (key === 'por' || key.startsWith('por ')) return 'shipment.por';
  if (key === 'pol' || key.startsWith('pol ')) return 'shipment.pol';
  if (key === 'pod' || key.startsWith('pod ')) return 'shipment.pod';
  if (key === 'etd' || key.startsWith('etd ')) return 'shipment.etd';
  if (key === 'eta' || key.startsWith('eta ')) return 'shipment.eta';
  if (key.includes('place of origin') || key === 'origin') return 'shipment.pol';
  if ((key.includes('hawb') || key.includes('hbl')) && (key.includes('mawb') || key.includes('mbl'))) return 'shipment.transportDocs';
  if ((/\b(hbl|hawb)\b/.test(key) && /\bwb\b/.test(key)) || key.includes('hawb') && key.includes('hbl')) return 'shipment.houseDoc';
  if ((/\b(mbl|mawb)\b/.test(key) && /\bwb\b/.test(key)) || key.includes('mawb') || (key.includes('mbl') && !/\bhbl\b/.test(key))) return 'shipment.masterDoc';
  if (key.startsWith('igm')) return 'shipment.igm';
  if (key.startsWith('narration')) return 'invoice.narration';
  if (key.startsWith('remark')) return 'invoice.remarks';
  if (key.startsWith('qty') || key.startsWith('quantity')) return 'invoice.lines.quantity';
  if (key.includes('ex rate') || key === 'exrate' || key === 'ex rate') return 'invoice.exchangeRate';
  if (key === 'rate' || key.startsWith('rate ') || key.includes('amount qty')) return 'invoice.lines.rate';
  if (key === 'currency' || key.startsWith('currency ')) return 'invoice.currencyRate';
  if (key === 'sac' || key.startsWith('sac ')) return 'invoice.lines.sac';
  if (key.includes('beneficiary')) return 'bank.beneficiary';
  if (key === 'bank' || key.startsWith('bank ')) return 'bank.name';
  if (key.includes('a c no') || key.includes('ac no') || key.includes('account no')) return 'bank.account';
  if (key.includes('iban')) return 'bank.iban';
  if (key.includes('swift')) return 'bank.swift';
  if (key === 'address' || key.startsWith('address ')) return 'bank.address';
  if (key.includes('created by') || key === 'user') return 'session.createdBy';
  if (key.includes('print') && key.includes('time')) return 'session.printedAt';
  if (key.includes('amount in words') || key.includes('rupee') || /only$/.test(key)) return 'invoice.amountWords';
  if (key.includes('powered by')) return '';
  return '';
}

function pathValues(record) {
  const org = record.organization || {};
  const invoice = record.invoice || {};
  const job = record.job || {};
  const party = record.party || {};
  const fcl = job.sea_fcl_details || {};
  const lcl = job.sea_lcl_details || {};
  const sea = job.sea_fcl_details || job.sea_lcl_details || {};
  const air = job.air_details || {};
  const ship = invoice.shipment || {};
  const bl = (job.bills_of_lading || []).find((item) => item) || {};
  const booking = job.sea_fcl_booking_form || job.sea_lcl_booking_form || {};
  const text = (value) => (value == null ? '' : String(value).trim());
  const firstText = (...values) => {
    for (const value of values) {
      const cleaned = text(value);
      if (cleaned) return cleaned;
    }
    return '';
  };
  const bank = record.bank || org.default_bank || org.bank || {};
  const session = record.session || {};
  const containers = []
    .concat(job.containers || [], fcl.containers || [], lcl.containers || [])
    .filter((item) => item && typeof item === 'object');
  const containerNumbers = [...new Set(
    [text(job.primary_container_number)]
      .concat(containers.map((item) => text(item.container_number)))
      .filter(Boolean),
  )];
  const firstContainer = containers[0] || {};
  const vessel = firstText(job.vessel_name, fcl.vessel_name, lcl.vessel_name, ship.vessel_name, ship.vessel_flight, bl.vessel_name);
  const voyage = firstText(job.voyage_number, fcl.voyage_number, lcl.voyage_number, ship.voyage_number, ship.flight_number, air.flight_number, booking.voyage_ref, bl.voyage_number);
  const exchange = invoice.exchange_rate == null || invoice.exchange_rate === '' ? '' : String(invoice.exchange_rate);
  const hbl = firstText(
    fcl.hbl_number,
    lcl.hbl_number,
    fcl.hbl_number_from_agent,
    lcl.hbl_number_from_agent,
    ship.hbl_number,
    air.hawb_number,
    ship.hawb_number,
  );
  const hawb = firstText(air.hawb_number, ship.hawb_number);
  const mbl = firstText(fcl.mbl_number, lcl.mbl_number, ship.mbl_number, ship.bl_awb, bl.bl_number);
  const mawb = firstText(air.mawb_number, ship.mawb_number);
  const jobNumber = text(invoice.job_number) || text(job.job_number);
  const jobDate = formatReportDate(job.job_date || invoice.invoice_date);
  const line0 = invoice.lines?.[0] || {};
  return {
    'company.name': text(org.display_name) || text(org.name),
    'company.address': [org.address, org.city, org.country_code].map(text).filter(Boolean).join(', '),
    'company.phone': text(org.phone),
    'company.email': text(org.email),
    'company.gstin': text(org.vat_number) || text(org.gstin),
    'company.pan': text(org.pan) || text(org.cr_number),
    'party.billTo': text(invoice.party_name) || text(party.name),
    'party.address': [party.address, party.city, party.country_code || party.country].map(text).filter(Boolean).join(', '),
    'party.phone': firstText(party.phone, invoice.party_phone),
    'party.gstin': firstText(party.vat_number, party.gstin, invoice.party_gstin),
    'party.shipper': firstText(job.shipper_name, job.shipper?.name),
    'party.consignee': firstText(job.consignee_name, job.consignee?.name),
    'party.notify': '',
    'job.number': jobNumber,
    'job.numberDate': jobNumber && jobDate ? `${jobNumber} / ${jobDate}` : jobNumber || jobDate,
    'invoice.number': text(invoice.invoice_number),
    'invoice.date': formatReportDate(invoice.invoice_date),
    'invoice.numberDate': (() => {
      const number = text(invoice.invoice_number);
      const date = formatReportDate(invoice.invoice_date);
      const status = text(invoice.status);
      if (number && date && status) return `${number} / ${date} (${status})`;
      if (number && date) return `${number} / ${date}`;
      return number || date;
    })(),
    'invoice.currency': text(invoice.currency_code),
    'invoice.currencyRate': (() => {
      const code = text(invoice.currency_code);
      if (!code) return '';
      if (!exchange) return code;
      const rate = Number(exchange);
      return Number.isFinite(rate) ? `${code} ${rate.toFixed(6)}` : `${code} ${exchange}`;
    })(),
    'invoice.exchangeRate': (() => {
      if (!exchange) return '';
      const rate = Number(exchange);
      return Number.isFinite(rate) ? rate.toFixed(5) : exchange;
    })(),
    'invoice.amount': classicMoney(invoice.subtotal ?? 0),
    'invoice.nonTaxable': invoice.non_taxable_amount == null || invoice.non_taxable_amount === ''
      ? ''
      : classicMoney(invoice.non_taxable_amount),
    'invoice.tax': classicMoney(invoice.tax_total ?? 0),
    'invoice.total': classicMoney(invoice.total_amount ?? (Number(invoice.subtotal ?? 0) + Number(invoice.tax_total ?? 0))),
    'shipment.mawb': mawb,
    'shipment.hawb': hawb,
    'shipment.hbl': hbl,
    'shipment.mbl': mbl,
    'shipment.houseDoc': (() => {
      const doc = hbl || hawb;
      const date = formatReportDate(ship.hbl_date || ship.hawb_date || bl.bl_date);
      return doc && date ? `${doc} / ${date}` : doc;
    })(),
    'shipment.masterDoc': (() => {
      const doc = mbl || mawb;
      const date = formatReportDate(ship.mbl_date || ship.mawb_date);
      return doc && date ? `${doc} / ${date}` : doc;
    })(),
    'shipment.transportDocs': [...new Set([mbl, mawb, hbl, hawb].filter(Boolean))].join(' / '),
    'shipment.pol': text(job.origin_port_code) || text(sea.pol_code) || text(ship.pol),
    'shipment.pod': text(job.dest_port_code) || text(sea.pod_code) || text(ship.pod),
    'shipment.por': text(sea.por_code) || text(ship.por) || text(job.origin_port_code),
    'shipment.placeOfReceipt': text(sea.place_of_receipt) || text(ship.place_of_receipt),
    'shipment.placeOfDelivery': text(sea.place_of_delivery) || text(ship.place_of_delivery),
    'shipment.finalDestination': text(job.dest_door_address),
    'shipment.vessel': vessel,
    'shipment.voyage': voyage,
    'shipment.vesselVoyage': vessel && voyage ? `${vessel} / ${voyage}` : vessel || voyage,
    'shipment.etd': formatReportDate(job.etd || sea.etd),
    'shipment.eta': formatReportDate(job.eta || sea.eta),
    'shipment.carrier': text(sea.shipping_line_name),
    'shipment.freightTerms': text(sea.freight_terms),
    'shipment.serviceType': text(job.service_scope),
    'cargo.description': text(job.commodity_description) || text(job.commodity),
    'cargo.marks': text(job.cargo?.[0]?.marks_numbers),
    'cargo.pieces': firstText(
      firstContainer.packages != null ? `${firstContainer.packages} PACKAGES` : '',
      firstContainer.no_of_packages != null ? `${firstContainer.no_of_packages} PACKAGES` : '',
      job.pieces == null ? '' : String(job.pieces),
    ),
    'cargo.grossWeight': firstText(
      firstContainer.gross_weight != null ? String(firstContainer.gross_weight) : '',
      job.gross_weight == null ? '' : String(job.gross_weight),
    ),
    'cargo.netWeight': '',
    'cargo.measurement': firstText(
      firstContainer.cbm != null ? String(firstContainer.cbm) : '',
      firstContainer.volume != null ? String(firstContainer.volume) : '',
      job.volume_cbm == null ? '' : String(job.volume_cbm),
    ),
    'cargo.containerNo': containerNumbers.join(', '),
    'shipment.number': (() => {
      const number = text(job.shipment_number) || text(ship.shipment_number);
      const date = formatReportDate(job.shipment_date || ship.shipment_date);
      return number && date ? `${number} / ${date}` : number;
    })(),
    'shipment.reference': (() => {
      const number = text(job.client_reference_no) || text(job.reference_no) || text(ship.reference_no);
      const date = formatReportDate(job.reference_date || ship.reference_date);
      return number && date ? `${number} / ${date}` : number;
    })(),
    'shipment.igm': (() => {
      const number = text(ship.igm_number) || text(job.igm_number);
      const date = formatReportDate(ship.igm_date || job.igm_date);
      return number && date ? `${number} / ${date}` : number;
    })(),
    'invoice.narration': text(invoice.narration),
    'invoice.remarks': text(invoice.remarks),
    'invoice.dueDate': formatReportDate(invoice.due_date),
    'invoice.lpo': text(invoice.lpo_number),
    'invoice.outstanding': invoice.outstanding_balance == null ? '' : classicMoney(invoice.outstanding_balance),
    'job.incoterms': text(job.incoterms),
    'job.department': text(job.department_name),
    'invoice.amountWords': amountInWords(invoice.total_amount ?? (Number(invoice.subtotal ?? 0) + Number(invoice.tax_total ?? 0)), invoice.currency_code),
    'invoice.lines.quantity': line0.quantity == null ? '' : String(line0.quantity),
    'invoice.lines.rate': line0.unit_price == null || line0.unit_price === '' ? '' : classicMoney(line0.unit_price),
    'invoice.lines.sac': text(line0.sac_code) || text(line0.sac),
    'invoice.sgstTotal': (() => {
      const rows = invoice.lines || [];
      if (!rows.some((line) => line.sgst_amount != null && line.sgst_amount !== '')) return '';
      return classicMoney(rows.reduce((sum, line) => sum + Number(line.sgst_amount || 0), 0));
    })(),
    'invoice.cgstTotal': (() => {
      const rows = invoice.lines || [];
      if (!rows.some((line) => line.cgst_amount != null && line.cgst_amount !== '')) return '';
      return classicMoney(rows.reduce((sum, line) => sum + Number(line.cgst_amount || 0), 0));
    })(),
    'invoice.igstTotal': (() => {
      const rows = invoice.lines || [];
      if (!rows.some((line) => line.igst_amount != null && line.igst_amount !== '')) return '';
      return classicMoney(rows.reduce((sum, line) => sum + Number(line.igst_amount || 0), 0));
    })(),
    'invoice.sgstRate': line0.sgst_rate == null || line0.sgst_rate === '' ? '' : Number(line0.sgst_rate).toFixed(2),
    'invoice.cgstRate': line0.cgst_rate == null || line0.cgst_rate === '' ? '' : Number(line0.cgst_rate).toFixed(2),
    'invoice.igstRate': line0.igst_rate == null || line0.igst_rate === '' ? '' : Number(line0.igst_rate).toFixed(2),
    'cargo.containerType': text(firstContainer.container_type_code) || text(firstContainer.type) || text(job.containers?.[0]?.container_type_code),
    'cargo.sealNo': text(firstContainer.seal_number) || text(job.containers?.[0]?.seal_number),
    'bank.beneficiary': text(bank.account_name) || text(bank.beneficiary_name) || text(org.display_name) || text(org.name),
    'bank.name': text(bank.bank_name),
    'bank.account': text(bank.account_number),
    'bank.iban': text(bank.iban),
    'bank.swift': text(bank.swift_code) || text(bank.swift),
    'bank.address': text(bank.address) || text(bank.branch_address) || [org.city, org.country_code].map(text).filter(Boolean).join(', '),
    'session.createdBy': text(session.createdBy) || text(invoice.created_by_email) || text(invoice.created_by_name) || text(invoice.created_by),
    'session.printedAt': text(session.printedAt),
  };
}

const NO_SOURCE = new Set(['party.notify', 'cargo.netWeight']);

/** Paint org address into the sample company-address static slots without changing the spec. */
function fillOrganizationHeader(values, spans, organization) {
  if (!organization) return;
  const address = String(organization.address || '').trim();
  const website = String(organization.website || '').trim();
  if (!address && !website) return;
  const lines = address.split(/\s*,\s*/).filter(Boolean);
  const header = spans.filter((span) => span.y > 775 && span.x > 440);
  let addressIndex = 0;
  for (const span of header) {
    const demo = String(span.text || '').trim();
    if (span.role === 'branding') continue;
    if (/^WEB\b/i.test(demo)) continue;
    if (/\.fresatechnologies\.com|www\./i.test(demo) && website) {
      values[span.id] = website;
      continue;
    }
    if (!address) continue;
    if (/Chennai|Tamil|Nadu|India|600\s*100/i.test(demo) || (/^\d/.test(demo) && demo.length >= 8)) {
      values[span.id] = lines[addressIndex] || (addressIndex === 0 ? address : '');
      addressIndex += 1;
    } else if (/^[A-Za-z]$/.test(demo)) {
      values[span.id] = '';
    }
  }
}

/** Split party address across the Bill To address sample lines. */
function fillPartyAddressLines(values, blanks, spans, byPath) {
  const address = String(byPath['party.address'] || '').trim();
  const billToBand = spans.filter((span) => (
    span.role === 'dynamic'
    && span.x > 120 && span.x < 280
    && span.y > 700 && span.y < 740
    && /DBS|ROAD|NUNGAMBAKKAM|CHENNAI|INDIA|TAMIL|LNADU|,/.test(String(span.text || ''))
  )).sort((a, b) => b.y - a.y);
  if (!billToBand.length) return;
  if (!address) {
    for (const span of billToBand) {
      if (values[span.id] != null) continue;
      values[span.id] = '';
      blanks.push({ span: span.id, label: 'Bill To address', binding: 'party.address', why: 'empty in the record' });
    }
    return;
  }
  const chunks = address.split(/\s*,\s*/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const chunk of chunks) {
    const next = current ? `${current}, ${chunk}` : chunk;
    if (next.length > 36 && current) {
      lines.push(current);
      current = chunk;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  billToBand.forEach((span, index) => {
    values[span.id] = lines[index] || (index === 0 ? address : '');
  });
}

function taxModeFor(code) {
  try {
    const table = JSON.parse(fs.readFileSync(path.join(root, 'reports/invoice-v2-applicability.json'), 'utf8'));
    return table[code]?.taxMode === 'split' ? 'split' : 'single';
  } catch {
    return 'single';
  }
}

/**
 * Fill one invoice spec from a record. Totals and line amounts use the same
 * numbers the classic PDF prints. Split GST cells stay empty.
 */
export function fillInvoiceSpans(spec, record) {
  const dictionary = loadDictionary();
  const byPath = pathValues(record);
  const values = {};
  const blanks = [];
  const invoice = record.invoice || {};
  const lines = invoice.lines || [];
  const subtotal = classicMoney(invoice.subtotal ?? 0);
  const tax = classicMoney(invoice.tax_total ?? 0);
  const total = byPath['invoice.total'];
  const laid = layoutRepeatingCharges(spec, record);
  Object.assign(values, laid.values);
  blanks.push(...laid.blanks);
  const pages = spec.pages?.length ? spec.pages : [spec];

  for (const page of pages) {
    const spans = page.spans || [];
    const dynamic = spans.filter((span) => span.role === 'dynamic');
    const rows = [];
    for (const span of dynamic) {
      const row = rows.find((item) => Math.abs(item.y - span.y) <= 3);
      if (row) row.spans.push(span);
      else rows.push({ y: span.y, spans: [span] });
    }
    const chargeRows = rows.filter((row) => {
      const numeric = row.spans.filter((span) => isNumericText(span.text));
      if (numeric.length < 4) return false;
      const keys = row.spans.map((span) => normalizeLabel(nearestLabel(span, spans)?.text || '')).join(' ');
      return !/\b(sgst|cgst|igst)\b/.test(keys);
    }).sort((a, b) => b.y - a.y);

    if (!laid.values || !Object.keys(laid.values).length) {
      chargeRows.forEach((row, index) => {
        const right = row.spans.slice().sort((a, b) => b.x - a.x)[0];
        const line = lines[index];
        if (!line) {
          blanks.push({ span: right.id, label: 'line amount', binding: 'invoice.lines', why: 'empty in the record' });
          return;
        }
        values[right.id] = classicMoney(lineAmount(line));
        const caption = nearestLabel(right, spans);
        if (caption?.role === 'static' && String(line.description || line.charge_code || '').trim()) {
          values[caption.id] = String(line.description || line.charge_code);
        }
        for (const span of row.spans) {
          if (span.id === right.id) continue;
          values[span.id] = '';
          const side = nearestLabel(span, spans);
          blanks.push({ span: span.id, label: side?.text || 'charge column', binding: '', why: 'no source' });
        }
      });
      if (lines.length > chargeRows.length) {
        for (let index = chargeRows.length; index < lines.length; index += 1) {
          blanks.push({
            span: `line-${index + 1}`,
            label: lines[index].description || 'line amount',
            binding: 'invoice.lines',
            why: 'no source',
          });
        }
      }
    }
    const totalRows = rows.filter((row) => {
      const keys = row.spans.map((span) => normalizeLabel(nearestLabel(span, spans)?.text || '')).join(' ');
      return /\b(sgst|cgst|igst)\b/.test(keys);
    });
    for (const row of totalRows) {
      const numeric = row.spans.filter((span) => isNumericText(span.text)).sort((a, b) => a.x - b.x);
      const right = numeric[numeric.length - 1];
      if (right && total) values[right.id] = total;
    }

    for (const span of dynamic) {
      if (values[span.id] != null) continue;
      const label = labelForSpan(span, spans);
      const key = normalizeLabel(label?.text || '');
      const taxModeEarly = taxModeFor(spec.code);
      if (taxModeEarly === 'single' && /\b(sgst|cgst|igst)\b/.test(key)) {
        blanks.push({ span: span.id, label: label?.text || '', binding: '', why: 'no source' });
        values[span.id] = '';
        continue;
      }
      let binding = aliasBinding(key) || bindingForLabel(label?.text || '', dictionary);
      const demo = String(span.text || '').trim();
      // Top-corner print stamp in the Format 1 sample.
      if (!binding && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(demo) && span.y > 800) {
        binding = 'session.printedAt';
      }
      // Currency row keeps INR static and paints only the exchange rate beside it.
      if (binding === 'invoice.currencyRate' && /^\d+\.\d{4,}$/.test(demo)) {
        binding = 'invoice.exchangeRate';
      }
      // Grand total sits to the right of the amount-in-words sample line.
      if (!binding && /^[\d,]+\.\d{2}$/.test(demo) && /rupee|only/i.test(String(label?.text || ''))) {
        binding = 'invoice.total';
      }
      if (!binding && /^[\d,]+\.\d{2}$/.test(demo)) {
        const words = spans.find((other) => (
          other.role === 'static'
          && Math.abs(other.y - span.y) <= 2
          && other.x < span.x
          && /rupee|only$/i.test(String(other.text || ''))
        ));
        if (words) binding = 'invoice.total';
      }
      if (!binding) {
        blanks.push({ span: span.id, label: label?.text || '', binding: '', why: 'no source' });
        values[span.id] = '';
        continue;
      }
      if (!(binding in byPath)) {
        blanks.push({ span: span.id, label: label?.text || '', binding, why: 'wrong path' });
        values[span.id] = '';
        continue;
      }
      if (NO_SOURCE.has(binding)) {
        blanks.push({ span: span.id, label: label?.text || '', binding, why: 'no source' });
        values[span.id] = '';
        continue;
      }
      if (binding === 'invoice.amount') {
        values[span.id] = subtotal;
        continue;
      }
      if (binding === 'invoice.tax') {
        values[span.id] = tax;
        continue;
      }
      if (binding === 'invoice.total') {
        values[span.id] = total;
        continue;
      }
      if (binding === 'invoice.exchangeRate') {
        const rate = Number(invoice.exchange_rate);
        if (!Number.isFinite(rate)) {
          blanks.push({ span: span.id, label: label?.text || 'Currency', binding, why: 'empty in the record' });
          values[span.id] = '';
          continue;
        }
        const decimals = (demo.split('.')[1] || '').length;
        values[span.id] = rate.toFixed(decimals >= 4 ? decimals : 5);
        continue;
      }
      const text = byPath[binding];
      if (!String(text || '').trim()) {
        blanks.push({ span: span.id, label: label?.text || '', binding, why: 'empty in the record' });
        values[span.id] = '';
        continue;
      }
      values[span.id] = String(text);
    }

    fillPartyAddressLines(values, blanks, spans, byPath);
    for (let i = blanks.length - 1; i >= 0; i -= 1) {
      if (String(values[blanks[i].span] || '').trim()) blanks.splice(i, 1);
    }

    const taxMode = taxModeFor(spec.code);
    for (const span of spans) {
      const own = normalizeLabel(span.text);
      const label = labelForSpan(span, spans);
      const key = normalizeLabel(label?.text || '');
      if (taxMode === 'single' && (/\b(sgst|cgst|igst)\b/.test(own) || /\b(sgst|cgst|igst)\b/.test(key))) {
        values[span.id] = '';
        if (span.role === 'dynamic') blanks.push({ span: span.id, label: span.text || label?.text || '', binding: '', why: 'no source' });
        continue;
      }
      if (span.role === 'dynamic' || values[span.id] != null) continue;
      const demo = String(span.text || '').trim();
      if (/^GSTIN No\.\s*:/i.test(demo)) {
        const gstin = byPath['party.gstin'];
        values[span.id] = gstin ? `GSTIN No. : ${gstin}` : '';
        if (!gstin) blanks.push({ span: span.id, label: 'GSTIN No.', binding: 'party.gstin', why: 'empty in the record' });
        continue;
      }
      if (/^Beneficiary Name\s*:/i.test(demo)) {
        const name = byPath['bank.beneficiary'];
        values[span.id] = name ? `Beneficiary Name: ${name}` : '';
        continue;
      }
      if (/^:\s*[A-Z0-9]/.test(demo) && /\bbank\b/.test(key)) {
        const name = byPath['bank.name'];
        values[span.id] = name ? `: ${name}` : '';
        continue;
      }
      if (/^Phone\s*:/i.test(demo)) {
        const phone = byPath['party.phone'];
        values[span.id] = phone ? `Phone : ${phone}` : '';
        continue;
      }
      if (!looksLikeSampleValue(span.text) && !/^(INMAA|AEJEA|CHENNAI|JEBEL|MSC |HDFC|CFR|REFE )/i.test(demo)) continue;
      if (isAllowlisted(span.text)) {
        if (/rupee|fils|paise|dollars/i.test(span.text || '') && byPath['invoice.amountWords']) {
          values[span.id] = byPath['invoice.amountWords'];
        }
        continue;
      }
      if (/rupee|fils|paise|dollars|only$/i.test(span.text || '') && byPath['invoice.amountWords']) {
        values[span.id] = byPath['invoice.amountWords'];
        continue;
      }
      let binding = aliasBinding(key) || bindingForLabel(label?.text || '', dictionary);
      if (!binding && /^(INMAA|AEJEA)$/i.test(demo)) {
        const left = spans.filter((other) => other.role === 'static' && Math.abs(other.y - span.y) <= 2 && other.x < span.x)
          .sort((a, b) => (span.x - (a.x + (a.width || 0))) - (span.x - (b.x + (b.width || 0))));
        const portLabel = left.find((item) => /^(POR|POL|POD)$/i.test(String(item.text || '').trim()));
        binding = aliasBinding(normalizeLabel(portLabel?.text || ''));
      }
      if (!binding && /^JEBEL|^CHENNAI/i.test(demo)) binding = /JEBEL/i.test(demo) ? 'shipment.placeOfDelivery' : 'shipment.placeOfReceipt';
      if (!binding && /^MSC /i.test(demo)) binding = 'shipment.vesselVoyage';
      if (!binding && /^:\s*HDFC/i.test(demo)) binding = 'bank.name';
      if (!binding) continue;
      if (NO_SOURCE.has(binding)) {
        blanks.push({ span: span.id, label: label?.text || '', binding, why: 'no source' });
        values[span.id] = '';
        continue;
      }
      const filled = byPath[binding];
      if (!String(filled || '').trim()) {
        blanks.push({ span: span.id, label: label?.text || '', binding, why: 'empty in the record' });
        values[span.id] = '';
        continue;
      }
      values[span.id] = binding === 'bank.name' && /^:/.test(demo) ? `: ${filled}` : String(filled);
    }
  }

  for (const page of pages) {
    fillOrganizationHeader(values, page.spans || [], record.organization);
    for (const span of page.spans || []) {
      const value = values[span.id];
      if (!value || !/^[\d,]+\.\d{2}$/.test(String(value))) continue;
      const needed = String(value).length * (span.size || 7) * 0.56;
      if ((span.width || 0) >= needed) continue;
      const width = Math.min(needed, 150);
      span.width = width;
      if (span.x + width > 583) span.x = Math.max(28, 583 - width);
    }
  }

  return {
    values,
    blanks,
    totals: { subtotal, tax, total, lines: lines.map((line) => classicMoney(lineAmount(line))) },
  };
}

function csv(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function main() {
  const dictionary = loadDictionary();
  const codes = invoiceFamilyCodes();
  const rows = [['code', 'span', 'label', 'proposed_binding']];
  let dynamic = 0;
  let resolved = 0;
  const missingSpec = [];
  for (const code of codes) {
    const specPath = path.join(root, 'reports/specs', `${code}.json`);
    if (!fs.existsSync(specPath)) {
      missingSpec.push(code);
      continue;
    }
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
    const pages = spec.pages?.length ? spec.pages : [spec];
    for (const page of pages) {
      for (const span of page.spans || []) {
        if (span.role !== 'dynamic') continue;
        dynamic += 1;
        const label = nearestLabel(span, page.spans || []);
        const binding = bindingForLabel(label?.text || '', dictionary);
        if (binding) {
          resolved += 1;
          continue;
        }
        rows.push([code, span.id, label?.text || '', ''].map(csv).join(','));
      }
    }
  }
  const out = path.join(root, 'reports/invoice-unresolved.csv');
  fs.writeFileSync(out, `${rows.join('\n')}\n`);
  console.log(JSON.stringify({
    family: codes.length,
    withSpec: codes.length - missingSpec.length,
    missingSpec: missingSpec.length,
    dynamic,
    resolved,
    unresolved: rows.length - 1,
  }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
