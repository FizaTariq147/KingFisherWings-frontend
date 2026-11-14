import type { BlDraftClassicModel } from '../BlDraftClassicDocument';
import {
  BrandHeader,
  FieldCell,
  FreightClosing,
  PartyBox,
  cargoRows,
  cell,
} from './blFamilyShared';

/** Fresa HKG / Jasper — "NOT NEGOTIABLE UNLESS CONSIGNED TO ORDER". */
export function BlFamilyJasperDocument({ model }: { model: BlDraftClassicModel }) {
  const rows = cargoRows(model);
  return (
    <div
      data-bl-draft-sheet
      data-bl-family="jasper"
      className="relative mx-auto w-full max-w-[794px] bg-white text-[#111]"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      <BrandHeader
        model={model}
        logoSrc={model.logoUrl}
        title={'Bill of Lading not negotiable unless consigned "To Order"'}
      />
      <div className="grid grid-cols-[1.35fr_1fr_0.55fr]">
        <div className="min-w-0">
          <PartyBox title="Shipper" lines={model.shipperLines} />
          <PartyBox title="Consignee" lines={model.consigneeLines} className="border-t-0" />
          <PartyBox title="Notify Party" lines={model.notifyLines} className="border-t-0" />
        </div>
        <div className="min-w-0">
          <div className={`${cell} border-l-0`}>
            <p className="text-[8px] font-bold uppercase text-[#333]">Bill of Lading No.</p>
            <p className="mt-1 text-[13px] font-bold tracking-wide">{model.blNumber || '—'}</p>
          </div>
          <div className={`${cell} border-l-0 border-t-0 min-h-[120px]`}>
            <p className="text-[8px] font-bold uppercase text-[#333]">F/Agent Name &amp; Ref.</p>
            <p className="mt-1 font-semibold">{model.agentName || '—'}</p>
            {model.agentLines.map((line) => (
              <p key={line} className="text-[9px] leading-snug">
                {line}
              </p>
            ))}
          </div>
        </div>
        <div className={`${cell} border-l-0 flex items-center justify-center`}>
          <p className="text-center text-[12px] font-bold">{model.blNumber || '—'}</p>
        </div>
      </div>
      <div className="grid grid-cols-4">
        <FieldCell title="Place of Receipt" value={model.placeOfReceipt} className="border-t-0" />
        <FieldCell title="Port of Loading" value={model.portOfLoading} className="border-t-0 border-l-0" />
        <FieldCell title="Job No." value={model.jobRef} className="border-t-0 border-l-0" />
        <FieldCell title="Pre-carriage by" value={model.preCarriage} className="border-t-0 border-l-0" />
      </div>
      <div className="grid grid-cols-4">
        <FieldCell title="Vessel / Voyage No." value={model.vesselVoyage} className="border-t-0" />
        <FieldCell title="Port of Discharge" value={model.portOfDischarge} className="border-t-0 border-l-0" />
        <FieldCell title="Place of Delivery" value={model.placeOfDelivery} className="border-t-0 border-l-0" />
        <FieldCell title="No. of Bills of Lading" value={model.numberOfBls} className="border-t-0 border-l-0" />
      </div>
      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr className="bg-[#f3f3f3]">
            <th className={`${cell} border-t-0 text-left`}>Container No. / Seal / Marks</th>
            <th className={`${cell} border-t-0 border-l-0 text-left`}>No. of Pkgs</th>
            <th className={`${cell} border-t-0 border-l-0 text-left`}>Description of Goods</th>
            <th className={`${cell} border-t-0 border-l-0 text-left`}>Gross Weight</th>
            <th className={`${cell} border-t-0 border-l-0 text-left`}>Measurement</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className={`${cell} border-t-0 whitespace-pre-line`}>{row.marks}</td>
              <td className={`${cell} border-t-0 border-l-0`}>{row.packages}</td>
              <td className={`${cell} border-t-0 border-l-0 whitespace-pre-line`}>{row.description}</td>
              <td className={`${cell} border-t-0 border-l-0`}>{row.weight}</td>
              <td className={`${cell} border-t-0 border-l-0`}>{row.measurement}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={`${cell} border-t-0`}>
        <span className="font-bold">Freight Details:</span> {model.freightDetails || '—'}
      </div>
      <FreightClosing model={model} />
    </div>
  );
}
