import logo from '@/assets/logo.png';

export type BlDraftClassicModel = {
  blNumber: string;
  jobRef: string;
  agentName: string;
  agentLines: string[];
  preparedBy: string;
  shipperLines: string[];
  consigneeLines: string[];
  notifyLines: string[];
  placeOfReceipt: string;
  portOfLoading: string;
  preCarriage: string;
  vesselVoyage: string;
  portOfDischarge: string;
  placeOfDelivery: string;
  numberOfBls: string;
  containerRows: Array<{
    marks: string;
    packages: string;
    description: string;
    weight: string;
    measurement: string;
  }>;
  totalInWords: string;
  onboardDate: string;
  freightDetails: string;
  placeAndDateOfIssue: string;
  carrierName: string;
  companyName: string;
};

const cell = 'border border-[#1a1a1a] px-1.5 py-1 align-top text-[9px] leading-snug text-[#111]';
const label = 'text-[8px] font-bold uppercase tracking-wide text-[#333]';

function PartyBox({
  title,
  lines,
  className = '',
}: {
  title: string;
  lines: string[];
  className?: string;
}) {
  return (
    <div className={`${cell} ${className}`}>
      <p className={label}>{title}</p>
      <div className="mt-0.5 min-h-[52px] whitespace-pre-line font-medium">
        {(lines.length ? lines : ['—']).join('\n')}
      </div>
    </div>
  );
}

function FieldCell({
  title,
  value,
  className = '',
}: {
  title: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`${cell} ${className}`}>
      <p className={label}>{title}</p>
      <p className="mt-0.5 font-semibold">{value || '—'}</p>
    </div>
  );
}

/**
 * Classic HBL draft form matching Fresa `fg_hbl_hkg_rpm_ref_245.pdf` structure,
 * with KingFisher logo / company chrome.
 */
