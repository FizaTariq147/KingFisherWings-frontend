/**
 * Map one open record to the document binding paths used by every non-invoice
 * report family. Missing values stay empty. Nothing here invents data.
 *
 * Record shape (all parts optional):
 *   { organization, invoice, job, party, bank, session, quotation, voucher }
 */

/** Paths that have no field in the data model. They always resolve to empty. */
export const NO_SOURCE_PATHS = new Set(['party.notify', 'cargo.netWeight']);

const text = (value) => (value == null ? '' : String(value).trim());

function firstText(...values) {
  for (const value of values) {
    const cleaned = text(value);
    if (cleaned) return cleaned;
  }
  return '';
}

function money(value) {
  if (value == null || value === '') return '';
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function numberText(value) {
  return value == null || value === '' ? '' : String(value);
}

function joinParts(...parts) {
  return parts.map(text).filter(Boolean).join(', ');
}

/**
 * Which report module a catalogue code belongs to. Decides the fill path:
 * invoice and credit_debit use the invoice binder, the rest use the dictionary.
 */
export function moduleForCode(code) {
  const key = String(code || '').toUpperCase();
  if (/(CREDIT|DEBIT)_?NOTE|(^|_)(CN|DN)(_|$)/.test(key)) return 'credit_debit';
  if (/QUOTATION/.test(key)) return 'quotation';
  if (/VOUCHER/.test(key)) return 'voucher';
  if (/MANIFEST/.test(key)) return 'manifest';
  if (/ARRIVAL/.test(key)) return 'arrival_notice';
  if (/DELIVERY_ORDER|(^|_)D_O_|DELIVERY_NOTE|DELIVERY_CONFIRMATION/.test(key)) return 'delivery_order';
  if (/JOB_CARD|PROFIT_AND_LOSS|JOB_HOUSE|OUTSTANDING_LETTER|STATEMENT_OF|AGING|TRIAL_BALANCE/.test(key)) return 'job';
  if (/INVOICE|BILL_OF_SUPPLY/.test(key)) return 'invoice';
  if (/HBL|HAWB|MAWB|AWB|BILL_OF_LADING|(^|_)BL(_|$)|BOOKING|PRE_?ALERT|SAILING|LOADING|CARTING|SHIPPING_INSTRUCTION|CONTAINER|STUFFING|VGM|FCR|ISF|SHIPMENT|PICKUP|TRUCK|PROOF_OF_DELIVERY|TERMINAL|TRANSSHIPMENT|CARGO_RECEIPT|EXCHANGE_LETTER|SURRENDERED|LETTER_OF_GUARANTEE|IGM|RIDER/.test(key)) return 'shipment';
  return 'job';
}

export function buildDocumentContext(record = {}) {
  const org = record.organization || {};
  const invoice = record.invoice || {};
  const job = record.job || {};
  const party = record.party || {};
  const quotation = record.quotation || {};
  const voucher = record.voucher || {};
  const bank = record.bank || org.bank || org.bank_details || {};
  const session = record.session || {};
  const fcl = job.sea_fcl_details || {};
  const lcl = job.sea_lcl_details || {};
  const sea = job.sea_fcl_details || job.sea_lcl_details || {};
  const air = job.air_details || {};
  const ship = invoice.shipment || {};
  const bl = (job.bills_of_lading || []).find((item) => item) || {};
  const booking = job.sea_fcl_booking_form || job.sea_lcl_booking_form || {};

  const containerNumbers = [...new Set(
    [text(job.primary_container_number)]
      .concat(job.containers || [], fcl.containers || [], lcl.containers || [])
      .map((item) => (item && typeof item === 'object' ? text(item.container_number) : text(item)))
      .filter(Boolean),
  )];
  const hbl = firstText(fcl.hbl_number, lcl.hbl_number, fcl.hbl_number_from_agent, lcl.hbl_number_from_agent, ship.hbl_number, air.hawb_number, ship.hawb_number, ship.bl_awb, bl.bl_number);
  const hawb = firstText(air.hawb_number, ship.hawb_number);
  const mbl = firstText(fcl.mbl_number, lcl.mbl_number, ship.mbl_number);
  const mawb = firstText(air.mawb_number, ship.mawb_number);
  const total = invoice.total_amount ?? (invoice.subtotal == null ? null : Number(invoice.subtotal) + Number(invoice.tax_total ?? 0));
  const container0 = (job.containers || [])[0];
  const firstContainer = container0 && typeof container0 === 'object' ? container0 : {};

  const context = {
    'company.name': firstText(org.display_name, org.name),
    'company.address': joinParts(org.address, org.city, org.country_code),
    'company.phone': text(org.phone),
    'company.email': text(org.email),
    'company.website': text(org.website),

    'party.billTo': joinParts(firstText(invoice.party_name, party.name), party.address, party.city),
    'party.shipper': firstText(job.shipper_name, job.shipper?.name),
    'party.consignee': firstText(job.consignee_name, job.consignee?.name),
    'party.notify': '',

    'job.number': firstText(invoice.job_number, job.job_number),
    'job.incoterms': text(job.incoterms),
    'job.department': firstText(job.department_name),

    'invoice.number': text(invoice.invoice_number),
    'invoice.date': text(invoice.invoice_date),
    'invoice.currency': text(invoice.currency_code),
    'invoice.amount': money(invoice.subtotal),
    'invoice.tax': money(invoice.tax_total),
    'invoice.total': money(total),
    'invoice.dueDate': text(invoice.due_date),
    'invoice.remarks': text(invoice.remarks),
    'invoice.lpo': text(invoice.lpo_number),
    'invoice.outstanding': money(invoice.outstanding_balance),

    'shipment.number': text(job.shipment_number),
    'shipment.reference': firstText(job.client_reference_no, job.reference_no),
    'shipment.mawb': mawb,
    'shipment.hawb': hawb,
    'shipment.hbl': hbl,
    'shipment.mbl': mbl,
    'shipment.houseDoc': firstText(hbl, hawb),
    'shipment.masterDoc': firstText(mbl, mawb),
    'shipment.transportDocs': [...new Set([mbl, mawb, hbl, hawb].filter(Boolean))].join(' / '),
    'shipment.pol': text(job.origin_port_code),
    'shipment.pod': text(job.dest_port_code),
    'shipment.placeOfReceipt': text(sea.place_of_receipt),
    'shipment.placeOfDelivery': text(sea.place_of_delivery),
    'shipment.finalDestination': text(job.dest_door_address),
    'shipment.vessel': firstText(job.vessel_name, fcl.vessel_name, lcl.vessel_name, ship.vessel_name, ship.vessel_flight, bl.vessel_name),
    'shipment.voyage': firstText(job.voyage_number, fcl.voyage_number, lcl.voyage_number, ship.voyage_number, ship.flight_number, air.flight_number, booking.voyage_ref, bl.voyage_number),
    'shipment.etd': firstText(job.etd, sea.etd),
    'shipment.eta': firstText(job.eta, sea.eta),
    'shipment.carrier': firstText(sea.shipping_line_name, air.airline_name),
    'shipment.freightTerms': text(sea.freight_terms),
    'shipment.serviceType': text(job.service_scope),

    'cargo.description': firstText(job.commodity_description, job.commodity),
    'cargo.marks': text(job.cargo?.[0]?.marks_numbers),
    'cargo.pieces': numberText(job.pieces),
    'cargo.grossWeight': numberText(job.gross_weight),
    'cargo.netWeight': '',
    'cargo.measurement': numberText(job.volume_cbm),
    'cargo.containerNo': containerNumbers.join(', '),
    'cargo.containerType': text(firstContainer.container_type_code),
    'cargo.sealNo': text(firstContainer.seal_number),

    'quotation.number': firstText(quotation.quotation_number, quotation.number),
    'quotation.date': firstText(quotation.quotation_date, quotation.date, quotation.created_at),
    'quotation.validUntil': text(quotation.valid_until),
    'quotation.currency': firstText(quotation.currency_code, quotation.currency),
    'quotation.total': money(quotation.total_amount ?? quotation.total),
    'quotation.terms': text(quotation.terms),

    'voucher.number': firstText(voucher.voucher_number, voucher.number),
    'voucher.date': firstText(voucher.voucher_date, voucher.date),
    'voucher.amount': money(voucher.amount ?? voucher.total_amount),
    'voucher.currency': firstText(voucher.currency_code, voucher.currency),
    'voucher.narration': firstText(voucher.narration, voucher.description),
    'voucher.payee': firstText(voucher.payee_name, voucher.party_name, voucher.payee),
    'voucher.mode': firstText(voucher.payment_mode, voucher.mode),
    'voucher.reference': firstText(voucher.reference_no, voucher.reference),

    'bank.name': firstText(bank.bank_name, bank.name),
    'bank.branch': firstText(bank.branch_name, bank.branch),
    'bank.accountName': firstText(bank.account_name, bank.account_holder),
    'bank.accountNo': firstText(bank.account_number, bank.account_no),
    'bank.iban': text(bank.iban),
    'bank.swift': firstText(bank.swift_code, bank.swift),
    'bank.ifsc': firstText(bank.ifsc_code, bank.ifsc),

    'session.user': firstText(session.user_name, session.name, session.user),
    'session.printedAt': firstText(session.printed_at, session.printedAt),
    'session.createdBy': firstText(session.created_by, session.createdBy, invoice.created_by_name),
    'document.user': firstText(session.user_name, session.name, session.user),
  };

  for (const path of NO_SOURCE_PATHS) context[path] = '';
  return context;
}
