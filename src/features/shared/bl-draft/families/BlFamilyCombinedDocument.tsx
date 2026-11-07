import logo from '@/assets/logo.png';
import type { BlDraftClassicModel } from '../BlDraftClassicDocument';
import {
  BrandHeader,
  FieldCell,
  FreightClosing,
  PartyBox,
  cargoRows,
  cell,
} from './blFamilyShared';

/** Fresa Format-11 style — Combined Transport / Port to Port. */
export function BlFamilyCombinedDocument({ model }: { model: BlDraftClassicModel }) {
  const rows = cargoRows(model);
  const vesselParts = model.vesselVoyage.split('/').map((s) => s.trim()).filter(Boolean);
  return (
    <div
      data-bl-draft-sheet
      data-bl-family="combined"
      className="relative mx-auto w-full max-w-[794px] bg-white text-[#111]"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      <BrandHeader
        model={model}
        logoSrc={logo}
        title="Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT"
      />
      <div className="grid grid-cols-2">
        <PartyBox title="SHIPPER" lines={model.shipperLines} />
        <div className={`${cell} border-l-0`}>
          <p className="text-[8px] font-bold uppercase">Bill of Lading Number</p>
          <p className="mt-1 text-[14px] font-bold">{model.blNumber || '—'}</p>
          <p className="mt-3 text-[8px] font-bold uppercase">Job No. / Booking Ref.</p>
          <p className="font-semibold">{model.jobRef || '—'}</p>
        </div>
      </div>
      <div className="grid grid-cols-2">
        <PartyBox title="CONSIGNEE OR ORDER" lines={model.consigneeLines} className="border-t-0" />
        <div className={`${cell} border-l-0 border-t-0 text-center`}>
          <img src={logo} alt="" className="mx-auto h-10 object-contain" />
          <p className="mt-1 text-[10px] font-bold uppercase">{model.companyName}</p>
          {model.agentLines.slice(0, 3).map((l) => (
            <p key={l} className="text-[8px]">
              {l}
            </p>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2">
        <PartyBox
          title="NOTIFY ADDRESS (Carrier not responsible for failure to notify)"
          lines={model.notifyLines}
          className="border-t-0"
        />
        <div className={`${cell} border-l-0 border-t-0`}>
          <p className="text-[8px] font-bold uppercase">
            APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:
          </p>
          <p className="mt-1 font-semibold">{model.agentName}</p>
          {model.agentLines.map((l) => (
            <p key={l} className="text-[8px]">
              {l}
            </p>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2">
        <FieldCell title="Ocean Vessel" value={vesselParts[0] || model.vesselVoyage} className="border-t-0" />
        <FieldCell title="Voyage Number" value={vesselParts.slice(1).join(' / ') || '—'} className="border-t-0 border-l-0" />
      </div>
      <div className="grid grid-cols-2">
        <FieldCell title="Place of Receipt" value={model.placeOfReceipt} className="border-t-0" />
        <FieldCell title="Port of Loading" value={model.portOfLoading} className="border-t-0 border-l-0" />
      </div>
      <div className="grid grid-cols-4">
        <FieldCell title="Port of Discharge" value={model.portOfDischarge} className="border-t-0" />
        <FieldCell title="Place of Delivery" value={model.placeOfDelivery} className="border-t-0 border-l-0" />
        <FieldCell title="Freight Charges" value="PREPAID" className="border-t-0 border-l-0" />
        <FieldCell title="No. of Original B/L" value={model.numberOfBls} className="border-t-0 border-l-0" />
      </div>
      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr className="bg-[#f3f3f3]">
            <th className={`${cell} border-t-0 text-left`}>Container Nos, Seal Nos, Mark and Nos</th>
            <th className={`${cell} border-t-0 border-l-0 text-left`}>
              Number and kind of packages : description of goods
            </th>
            <th className={`${cell} border-t-0 border-l-0 text-left`}>Gross Weight(Kg)</th>
            <th className={`${cell} border-t-0 border-l-0 text-left`}>Volume</th>
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
        <span className="ml-4 font-bold">ONBOARD:</span> {model.onboardDate || '—'}
      </div>
      <FreightClosing model={model} />
    </div>
  );
}
