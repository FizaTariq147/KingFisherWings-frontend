import type { InvoiceFormatUiDemo, InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import {
  reportFieldOrNa,
  type InvoiceFormatPdfData,
} from './invoiceFormatToInvoicePdfModel';
import { formatReportLayoutDate } from './formatReportLayoutDate';

type Kv = { k: string; v: string };

function overlayKvRows(
  rows: Kv[] | undefined,
  rules: Array<{ test: RegExp; value: string }>,
): Kv[] | undefined {
  if (!rows?.length) return rows;
  return rows.map((row) => {
    for (const rule of rules) {
      if (rule.test.test(row.k)) return { ...row, v: rule.value };
    }
    return row;
  });
}

/** When entity-bound, wipe every value so only live overlays remain (no leftover demo). */
function clearKvValues(rows: Kv[] | undefined): Kv[] | undefined {
  if (!rows?.length) return rows;
  return rows.map((row) => ({ ...row, v: '' }));
}

function clearPartyLines(
  block: { title: string; lines: string[] } | undefined,
): { title: string; lines: string[] } | undefined {
  if (!block) return block;
  return { ...block, lines: block.lines.map(() => '') };
}

function liveOrEmpty(raw: string | null | undefined): string {
  return String(raw ?? '').trim();
}

function buildMetaRules(data: InvoiceFormatPdfData): Array<{ test: RegExp; value: string }> {
  const rules: Array<{ test: RegExp; value: string }> = [];
  const pick = (raw: string | undefined) => liveOrEmpty(raw);

  const docNo = pick(data.invoiceNumber);
  const quoteNo = pick(data.quotationNumber);
  const jobNo = pick(data.jobNumber);
  const shipNo = pick(data.shipmentNumber);
  const invDate = pick(formatReportLayoutDate(data.invoiceDate));
  const due = pick(formatReportLayoutDate(data.dueDate || data.validUntil));
  const valid = pick(formatReportLayoutDate(data.validUntil || data.dueDate));
  const etd = pick(formatReportLayoutDate(data.etd));
  const eta = pick(formatReportLayoutDate(data.eta));
  const ref = pick(data.referenceNo);
  const currency = pick(data.currencyCode);
  const hawb = pick(data.hawbNumber);
  const mawb = pick(data.mawbNumber);

  if (docNo) {
    rules.push(
      { test: /^invoice\s*no\.?$/i, value: docNo },
      { test: /^invoice\s*number$/i, value: docNo },
      { test: /bill of lading\s*no/i, value: docNo },
      { test: /^hbl\s*no\.?$/i, value: docNo },
    );
  }
  if (quoteNo) {
    rules.push(
      { test: /^quote\s*no\.?$/i, value: quoteNo },
      { test: /^quotation\s*no\.?$/i, value: quoteNo },
    );
  }
  if (jobNo) {
    rules.push(
      { test: /^job\s*no\.?$/i, value: jobNo },
      { test: /^job\s*number$/i, value: jobNo },
      { test: /^job\s*ref/i, value: jobNo },
    );
  }
  if (shipNo) {
    rules.push({ test: /^shipment\s*no\.?$/i, value: shipNo }, { test: /^shipment$/i, value: shipNo });
  }
  if (invDate) {
    rules.push(
      { test: /^invoice\s*date$/i, value: invDate },
      { test: /^date\s*of\s*invoice$/i, value: invDate },
      { test: /^date$/i, value: invDate },
      { test: /place and date of issue/i, value: invDate },
      { test: /date of issue/i, value: invDate },
    );
  }
  if (due) {
    rules.push({ test: /^due\s*date$/i, value: due }, { test: /^payment\s*due$/i, value: due });
  }
  if (valid) {
    rules.push({ test: /^valid\s*(until|ity|till)?$/i, value: valid }, { test: /^validity$/i, value: valid });
  }
  if (etd) {
    rules.push(
      { test: /^etd$/i, value: etd },
      { test: /origin\s*etd/i, value: etd },
      { test: /date of departure|departure date/i, value: etd },
    );
  }
  if (eta) {
    rules.push(
      { test: /^eta$/i, value: eta },
      { test: /destination\s*eta/i, value: eta },
      { test: /date of arrival|arrival date/i, value: eta },
    );
  }
  if (ref) {
    rules.push(
      { test: /^reference\s*no\.?$/i, value: ref },
      { test: /^booking\s*ref/i, value: ref },
      { test: /^mbl\s*no\.?$/i, value: ref },
    );
  }
  if (hawb) {
    rules.push(
      { test: /^hawb\s*no\.?$/i, value: hawb },
      { test: /hbl\s*\/\s*hawb\s*no/i, value: hawb },
    );
  }
  if (mawb) {
    rules.push({ test: /^mawb\s*no\.?$/i, value: mawb });
  }
  if (currency) {
    rules.push({ test: /^currency$/i, value: currency });
  }
  return rules;
}

function isEntityBound(data: InvoiceFormatPdfData): boolean {
  if (data.entityBound) return true;
  return Boolean(
    data.invoiceNumber ||
      data.quotationNumber ||
      data.jobNumber ||
      data.shipmentNumber ||
      data.billToName ||
      data.invoiceDate ||
      data.dueDate ||
      data.validUntil ||
      data.etd ||
      data.eta ||
      data.lines?.length ||
      data.total ||
      data.subtotal,
  );
}

/**
 * Overlay live entity fields onto a permanent JSON layout demo payload.
 * When entityBound (selected invoice / quotation / job / shipment):
 * - only live data is shown
 * - missing fields stay empty (never demo sample text, never N/A fillers)
 * Catalog browse without an entity still uses the layout demo samples.
 */
export function mergeInvoiceFormatDemo(
  layout: InvoiceFormatUiLayout,
  data: InvoiceFormatPdfData = {},
): InvoiceFormatUiLayout {
  const demo: InvoiceFormatUiDemo = { ...layout.demo };
  const entityBound = isEntityBound(data);

  // Entity-bound: wipe every demo value first so nothing sample remains.
  if (entityBound) {
    demo.invoiceNo = '';
    demo.quotationNo = '';
    demo.jobNo = '';
    demo.shipmentNo = '';
    demo.invoiceDate = '';
    demo.dueDate = '';
    demo.referenceNoDate = '';
    demo.billToName = '';
    demo.billToAddress = '';
    demo.billToPhone = '';
    demo.billToGstin = '';
    demo.currency = '';
    demo.subtotal = '';
    demo.tax = '';
    demo.taxTotal = '';
    demo.total = '';
    demo.invoiceTotal = '';
    demo.netPayable = '';
    demo.grandTotalDue = '';
    demo.termsOfShipment = demo.termsOfShipment != null ? '' : demo.termsOfShipment;
    demo.goodsDescription = demo.goodsDescription != null ? '' : demo.goodsDescription;
    demo.narration = demo.narration != null ? '' : demo.narration;
    demo.remarks = demo.remarks != null ? '' : demo.remarks;
    demo.words = demo.words != null ? '' : demo.words;
    demo.metaRows = clearKvValues(demo.metaRows);
    demo.referenceRows = clearKvValues(demo.referenceRows);
    demo.ksaMetaRows = clearKvValues(demo.ksaMetaRows);
    demo.fieldGrid = clearKvValues(demo.fieldGrid);
    demo.partyRight = clearKvValues(demo.partyRight);
    demo.gstSummary = clearKvValues(demo.gstSummary);
    demo.partyLeft = clearPartyLines(demo.partyLeft);
    demo.partyMid = clearPartyLines(demo.partyMid);
    demo.partyThird = clearPartyLines(demo.partyThird);
    demo.partyNotify = clearPartyLines(demo.partyNotify);
    if (demo.tableRows?.length) {
      demo.tableRows = demo.tableRows.map((row) => row.map(() => ''));
    }
    if (demo.containerRow?.length) {
      demo.containerRow = demo.containerRow.map(() => '');
    }
    if (demo.osTableRows?.length) {
      demo.osTableRows = demo.osTableRows.map((row) => row.map(() => ''));
    }
    if (demo.hblCargoRows?.length) {
      demo.hblCargoRows = demo.hblCargoRows.map((row) => row.map(() => ''));
    }
    if (demo.numberedFields?.length) {
      demo.numberedFields = demo.numberedFields.map((f) => ({ ...f, value: '' }));
    }
    if (demo.sellerLines?.length) demo.sellerLines = demo.sellerLines.map(() => '');
    if (demo.buyerLines?.length) demo.buyerLines = demo.buyerLines.map(() => '');
    if (demo.subtotalParts?.length) demo.subtotalParts = demo.subtotalParts.map(() => '');
  }

  const metaRules = buildMetaRules(data);
  const pick = (raw: string | undefined) =>
    entityBound ? liveOrEmpty(raw) : reportFieldOrNa(raw, false);

  const docNo = pick(data.invoiceNumber);
  const quoteNo = pick(data.quotationNumber);
  const jobNo = pick(data.jobNumber);
  const shipNo = pick(data.shipmentNumber);
  const invDate = pick(formatReportLayoutDate(data.invoiceDate));
  const due = pick(formatReportLayoutDate(data.dueDate || data.validUntil));
  const billToName = pick(data.billToName);
  const billToAddress = pick(data.billToAddress);
  const currency = pick(data.currencyCode);
  const subtotal = pick(data.subtotal);
  const tax = pick(data.tax);
  const total = pick(data.total);

  if (docNo) demo.invoiceNo = docNo;
  if (quoteNo) demo.quotationNo = quoteNo;
  if (jobNo) demo.jobNo = jobNo;
  if (shipNo) demo.shipmentNo = shipNo;
  if (invDate) demo.invoiceDate = invDate;
  if (due) demo.dueDate = due;

  if (entityBound) {
    const ref = liveOrEmpty(data.referenceNo);
    const datePart = invDate || undefined;
    if (ref && datePart) demo.referenceNoDate = `${ref} / ${datePart}`;
    else if (ref) demo.referenceNoDate = ref;
    else if (datePart) demo.referenceNoDate = datePart;
    else demo.referenceNoDate = '';
  }

  const fieldExtras: Array<{ test: RegExp; value: string }> = [];
  const pol = pick(data.pol || data.originAirport);
  const pod = pick(data.pod || data.destAirport);
  const originAirport = pick(data.originAirport || data.pol);
  const destAirport = pick(data.destAirport || data.pod);
  const commodity = pick(data.commodity);
  const vessel = pick(data.vesselFlight);
  const incoterm = pick(data.incoterm || data.freightType);
  const onboard = pick(formatReportLayoutDate(data.etd));
  const hawbNo = pick(data.hawbNumber);
  const mawbNo = pick(data.mawbNumber);
  const pieces = pick(data.pieces);
  const grossWeight = pick(data.grossWeight);
  const chargeableWeight = pick(data.chargeableWeight);
  const volumeCbm = pick(data.volumeCbm);

  if (hawbNo) {
    fieldExtras.push(
      { test: /^hawb\s*no\.?$/i, value: hawbNo },
      { test: /hbl\s*\/\s*hawb\s*no/i, value: hawbNo },
    );
  }
  if (mawbNo) fieldExtras.push({ test: /^mawb\s*no\.?$/i, value: mawbNo });
  if (originAirport) {
    fieldExtras.push({
      test: /airport of departure|airport of origin|dep\.?\s*airport/i,
      value: originAirport,
    });
  }
  if (destAirport) {
    fieldExtras.push({
      test: /airport of destination|airport of arrival|dest\.?\s*airport/i,
      value: destAirport,
    });
  }
  if (pol) {
    fieldExtras.push({
      test: /^pol$|port of loading|place of receipt|^origin$/i,
      value: pol,
    });
  }
  if (pod) {
    fieldExtras.push({
      test: /^pod$|port of discharge|place of delivery|^destination$/i,
      value: pod,
    });
  }
  if (commodity) {
    fieldExtras.push({
      test: /commodity|goods|cargo|description of goods|nature and quantity/i,
      value: commodity,
    });
  }
  if (vessel) fieldExtras.push({ test: /vessel|flight|voyage/i, value: vessel });
  if (incoterm) {
    fieldExtras.push({
      test: /incoterm|terms of shipment|^freight$|freight type|payable at|ppd|coll/i,
      value: incoterm,
    });
  }
  if (pieces) {
    fieldExtras.push({ test: /^pieces$|^pkgs?$|no\.?\s*of\s*pieces|rcp/i, value: pieces });
  }
  if (grossWeight) {
    fieldExtras.push({ test: /gross\s*wt|gross\s*weight|^kgs?$/i, value: grossWeight });
  }
  if (chargeableWeight) {
    fieldExtras.push({ test: /chg\.?\s*wt|chargeable|chargable/i, value: chargeableWeight });
  }
  if (volumeCbm) {
    fieldExtras.push({ test: /volume|cbm|measurement/i, value: volumeCbm });
  }
  if (onboard) fieldExtras.push({ test: /onboard\s*date/i, value: onboard });

  demo.metaRows = overlayKvRows(demo.metaRows, metaRules);
  demo.referenceRows = overlayKvRows(demo.referenceRows, metaRules);
  demo.ksaMetaRows = overlayKvRows(demo.ksaMetaRows, metaRules);
  demo.fieldGrid = overlayKvRows(overlayKvRows(demo.fieldGrid, metaRules), fieldExtras);
  demo.partyRight = overlayKvRows(demo.partyRight, metaRules);

  const shipperLines = data.shipperLines?.filter((l) => l.trim()).length
    ? data.shipperLines.filter((l) => l.trim())
    : entityBound
      ? ['']
      : undefined;
  const consigneeLines = data.consigneeLines?.filter((l) => l.trim()).length
    ? data.consigneeLines.filter((l) => l.trim())
    : billToName
      ? [billToName, ...(billToAddress ? [billToAddress] : [])]
      : entityBound
        ? ['']
        : undefined;
  const notifyLines = data.notifyLines?.filter((l) => l.trim()).length
    ? data.notifyLines.filter((l) => l.trim())
    : entityBound
      ? ['']
      : undefined;

  const applyPartyBlock = (
    block: { title: string; lines: string[] } | undefined,
    lines: string[] | undefined,
  ) => {
    if (!block || !lines) return block;
    return { ...block, lines };
  };

  if (demo.partyLeft) {
    const t = demo.partyLeft.title || '';
    if (/shipper|from|exporter|borderer/i.test(t)) {
      demo.partyLeft = applyPartyBlock(demo.partyLeft, shipperLines) ?? demo.partyLeft;
    } else if (/consignee|customer|bill|to\b/i.test(t)) {
      demo.partyLeft = applyPartyBlock(demo.partyLeft, consigneeLines) ?? demo.partyLeft;
    } else if (entityBound) {
      demo.partyLeft = { ...demo.partyLeft, lines: [''] };
    }
  }
  if (demo.partyMid) {
    const t = demo.partyMid.title || '';
    if (/consignee|customer|bill|to\b/i.test(t)) {
      demo.partyMid = applyPartyBlock(demo.partyMid, consigneeLines) ?? demo.partyMid;
    } else if (/shipper|from/i.test(t)) {
      demo.partyMid = applyPartyBlock(demo.partyMid, shipperLines) ?? demo.partyMid;
    } else if (/notify/i.test(t)) {
      demo.partyMid = applyPartyBlock(demo.partyMid, notifyLines) ?? demo.partyMid;
    } else if (entityBound) {
      demo.partyMid = { ...demo.partyMid, lines: [''] };
    }
  }
  if (demo.partyThird) {
    const t = demo.partyThird.title || '';
    if (/notify/i.test(t)) {
      demo.partyThird = applyPartyBlock(demo.partyThird, notifyLines) ?? demo.partyThird;
    } else if (/consignee/i.test(t)) {
      demo.partyThird = applyPartyBlock(demo.partyThird, consigneeLines) ?? demo.partyThird;
    } else if (/shipper/i.test(t)) {
      demo.partyThird = applyPartyBlock(demo.partyThird, shipperLines) ?? demo.partyThird;
    } else if (entityBound) {
      demo.partyThird = { ...demo.partyThird, lines: [''] };
    }
  }
  if (demo.partyNotify) {
    demo.partyNotify = applyPartyBlock(demo.partyNotify, notifyLines) ?? demo.partyNotify;
  }

  if (billToName) demo.billToName = billToName;
  else if (entityBound) demo.billToName = '';

  if (data.billToPhone?.trim()) demo.billToPhone = data.billToPhone.trim();
  else if (entityBound) demo.billToPhone = '';

  if (billToAddress) demo.billToAddress = billToAddress;
  else if (entityBound) demo.billToAddress = '';

  if (incoterm && demo.termsOfShipment !== undefined) demo.termsOfShipment = incoterm;
  if (commodity && demo.goodsDescription !== undefined) demo.goodsDescription = commodity;

  if (currency) demo.currency = currency;
  else if (entityBound) demo.currency = '';

  if (subtotal) demo.subtotal = subtotal;
  else if (entityBound) demo.subtotal = '';

  if (tax) {
    demo.tax = tax;
    demo.taxTotal = tax;
  } else if (entityBound) {
    demo.tax = '';
    demo.taxTotal = '';
  }

  if (total) {
    const cur = data.currencyCode || demo.currency || '';
    demo.total = cur && !total.includes(cur) ? `${cur} ${total}` : total;
    demo.invoiceTotal = demo.total;
    demo.netPayable = demo.total;
    demo.grandTotalDue = demo.total;
  } else if (entityBound) {
    demo.total = '';
    demo.invoiceTotal = '';
    demo.netPayable = '';
    demo.grandTotalDue = '';
  }

  if (data.tableHeaders?.length) {
    demo.tableHeaders = data.tableHeaders.map((h) => String(h));
  }
  if (data.tableRows?.length) {
    demo.tableRows = data.tableRows.map((row) => row.map((c) => String(c ?? '')));
  } else if (data.lines?.length) {
    const headers = demo.tableHeaders?.length
      ? demo.tableHeaders
      : ['Description', 'Qty', 'Rate', 'Amount'];
    demo.tableHeaders = headers;
    demo.tableRows = data.lines.map((line) => {
      const cells = headers.map((h) => {
        const key = h.toLowerCase();
        if (/desc|charge|particular|service|item|goods/i.test(key))
          return line.description || '';
        if (/container|seal|mark/i.test(key)) return line.description || '';
        if (/pkg|pkgs|pieces|qty|quantity|unit$/i.test(key) && !/amount|rate|price/i.test(key))
          return line.qty ?? (entityBound ? '' : '1');
        if (/weight|kgs|measurement|cbm|volume|type/i.test(key)) return line.rate ?? '';
        if (/rate|price|amount\s*\/\s*qty/i.test(key)) return line.rate ?? '';
        if (/amount|total|fcy/i.test(key)) return line.amount ?? line.rate ?? '';
        if (/curr/i.test(key)) return data.currencyCode || (entityBound ? '' : demo.currency || '');
        return '';
      });
      return cells;
    });
  } else if (entityBound && demo.tableRows?.length) {
    const headers = demo.tableHeaders?.length
      ? demo.tableHeaders
      : ['Description', 'Qty', 'Rate', 'Amount'];
    demo.tableHeaders = headers;
    demo.tableRows = [headers.map(() => '')];
  }

  const scrub = (s?: string) =>
    s ? s.replace(/Fresa/gi, 'KingFisher').replace(/FRESA/g, 'KingFisher') : s;
  demo.billToName = scrub(demo.billToName);
  demo.billToAddress = scrub(demo.billToAddress);
  demo.partyLeft = demo.partyLeft
    ? { ...demo.partyLeft, lines: demo.partyLeft.lines.map((l) => scrub(l) || l) }
    : demo.partyLeft;
  demo.partyMid = demo.partyMid
    ? { ...demo.partyMid, lines: demo.partyMid.lines.map((l) => scrub(l) || l) }
    : demo.partyMid;
  demo.fieldGrid = demo.fieldGrid?.map((f) => ({ ...f, v: scrub(f.v) || f.v }));
  demo.metaRows = demo.metaRows?.map((f) => ({ ...f, v: scrub(f.v) || f.v }));

  const branding = { ...layout.branding };
  if (data.companyName?.trim()) branding.company = data.companyName.trim();
  if (data.companyAddress?.trim()) branding.address = data.companyAddress.trim();
  if (data.companyWeb?.trim()) branding.web = data.companyWeb.trim();
  if (data.companyPhone?.trim()) branding.phone = data.companyPhone.trim();
  if (data.companyEmail?.trim()) branding.email = data.companyEmail.trim();

  return { ...layout, demo, branding, name: scrub(layout.name) || layout.name };
}
