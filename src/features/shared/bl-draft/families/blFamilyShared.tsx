import type { BlDraftClassicModel } from '../BlDraftClassicDocument';

export const cell =
  'border border-[#1a1a1a] px-1.5 py-1 align-top text-[9px] leading-snug text-[#111]';
export const label = 'text-[8px] font-bold uppercase tracking-wide text-[#333]';

export function PartyBox({
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

export function FieldCell({
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

export function cargoRows(model: BlDraftClassicModel) {
  return model.containerRows.length > 0
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
}

export function BrandHeader({
  model,
  title,
  logoSrc,
}: {
  model: BlDraftClassicModel;
  title: string;
  logoSrc?: string;
}) {
  const src = (logoSrc || model.logoUrl || '').trim();
  return (
    <div className="flex items-start justify-between gap-3 border border-[#1a1a1a] border-b-0 px-3 py-2">
      <div className="flex min-w-0 items-start gap-2">
        {src ? (
          <img src={src} alt="" className="h-12 w-auto max-w-[120px] object-contain" />
        ) : null}
        <div className="min-w-0 pt-0.5">
          {model.companyName ? (
            <p className="text-[12px] font-bold uppercase leading-tight text-[#0A2942]">
              {model.companyName}
            </p>
          ) : null}
          <p className="text-[8px] text-[#555]">House Bill of Lading</p>
        </div>
      </div>
      <div className="max-w-[300px] text-right">
        <p className="text-[10px] font-bold uppercase leading-tight tracking-wide text-[#0A2942]">
          {title}
        </p>
      </div>
    </div>
  );
}

export function FreightClosing({ model }: { model: BlDraftClassicModel }) {
  return (
    <div className={`${cell} border-t-0 relative min-h-[140px]`}>
      <p className="text-[8px] leading-relaxed">
        RECEIVED by the Carrier the Goods as specified above in apparent good order and condition
        unless otherwise stated, to be transported subject to the terms and conditions of this Bill
        of Lading. In WITNESS whereof original Bill(s) of Lading have been signed; one being
        accomplished, the others to be void.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[9px] font-bold">Signed on behalf of the Carrier</p>
          {model.companyName ? (
            <p className="mt-3 text-[11px] font-bold uppercase">{model.companyName}</p>
          ) : null}
          <p className="mt-3 text-[9px] font-bold">AS AGENT FOR THE CARRIER</p>
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
  );
}
