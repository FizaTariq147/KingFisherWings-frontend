import { colors } from './docStyles';

type Props = {
  title: string;
  name?: string;
  lines?: string[];
  accent?: string;
};

export function PartyBlock({ title, name, lines = [], accent = colors.band }: Props) {
  const body = lines.length ? lines : name ? [name] : ['—'];
  return (
    <div
      style={{
        border: `1px solid ${colors.line}`,
        background: colors.wash,
        minHeight: 72,
        padding: 8,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      {body.map((line, i) => (
        <div key={`${i}-${line}`} style={{ fontSize: 10, color: colors.ink }}>
          {line}
        </div>
      ))}
    </div>
  );
}

type TripleProps = {
  shipper: { name?: string; lines?: string[] };
  consignee: { name?: string; lines?: string[] };
  notify: { name?: string; lines?: string[] };
  accent?: string;
};

export function PartyTriple({ shipper, consignee, notify, accent }: TripleProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
      <PartyBlock title="Shipper" name={shipper.name} lines={shipper.lines} accent={accent} />
      <PartyBlock
        title="Consignee"
        name={consignee.name}
        lines={consignee.lines}
        accent={accent}
      />
      <PartyBlock title="Notify" name={notify.name} lines={notify.lines} accent={accent} />
    </div>
  );
}
