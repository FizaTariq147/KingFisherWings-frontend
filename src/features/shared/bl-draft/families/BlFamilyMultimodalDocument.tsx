import type { BlDraftClassicModel } from '../BlDraftClassicDocument';
import {
  BrandHeader,
  FieldCell,
  FreightClosing,
  PartyBox,
  cargoRows,
  cell,
} from './blFamilyShared';

/** Fresa MULTI-MODAL TRANSPORT DOCUMENT (Consignor / Consignee or order). */
export function BlFamilyMultimodalDocument({ model }: { model: BlDraftClassicModel }) {
  const rows = cargoRows(model);
  return (
    <div
      data-bl-draft-sheet
      data-bl-family="multimodal"
      className="relative mx-auto w-full max-w-[794px] bg-white text-[#111]"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      <BrandHeader model={model} logoSrc={model.logoUrl} title="MULTI-MODAL TRANSPORT DOCUMENT" />
      <div className="grid grid-cols-2">
        <PartyBox title="Consignor" lines={model.shipperLines} />
        <div className={`${cell} border-l-0`}>
          <p className="text-[8px] font-bold uppercase">B/L No. / Document No.</p>
          <p className="mt-1 text-[14px] font-bold">{model.blNumber || '—'}</p>
          <p className="mt-2 text-[8px] font-bold uppercase">Booking / Job Ref.</p>
          <p className="font-semibold">{model.jobRef || '—'}</p>
        </div>
      </div>
      <div className="grid grid-cols-2">
        <PartyBox title="Consignee (or order)" lines={model.consigneeLines} className="border-t-0" />
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
        <PartyBox title="Notify Address" lines={model.notifyLines} className="border-t-0" />
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
      <div className="grid grid-cols-3">
        <FieldCell title="Place of Receipt" value={model.placeOfReceipt} className="border-t-0" />
        <FieldCell title="Ocean Vessel / Voyage" value={model.vesselVoyage} className="border-t-0 border-l-0" />
        <FieldCell title="Port of Loading" value={model.portOfLoading} className="border-t-0 border-l-0" />
      </div>
      <div className="grid grid-cols-3">
        <FieldCell title="Port of Discharge" value={model.portOfDischarge} className="border-t-0" />
        <FieldCell title="Place of Delivery" value={model.placeOfDelivery} className="border-t-0 border-l-0" />
        <FieldCell title="No. of Originals" value={model.numberOfBls} className="border-t-0 border-l-0" />
      </div>
      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr className="bg-[#eef6fb]">
            <th className={`${cell} border-t-0 text-left`}>Marks and Numbers</th>
            <th className={`${cell} border-t-0 border-l-0 text-left`}>
              Number and kind of packages · description of goods
            </th>
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
      <div className={`${cell} border-t-0 bg-[#fafafa]`}>
        <span className="font-bold">Freight:</span> {model.freightDetails || '—'}
      </div>
      <FreightClosing model={model} />
    </div>
  );
}
