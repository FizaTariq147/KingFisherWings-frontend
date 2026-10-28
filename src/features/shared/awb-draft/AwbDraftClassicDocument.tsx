import type { ReactNode } from 'react';

export type AwbDraftClassicModel = {
  kind: 'hawb' | 'mawb';
  awbNumber: string;
  awbNumberDisplay: string;
  issuedBy: string;
  issuedByLines: string[];
  shipperAccount: string;
  shipperLines: string[];
  consigneeAccount: string;
  consigneeLines: string[];
  agentName: string;
  agentCity: string;
  agentIataCode: string;
  agentAccount: string;
  accountingInfo: string;
  airportOfDeparture: string;
  to1: string;
  byFirstCarrier: string;
  to2: string;
  by2: string;
  to3: string;
  by3: string;
  currency: string;
  chgsCode: string;
  wtValPpd: string;
  wtValColl: string;
  otherPpd: string;
  otherColl: string;
  declaredValueCarriage: string;
  declaredValueCustoms: string;
  airportOfDestination: string;
  requestedFlightDate: string;
  amountOfInsurance: string;
  handlingInformation: string;
  sci: string;
  pieces: string;
  grossWeight: string;
  weightUnit: string;
  rateClass: string;
  commodityItemNo: string;
  chargeableWeight: string;
  rateCharge: string;
  totalCharge: string;
  natureAndQuantity: string;
  otherCharges: string;
  weightChargePrepaid: string;
  weightChargeCollect: string;
  valuationCharge: string;
  tax: string;
  totalOtherDueAgent: string;
  totalOtherDueCarrier: string;
  totalPrepaid: string;
  totalCollect: string;
  shipperSignature: string;
  executedOn: string;
  executedAt: string;
  carrierSignature: string;
};

const cell = 'border border-black px-1 py-0.5 align-top leading-tight text-[9px] text-black';
const label = 'text-[7px] font-normal uppercase tracking-wide text-black';
const value = 'mt-0.5 whitespace-pre-line font-semibold uppercase';

