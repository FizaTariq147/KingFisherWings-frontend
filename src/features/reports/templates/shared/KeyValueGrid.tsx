import { colors } from './docStyles';

type Props = {
  items: Array<{ label: string; value?: string }>;
  columns?: 2 | 3 | 4;
};

export function KeyValueGrid({ items, columns = 3 }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 6,
        marginBottom: 10,
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            border: `1px solid ${colors.line}`,
            padding: '6px 8px',
            background: '#fff',
          }}
        >
          <div style={{ fontSize: 8, fontWeight: 700, color: colors.muted, textTransform: 'uppercase' }}>
            {item.label}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>{item.value || '—'}</div>
        </div>
      ))}
    </div>
  );
}