export function BlDraftClassicDocument({ model }: { model: BlDraftClassicModel }) {
  const rows =
    model.containerRows.length > 0
      ? model.containerRows
      : [
          {
            marks: '—',
            packages: '—',
            description: '—',
            weight: '—',
            measurement: '—',
          },
        ];

  return (
    <div
      data-bl-draft-sheet
      className="relative mx-auto w-full max-w-[794px] bg-white text-[#111]"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border border-[#1a1a1a] border-b-0 px-3 py-2">
        <div className="flex min-w-0 items-start gap-2">
          <img src={logo} alt="KingFisher" className="h-12 w-auto object-contain" />
          <div className="min-w-0 pt-0.5">
            <p className="text-[12px] font-bold uppercase leading-tight text-[#0A2942]">
              {model.companyName || 'KingFisher Wings'}
            </p>
            <p className="text-[8px] text-[#555]">House Bill of Lading · Draft</p>
          </div>
        </div>
        <div className="max-w-[280px] text-right">
          <p className="text-[10px] font-bold uppercase leading-tight tracking-wide text-[#0A2942]">
            Bill of Lading not negotiable unless consigned &quot;To Order&quot;
          </p>
        </div>
      </div>

      {/* Parties + BL meta */}
      <div className="grid grid-cols-[1.35fr_1fr_0.55fr]">
        <div className="min-w-0">
          <PartyBox title="Shipper" lines={model.shipperLines} />
          <PartyBox title="Consignee" lines={model.consigneeLines} className="border-t-0" />
          <PartyBox title="Notify Party" lines={model.notifyLines} className="border-t-0" />
        </div>
        <div className="min-w-0">
          <div className={`${cell} border-l-0`}>
            <p className={label}>Bill of Lading No.</p>
            <p className="mt-1 text-[13px] font-bold tracking-wide">{model.blNumber || '—'}</p>
          </div>
          <div className={`${cell} border-l-0 border-t-0 min-h-[120px]`}>
            <p className={label}>F/Agent Name &amp; Ref.</p>
            <p className="mt-1 font-semibold">{model.agentName || '—'}</p>
            {(model.agentLines.length ? model.agentLines : []).map((line) => (
              <p key={line} className="text-[9px] leading-snug">
                {line}
              </p>
            ))}
            <p className="mt-2 text-[8px] text-[#444]">
              Prepared By : {model.preparedBy || '—'}
            </p>
          </div>
        </div>
        <div className={`${cell} border-l-0 flex items-center justify-center`}>
          <p className="text-center text-[12px] font-bold tracking-wide">{model.blNumber || '—'}</p>
        </div>
      </div>

      {/* Route row 1 */}
      <div className="grid grid-cols-4">
        <FieldCell title="Place of Receipt" value={model.placeOfReceipt} className="border-t-0" />
        <FieldCell title="Port of Loading" value={model.portOfLoading} className="border-t-0 border-l-0" />
        <FieldCell
          title="Job No. / Pre-carriage by"
          value={model.preCarriage}
          className="border-t-0 border-l-0"
        />
        <FieldCell title="Job ref" value={model.jobRef} className="border-t-0 border-l-0" />
      </div>

      {/* Route row 2 */}
      <div className="grid grid-cols-4">
        <FieldCell title="Vessel / Voyage No." value={model.vesselVoyage} className="border-t-0" />
        <FieldCell
          title="Port of Discharge"
          value={model.portOfDischarge}
          className="border-t-0 border-l-0"
        />
        <FieldCell
          title="Place of Delivery"
          value={model.placeOfDelivery}
          className="border-t-0 border-l-0"
        />
        <FieldCell
          title="No. of Bills of Lading"
          value={model.numberOfBls}
          className="border-t-0 border-l-0"
        />
      </div>

      {/* Cargo table */}
      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr className="bg-[#f3f3f3]">
            <th className={`${cell} border-t-0 text-left font-bold`}>
              Container No. / Seal No./ Mark &amp; No.
            </th>
            <th className={`${cell} border-t-0 border-l-0 text-left font-bold`}>
              No. of Pkgs or Shipping Units
            </th>
            <th className={`${cell} border-t-0 border-l-0 text-left font-bold`}>
              Description of Goods &amp; Pkgs.
            </th>
            <th className={`${cell} border-t-0 border-l-0 text-left font-bold`}>Gross Weight</th>
            <th className={`${cell} border-t-0 border-l-0 text-left font-bold`}>Measurement</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className={`${cell} border-t-0 whitespace-pre-line`}>{row.marks}</td>
              <td className={`${cell} border-t-0 border-l-0`}>{row.packages}</td>
              <td className={`${cell} border-t-0 border-l-0 whitespace-pre-line`}>
                {row.description}
              </td>
              <td className={`${cell} border-t-0 border-l-0`}>{row.weight}</td>
              <td className={`${cell} border-t-0 border-l-0`}>{row.measurement}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-[1.6fr_1fr]">
        <div className={`${cell} border-t-0`}>
          <span className="font-bold">Total Number of Containers or Packages (In words)</span>
          <span className="ml-1">: {model.totalInWords || '—'}</span>
        </div>
        <div className={`${cell} border-t-0 border-l-0`}>
          <span className="font-bold">ONBOARD DATE :</span> {model.onboardDate || '—'}
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className={`${cell} border-t-0`}>
          <p className="font-bold">Freight Details, Charges etc :</p>
          <p className="mt-0.5 whitespace-pre-line">{model.freightDetails || '—'}</p>
        </div>
        <div className={`${cell} border-t-0 border-l-0`}>
          <p className="font-bold">Excess Value Declaration:</p>
          <p className="mt-0.5">Refer to Clause 6(4)(B) + (C) on reverse side</p>
        </div>
      </div>

      <div className={`${cell} border-t-0 relative min-h-[150px]`}>
        <p className="text-[8px] leading-relaxed">
          RECEIVED by the Carrier the Goods as specified above in apparent good order and
          condition unless otherwise stated, to be transported to such place as agreed,
          authorised or permitted herein and subject to all the terms and conditions appearing
          on the front and reverse of this Bill of Lading to which the Merchant agrees by
          accepting this Bill of Lading, any local privileges and customs notwithstanding. The
          particulars given above as stated by the shipper and the weight, measure, quantity,
          condition, contents and value of the Goods are unknown to the Carrier. In WITNESS
          whereof one (1) original Bill of Lading has been signed if not otherwise stated
          above, the same being accomplished the others, if any, to be void. If required by
          the Carrier one (1) original Bill of Lading must be surrendered duly endorsed in
          exchange for the Goods or delivery order.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] font-bold">Signed on behalf of the Carrier.</p>
            <p className="mt-1 text-[9px]">By</p>
            <p className="mt-3 text-[11px] font-bold uppercase">
              {model.companyName || 'KingFisher Wings'}
            </p>
            <p className="mt-4 text-[9px] font-bold">AS AGENT FOR THE CARRIER</p>
            <p className="text-[12px] font-bold uppercase">{model.carrierName || '—'}</p>
          </div>
          <div className="relative flex flex-col items-end justify-end pr-2">
            <p
              className="select-none text-[42px] font-black uppercase leading-none tracking-[0.2em] text-[#c62828]/25"
              aria-hidden
            >
              DRAFT
            </p>
            <p className="mt-3 text-right text-[9px]">
              <span className="font-bold">Place and Date of Issue</span>
              <br />
              {model.placeAndDateOfIssue || '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
