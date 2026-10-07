import type { InvoiceFormatUiDemo, InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import {
  REPORT_FIELD_NA,
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

/** Labels we map from live entity data — when bound and unmatched, force N/A. */
const KNOWN_FIELD_LABEL =
  /invoice\s*no|invoice\s*number|quote\s*no|quotation\s*no|job\s*no|job\s*number|shipment\s*no|^shipment$|invoice\s*date|date\s*of\s*invoice|^date$|due\s*date|payment\s*due|valid|validity|etd|eta|origin\s*etd|destination\s*eta|departure|arrival|reference\s*no|^currency$|^pol$|^pod$|origin|destination|loading|discharge/i;

function applyNaToKnownRows(rows: Kv[] | undefined, entityBound: boolean): Kv[] | undefined {
  if (!entityBound || !rows?.length) return rows;
  return rows.map((row) =>
    KNOWN_FIELD_LABEL.test(row.k) && (!row.v || !String(row.v).trim())
      ? { ...row, v: REPORT_FIELD_NA }
      : row,
  );
}

function buildMetaRules(
  data: InvoiceFormatPdfData,
  entityBound: boolean,
): Array<{ test: RegExp; value: string }> {
  const rules: Array<{ test: RegExp; value: string }> = [];
  const pick = (raw: string | undefined) => reportFieldOrNa(raw, entityBound);

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

  if (docNo) {
    rules.push(
      { test: /^invoice\s*no\.?$/i, value: docNo },
      { test: /^invoice\s*number$/i, value: docNo },
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
      { test: /departure/i, value: etd },
    );
  }
  if (eta) {
    rules.push(
      { test: /^eta$/i, value: eta },
      { test: /destination\s*eta/i, value: eta },
      { test: /arrival/i, value: eta },
    );
  }
  if (ref) {
    rules.push({ test: /^reference\s*no\.?$/i, value: ref });
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

/** Overlay live entity fields onto a permanent JSON layout demo payload. */
export function mergeInvoiceFormatDemo(
  layout: InvoiceFormatUiLayout,
  data: InvoiceFormatPdfData = {},
): InvoiceFormatUiLayout {
  const demo: InvoiceFormatUiDemo = { ...layout.demo };
  const entityBound = isEntityBound(data);
  const metaRules = buildMetaRules(data, entityBound);
  const pick = (raw: string | undefined) => reportFieldOrNa(raw, entityBound);

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

  if (entityBound || docNo) {
    if (docNo) demo.invoiceNo = docNo;
    else if (entityBound) demo.invoiceNo = REPORT_FIELD_NA;
  }
  if (quoteNo) demo.quotationNo = quoteNo;
  else if (entityBound && demo.quotationNo) demo.quotationNo = REPORT_FIELD_NA;

  if (jobNo) demo.jobNo = jobNo;
  else if (entityBound) demo.jobNo = REPORT_FIELD_NA;

  if (shipNo) demo.shipmentNo = shipNo;
  else if (entityBound && demo.shipmentNo) demo.shipmentNo = REPORT_FIELD_NA;

  if (invDate) demo.invoiceDate = invDate;
  else if (entityBound) demo.invoiceDate = REPORT_FIELD_NA;

  if (due) demo.dueDate = due;
  else if (entityBound) demo.dueDate = REPORT_FIELD_NA;

  if (entityBound) {
    const ref = data.referenceNo?.trim();
    const datePart = invDate && invDate !== REPORT_FIELD_NA ? invDate : undefined;
    if (ref && datePart) demo.referenceNoDate = `${ref} / ${datePart}`;
    else if (ref) demo.referenceNoDate = ref;
    else if (datePart) demo.referenceNoDate = datePart;
    else demo.referenceNoDate = REPORT_FIELD_NA;
  }

  // Shipment / route fields from live details (not only parsed from billToAddress).
  const fieldExtras: Array<{ test: RegExp; value: string }> = [];
  const pol = pick(data.pol);
  const pod = pick(data.pod);
  const commodity = pick(data.commodity);
  const vessel = pick(data.vesselFlight);
  const incoterm = pick(data.incoterm);
  if (pol) fieldExtras.push({ test: /^pol$|origin|loading|place of receipt/i, value: pol });
  if (pod) fieldExtras.push({ test: /^pod$|destination|discharge|place of delivery/i, value: pod });
  if (commodity) fieldExtras.push({ test: /commodity|goods|cargo|description of goods/i, value: commodity });
  if (vessel) fieldExtras.push({ test: /vessel|flight|voyage/i, value: vessel });
  if (incoterm) fieldExtras.push({ test: /incoterm|terms of shipment/i, value: incoterm });

  demo.metaRows = applyNaToKnownRows(overlayKvRows(demo.metaRows, metaRules), entityBound);
  demo.referenceRows = applyNaToKnownRows(
    overlayKvRows(demo.referenceRows, metaRules),
    entityBound,
  );
  demo.ksaMetaRows = applyNaToKnownRows(overlayKvRows(demo.ksaMetaRows, metaRules), entityBound);
  demo.fieldGrid = applyNaToKnownRows(
    overlayKvRows(overlayKvRows(demo.fieldGrid, metaRules), fieldExtras),
    entityBound,
  );
  demo.partyRight = applyNaToKnownRows(overlayKvRows(demo.partyRight, metaRules), entityBound);

  const naLines = [REPORT_FIELD_NA];
  const shipperLines =
    data.shipperLines?.filter((l) => l.trim()).length
      ? data.shipperLines.filter((l) => l.trim())
      : entityBound
        ? naLines
        : undefined;
  const consigneeLines =
    data.consigneeLines?.filter((l) => l.trim()).length
      ? data.consigneeLines.filter((l) => l.trim())
      : billToName && billToName !== REPORT_FIELD_NA
        ? [billToName, ...(billToAddress && billToAddress !== REPORT_FIELD_NA ? [billToAddress] : [])]
        : entityBound
          ? naLines
          : undefined;
  const notifyLines =
    data.notifyLines?.filter((l) => l.trim()).length
      ? data.notifyLines.filter((l) => l.trim())
      : entityBound
        ? naLines
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
    if (/shipper|from|exporter|exporterer/i.test(t)) {
      demo.partyLeft = applyPartyBlock(demo.partyLeft, shipperLines) ?? demo.partyLeft;
    } else if (/consignee|customer|bill|to\b/i.test(t)) {
      demo.partyLeft = applyPartyBlock(demo.partyLeft, consigneeLines) ?? demo.partyLeft;
    } else if (entityBound) {
      demo.partyLeft = { ...demo.partyLeft, lines: naLines };
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
      demo.partyMid = { ...demo.partyMid, lines: naLines };
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
      demo.partyThird = { ...demo.partyThird, lines: naLines };
    }
  }
  if (demo.partyNotify) {
    demo.partyNotify = applyPartyBlock(demo.partyNotify, notifyLines) ?? demo.partyNotify;
  }

  if (billToName) {
    demo.billToName = billToName;
  } else if (entityBound) {
    demo.billToName = REPORT_FIELD_NA;
  }

  if (data.billToPhone?.trim()) demo.billToPhone = data.billToPhone.trim();
  else if (entityBound && demo.billToPhone) demo.billToPhone = REPORT_FIELD_NA;

  if (billToAddress && billToAddress !== REPORT_FIELD_NA) {
    demo.billToAddress = billToAddress;
  } else if (entityBound) {
    demo.billToAddress = REPORT_FIELD_NA;
  }

  if (incoterm && demo.termsOfShipment !== undefined) demo.termsOfShipment = incoterm;
  if (commodity && demo.goodsDescription !== undefined) demo.goodsDescription = commodity;

  if (currency) demo.currency = currency;
  else if (entityBound) demo.currency = REPORT_FIELD_NA;

  if (subtotal) demo.subtotal = subtotal;
  else if (entityBound) demo.subtotal = REPORT_FIELD_NA;

  if (tax) {
    demo.tax = tax;
    demo.taxTotal = tax;
  } else if (entityBound) {
    demo.tax = REPORT_FIELD_NA;
    demo.taxTotal = REPORT_FIELD_NA;
  }

  if (total && total !== REPORT_FIELD_NA) {
    const cur = data.currencyCode || (demo.currency !== REPORT_FIELD_NA ? demo.currency : '') || '';
    demo.total = cur && !total.includes(cur) ? `${cur} ${total}` : total;
    demo.invoiceTotal = demo.total;
    demo.netPayable = demo.total;
    demo.grandTotalDue = demo.total;
  } else if (entityBound) {
    demo.total = REPORT_FIELD_NA;
    demo.invoiceTotal = REPORT_FIELD_NA;
    demo.netPayable = REPORT_FIELD_NA;
    demo.grandTotalDue = REPORT_FIELD_NA;
  }

  if (data.lines?.length) {
    const headers = demo.tableHeaders?.length
      ? demo.tableHeaders
      : ['Description', 'Qty', 'Rate', 'Amount'];
    demo.tableHeaders = headers;
    demo.tableRows = data.lines.map((line) => {
      const cells = headers.map((h) => {
        const key = h.toLowerCase();
        if (/desc|charge|particular|service|item/i.test(key))
          return line.description || (entityBound ? REPORT_FIELD_NA : '');
        if (/qty|quantity|unit$/i.test(key) && !/amount|rate|price/i.test(key))
          return line.qty ?? (entityBound ? REPORT_FIELD_NA : '1');
        if (/rate|price|amount\s*\/\s*qty/i.test(key))
          return line.rate ?? (entityBound ? REPORT_FIELD_NA : '');
        if (/amount|total|fcy/i.test(key))
          return line.amount ?? line.rate ?? (entityBound ? REPORT_FIELD_NA : '');
        if (/curr/i.test(key))
          return data.currencyCode || (entityBound ? REPORT_FIELD_NA : demo.currency || '');
        return entityBound ? REPORT_FIELD_NA : '';
      });
      return cells;
    });
  } else if (entityBound && demo.tableRows?.length) {
    // Clear demo charge rows when the live record has no lines.
    const headers = demo.tableHeaders?.length
      ? demo.tableHeaders
      : ['Description', 'Qty', 'Rate', 'Amount'];
    demo.tableHeaders = headers;
    demo.tableRows = [headers.map(() => REPORT_FIELD_NA)];
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

  return { ...layout, demo, name: scrub(layout.name) || layout.name };
}
