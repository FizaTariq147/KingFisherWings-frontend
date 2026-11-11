import { colors } from './docStyles';

type Props = {
  labels?: string[];
};

export function SignatureBlock({
  labels = ['Authorized signature', 'Stamp / date'],
}: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(labels.length, 3)}, 1fr)`,
        gap: 16,
        marginTop: 28,
      }}
    >
      {labels.map((label) => (
        <div key={label}>
          <div style={{ borderTop: `1px solid ${colors.ink}`, marginTop: 36, marginBottom: 4 }} />
          <div style={{ fontSize: 9, color: colors.muted }}>{label}</div>
        </div>
      ))}
    </div>
  );
}
