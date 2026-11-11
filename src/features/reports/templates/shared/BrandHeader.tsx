import { colors } from './docStyles';

type Props = {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWeb?: string;
  logoUrl?: string;
  accent?: string;
  subtitle?: string;
};

export function BrandHeader({
  companyName,
  companyAddress,
  companyPhone,
  companyEmail,
  companyWeb,
  logoUrl,
  accent = colors.band,
  subtitle,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        borderBottom: `2px solid ${accent}`,
        paddingBottom: 10,
        marginBottom: 12,
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            style={{ maxHeight: 42, maxWidth: 110, objectFit: 'contain' }}
          />
        ) : null}
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: accent }}>
            {companyName || 'KingFisher Wings'}
          </div>
          {companyAddress ? (
            <div style={{ fontSize: 10, color: colors.muted, whiteSpace: 'pre-line' }}>
              {companyAddress}
            </div>
          ) : null}
          <div style={{ fontSize: 9, color: colors.muted, marginTop: 2 }}>
            {[companyPhone, companyEmail, companyWeb].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>
      {subtitle ? (
        <div
          style={{
            alignSelf: 'flex-start',
            background: accent,
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.4,
            padding: '6px 10px',
            textTransform: 'uppercase',
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}
