import {
  KINGFISHER_TC_HEADER_FOOTER as TC,
  KINGFISHER_TC_HEADER_TAGLINE,
} from '../../../constants/kingfisherTermsBrandColors';

type ColorBarProps = {
  /** Match T&C top bar height (thicker) vs under-header hairline. */
  size?: 'lg' | 'sm';
  className?: string;
  /** RTL layouts reverse the orange/navy split. */
  reverse?: boolean;
};

/** Navy | orange brand stripe as on KingFisher Terms & Conditions. */
export function TcBrandColorBar({ size = 'lg', className = '', reverse = false }: ColorBarProps) {
  const h = size === 'lg' ? 'h-2.5' : 'h-1';
  const navy = <div className="w-[68%]" style={{ backgroundColor: TC.navy }} />;
  const orange = <div className="w-[32%]" style={{ backgroundColor: TC.orange }} />;
  return (
    <div className={`flex w-full ${h} ${className}`}>
      {reverse ? (
        <>
          {orange}
          {navy}
        </>
      ) : (
        <>
          {navy}
          {orange}
        </>
      )}
    </div>
  );
}

type TaglineProps = {
  className?: string;
  text?: string;
};

/** Orange eyebrow / tagline used under titles on the T&C header. */
export function TcBrandTagline({
  className = '',
  text = KINGFISHER_TC_HEADER_TAGLINE,
}: TaglineProps) {
  return (
    <p
      className={`text-[8px] font-semibold uppercase tracking-[0.12em] ${className}`}
      style={{ color: TC.orange }}
    >
      {text}
    </p>
  );
}
