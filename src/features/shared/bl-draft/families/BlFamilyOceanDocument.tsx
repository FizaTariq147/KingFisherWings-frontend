import type { BlDraftClassicModel } from '../BlDraftClassicDocument';
import {
  BrandHeader,
  FieldCell,
  FreightClosing,
  PartyBox,
  cargoRows,
  cell,
} from './blFamilyShared';

/** Fresa ocean BL — Pre-carriage / Ocean Vessel / FOR DELIVERY APPLY TO. */
export function BlFamilyOceanDocument({ model }: { model: BlDraftClassicModel }) {
  const rows = cargoRows(model);
  const vesselParts = model.vesselVoyage.split('/').map((s) => s.trim()).filter(Boolean);
  return (
    <div
      data-bl-draft-sheet
      data-bl-family="ocean"
      className="relative mx-auto w-full max-w-[794px] bg-white text-[#111]"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      <BrandHeader model={model} logoSrc={model.logoUrl} title="BILL OF LADING" />
      <div className="grid grid-cols-2">
        <div className={`${cell}`}>
          <p className="text-[8px] font-bold uppercase">Shipper</p>
          <div className="mt-0.5 min-h-[48px] whitespace-pre-line font-medium">
            {(model.shipperLines.length ? model.shipperLines : ['—']).join('\n')}
          </div>
          <p className="mt-2 text-[8px] font-bold uppercase">BOOKING NO. {model.jobRef || '—'}</p>
        </div>
        <div className={`${cell} border-l-0`}>
          <p className="text-[8px] font-bold uppercase">Bill of Lading No.</p>
          <p className="mt-1 text-[14px] font-bold">{model.blNumber || '—'}</p>
        </div>
      </div>
      <div className="grid grid-cols-2">
        <PartyBox title="Consignee" lines={model.consigneeLines} className="border-t-0" />
        <div className={`${cell} border-l-0 border-t-0 text-center`}>
          {model.logoUrl ? (
            <img
              src={model.logoUrl}
              alt=""
              className="mx-auto h-10 max-w-[140px] object-contain"
            />
          ) : null}
          <p className="mt-1 text-[10px] font-bold uppercase">{model.companyName}</p>
          {model.agentLines.slice(0, 2).map((l) => (
            <p key={l} className="text-[8px]">
              {l}
            </p>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2">
        <PartyBox title="Notify Party" lines={model.notifyLines} className="border-t-0" />
        <div className={`${cell} border-l-0 border-t-0`}>
          <p className="text-[8px] font-bold uppercase">FOR DELIVERY PLEASE APPLY TO</p>
          <p className="mt-1 font-semibold">{model.agentName}</p>
          {model.agentLines.map((l) => (
            <p key={l} className="text-[8px]">
              {l}
            </p>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2">
        <FieldCell title="Pre-carriage by" value={model.preCarriage} className="border-t-0" />
        <FieldCell title="Place of Receipt" value={model.placeOfReceipt} className="border-t-0 border-l-0" />
      </div>
      <div className="grid grid-cols-2">
        <FieldCell title="Ocean Vessel" value={vesselParts[0] || model.vesselVoyage} className="border-t-0" />
        <FieldCell title="Port of Loading" value={model.portOfLoading} className="border-t-0 border-l-0" />
      </div>
      <div className="grid grid-cols-3">
        <FieldCell title="Port of Discharge" value={model.portOfDischarge} className="border-t-0" />
        <FieldCell title="Place of Delivery" value={model.placeOfDelivery} className="border-t-0 border-l-0" />
        <FieldCell title="No. of Original B/L" value={model.numberOfBls} className="border-t-0 border-l-0" />
      </div>
      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr className="bg-[#f7f7f7]">
            <th className={`${cell} border-t-0 text-left`}>Marks and Numbers</th>
            <th className={`${cell} border-t-0 border-l-0 text-left`}>No. of Pkgs · Description</th>
            <th className={`${cell} border-t-0 border-l-0 text-left`}>Gross Weight</th>
            <th className={`${cell} border-t-0 border-l-0 text-left`}>Measurement</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className={`${cell} border-t-0 whitespace-pre-line`}>{row.marks}</td>
              <td className={`${cell} border-t-0 border-l-0 whitespace-pre-line`}>
                {[row.packages, row.description].filter(Boolean).join('\n')}
              </td>
              <td className={`${cell} border-t-0 border-l-0`}>{row.weight}</td>
              <td className={`${cell} border-t-0 border-l-0`}>{row.measurement}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={`${cell} border-t-0`}>
        <span className="font-bold">Freight Details:</span> {model.freightDetails || '—'}
        <span className="ml-4 font-bold">ONBOARD DATE:</span> {model.onboardDate || '—'}
      </div>
      <FreightClosing model={model} />
    </div>
  );
}
