import { colors } from './docStyles';

type Props = {
  children: string;
  accent?: string;
};

export function SectionTitle({ children, accent = colors.band }: Props) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: '#fff',
        background: accent,
        padding: '4px 8px',
        margin: '10px 0 6px',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </div>
  );
}