function Box({
  title,
  children,
  className = '',
}: {
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${cell} ${className}`}>
      {title ? <p className={label}>{title}</p> : null}
      {children}
    </div>
  );
}

/**
 * Classic IATA Air Waybill face (laser AWB 600a style) matching sample
 * `176-10621623 mawb.pdf` — no KingFisher logo.
 */
export function AwbDraftClassicDocument({ model }: { model: AwbDraftClassicModel }) {
  const title = model.kind === 'hawb' ? 'House Air Waybill' : 'Air Waybill';
  const nature =
    model.natureAndQuantity ||
    [model.pieces && `${model.pieces} PCS`, model.grossWeight && `${model.grossWeight} KG`]
      .filter(Boolean)
      .join(' · ') ||
    '—';

  return (
    <div
      data-awb-draft-sheet
      className="relative mx-auto w-full max-w-[794px] bg-white text-black"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      {/* Header */}
      <div className="grid grid-cols-[1.1fr_1.4fr_1fr] border border-black">
        <div className={`${cell} border-0 border-r min-h-[108px]`}>
          <p className="text-[11px] font-bold tracking-wide">{model.awbNumberDisplay || '—'}</p>
          <p className={`${label} mt-2`}>Shipper&apos;s Name and Address</p>
          <p className={value}>{(model.shipperLines.length ? model.shipperLines : ['—']).join('\n')}</p>
        </div>
        <div className={`${cell} border-0 border-r text-center`}>
          <p className="text-[8px] font-semibold uppercase">Not Negotiable</p>
          <p className="mt-1 text-[18px] font-bold leading-none">{title}</p>
          <p className={`${label} mt-2`}>Issued By</p>
          <p className={`${value} text-[10px]`}>
            {(model.issuedByLines.length
              ? model.issuedByLines
              : [model.issuedBy || '—']
            ).join('\n')}
          </p>
          <p className="mt-2 text-[6.5px] leading-snug text-[#222]">
            Copies 1, 2 and 3 of this Air Waybill are originals and have the same validity
          </p>
        </div>
        <div className={`${cell} border-0 text-right`}>
          <p className="text-[14px] font-bold tracking-wide">{model.awbNumberDisplay || '—'}</p>
          <p className={`${label} mt-3 text-left`}>Shipper&apos;s Account Number</p>
          <p className={`${value} text-left`}>{model.shipperAccount || '—'}</p>
        </div>
      </div>

      {/* Consignee */}
      <div className="grid grid-cols-[2.5fr_1fr] border border-t-0 border-black">
        <Box title="Consignee's Name and Address" className="border-0 border-r min-h-[96px]">
          <p className={value}>
            {(model.consigneeLines.length ? model.consigneeLines : ['—']).join('\n')}
          </p>
        </Box>
        <Box title="Consignee's Account Number" className="border-0">
          <p className={value}>{model.consigneeAccount || '—'}</p>
        </Box>
      </div>

      {/* Agent / Accounting */}
      <div className="grid grid-cols-[1.4fr_1.2fr] border border-t-0 border-black">
        <div className="border-r border-black">
          <Box title="Issuing Carrier's Agent Name and City" className="border-0 border-b min-h-[48px]">
            <p className={value}>
              {[model.agentName, model.agentCity].filter(Boolean).join('\n') || '—'}
            </p>
          </Box>
          <div className="grid grid-cols-2">
            <Box title="Agent's IATA Code" className="border-0 border-r">
              <p className={value}>{model.agentIataCode || '—'}</p>
            </Box>
            <Box title="Account No" className="border-0">
              <p className={value}>{model.agentAccount || '—'}</p>
            </Box>
          </div>
        </div>
        <Box title="Accounting Information" className="border-0 min-h-[72px]">
          <p className={value}>{model.accountingInfo || '—'}</p>
        </Box>
      </div>

      {/* Airport of departure */}
      <Box
        title="Airport of Departure (Addr. of First Carrier) and Requested Routing"
        className="border border-t-0 border-black"
      >
        <p className={value}>{model.airportOfDeparture || '—'}</p>
      </Box>

      {/* Routing row */}
      <div className="grid grid-cols-12 border border-t-0 border-black text-center">
        <Box title="To" className="col-span-1 border-0 border-r">
          <p className={value}>{model.to1 || '—'}</p>
        </Box>
        <Box title="By First Carrier" className="col-span-2 border-0 border-r">
          <p className={value}>{model.byFirstCarrier || '—'}</p>
        </Box>
        <Box title="To" className="col-span-1 border-0 border-r">
          <p className={value}>{model.to2 || '—'}</p>
        </Box>
        <Box title="By" className="col-span-1 border-0 border-r">
          <p className={value}>{model.by2 || '—'}</p>
        </Box>
        <Box title="To" className="col-span-1 border-0 border-r">
          <p className={value}>{model.to3 || '—'}</p>
        </Box>
        <Box title="By" className="col-span-1 border-0 border-r">
          <p className={value}>{model.by3 || '—'}</p>
        </Box>
        <Box title="Currency" className="col-span-1 border-0 border-r">
          <p className={value}>{model.currency || '—'}</p>
        </Box>
        <Box title="CHGS Code" className="col-span-1 border-0 border-r">
          <p className={value}>{model.chgsCode || '—'}</p>
        </Box>
        <div className="col-span-1 border-r border-black">
          <p className={`${label} border-b border-black px-0.5 py-0.5 text-center`}>WT/VAL</p>
          <div className="grid grid-cols-2">
            <Box title="PPD" className="border-0 border-r text-center">
              <p className={value}>{model.wtValPpd || ''}</p>
            </Box>
            <Box title="COLL" className="border-0 text-center">
              <p className={value}>{model.wtValColl || ''}</p>
            </Box>
          </div>
        </div>
        <div className="col-span-1 border-r border-black">
          <p className={`${label} border-b border-black px-0.5 py-0.5 text-center`}>Other</p>
          <div className="grid grid-cols-2">
            <Box title="PPD" className="border-0 border-r text-center">
              <p className={value}>{model.otherPpd || ''}</p>
            </Box>
            <Box title="COLL" className="border-0 text-center">
              <p className={value}>{model.otherColl || ''}</p>
            </Box>
          </div>
        </div>
        <Box title="Declared Value for Carriage" className="col-span-1 border-0">
          <p className={value}>{model.declaredValueCarriage || 'NVD'}</p>
        </Box>
      </div>

      <div className="grid grid-cols-4 border border-t-0 border-black">
        <Box title="Declared Value for Customs" className="border-0 border-r">
          <p className={value}>{model.declaredValueCustoms || 'NCV'}</p>
        </Box>
        <Box title="Airport of Destination" className="border-0 border-r">
          <p className={value}>{model.airportOfDestination || '—'}</p>
        </Box>
        <Box title="Requested Flight / Date" className="border-0 border-r">
          <p className={value}>{model.requestedFlightDate || '—'}</p>
        </Box>
        <Box title="Amount of Insurance" className="border-0">
          <p className={value}>{model.amountOfInsurance || 'XXX'}</p>
        </Box>
      </div>

      <div className="grid grid-cols-[1fr_80px] border border-t-0 border-black">
        <Box title="Handling Information" className="border-0 border-r min-h-[40px]">
          <p className={value}>{model.handlingInformation || '—'}</p>
        </Box>
        <Box title="SCI" className="border-0">
          <p className={value}>{model.sci || '—'}</p>
        </Box>
      </div>

      {/* Rating table — tall body band mirrors Fresa HAWB face vertical proportion */}
      <div className="grid grid-cols-[48px_70px_28px_48px_56px_70px_56px_64px_1fr] border border-t-0 border-black text-center min-h-[280px]">
        <Box title="No. of Pieces RCP" className="border-0 border-r">
          <p className={value}>{model.pieces || '—'}</p>
        </Box>
        <Box title="Gross Weight" className="border-0 border-r">
          <p className={value}>{model.grossWeight || '—'}</p>
        </Box>
        <Box title="kg lb" className="border-0 border-r">
          <p className={value}>{model.weightUnit || 'K'}</p>
        </Box>
        <Box title="Rate Class" className="border-0 border-r">
          <p className={value}>{model.rateClass || '—'}</p>
        </Box>
        <Box title="Commodity Item No." className="border-0 border-r">
          <p className={value}>{model.commodityItemNo || '—'}</p>
        </Box>
        <Box title="Chargeable Weight" className="border-0 border-r">
          <p className={value}>{model.chargeableWeight || '—'}</p>
        </Box>
        <Box title="Rate / Charge" className="border-0 border-r">
          <p className={value}>{model.rateCharge || '—'}</p>
        </Box>
        <Box title="Total" className="border-0 border-r">
          <p className={value}>{model.totalCharge || '—'}</p>
        </Box>
        <Box
          title="Nature and Quantity of Goods (incl. Dimensions or Volume)"
          className="border-0 text-left"
        >
          <p className={value}>{nature}</p>
        </Box>
      </div>

      {/* Charges */}
      <div className="grid grid-cols-[1.1fr_1fr_1.2fr] border border-t-0 border-black">
        <div className="border-r border-black">
          <div className="grid grid-cols-2 border-b border-black">
            <Box title="Prepaid Weight Charge" className="border-0 border-r">
              <p className={value}>{model.weightChargePrepaid || '—'}</p>
            </Box>
            <Box title="Collect" className="border-0">
              <p className={value}>{model.weightChargeCollect || ''}</p>
            </Box>
          </div>
          <Box title="Valuation Charge" className="border-0 border-b">
            <p className={value}>{model.valuationCharge || ''}</p>
          </Box>
          <Box title="Tax" className="border-0 border-b">
            <p className={value}>{model.tax || ''}</p>
          </Box>
          <Box title="Total Other Charges Due Agent" className="border-0 border-b">
            <p className={value}>{model.totalOtherDueAgent || ''}</p>
          </Box>
          <Box title="Total Other Charges Due Carrier" className="border-0 border-b">
            <p className={value}>{model.totalOtherDueCarrier || ''}</p>
          </Box>
          <div className="grid grid-cols-2">
            <Box title="Total Prepaid" className="border-0 border-r">
              <p className={value}>{model.totalPrepaid || '—'}</p>
            </Box>
            <Box title="Total Collect" className="border-0">
              <p className={value}>{model.totalCollect || ''}</p>
            </Box>
          </div>
        </div>
        <Box title="Other Charges" className="border-0 border-r min-h-[140px]">
          <p className={value}>{model.otherCharges || '—'}</p>
        </Box>
        <div>
          <Box title="Signature of Shipper or his Agent" className="border-0 border-b min-h-[56px]">
            <p className={value}>{model.shipperSignature || '—'}</p>
          </Box>
          <div className="grid grid-cols-2 border-b border-black">
            <Box title="Executed on (Date)" className="border-0 border-r">
              <p className={value}>{model.executedOn || '—'}</p>
            </Box>
            <Box title="at (Place)" className="border-0">
              <p className={value}>{model.executedAt || '—'}</p>
            </Box>
          </div>
          <Box title="Signature of Issuing Carrier or its Agent" className="border-0 min-h-[56px]">
            <p className={value}>{model.carrierSignature || '—'}</p>
          </Box>
        </div>
      </div>

      <p className="border border-t-0 border-black px-2 py-1 text-[6.5px] leading-snug text-[#222]">
        Shipper certifies that the particulars on the face hereof are correct and that insofar as
        any part of the consignment contains dangerous goods, such part is properly described by
        name and is in proper condition for carriage by air according to the applicable Dangerous
        Goods Regulations. It is agreed that the goods described herein are accepted in apparent
        good order and condition (except as noted) for carriage SUBJECT TO THE CONDITIONS OF
        CONTRACT ON THE REVERSE HEREOF.
      </p>
    </div>
  );
}
