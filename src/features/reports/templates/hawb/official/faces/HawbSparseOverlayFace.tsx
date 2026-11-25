import type { CSSProperties } from 'react';
import type { HawbOfficialLayoutConfig, HawbOfficialModel } from '../hawbOfficial.types';
import { HawbPreprintedUnderlay } from './HawbPreprintedUnderlay';
import {
  HAWB_ORIGINAL1_OVERLAY_SLOTS,
  type HawbOverlaySlot,
} from '../overlays/hawbOriginal1.fields';
import { HAWB_ORIGINAL2_OVERLAY_SLOTS } from '../overlays/hawbOriginal2.fields';

type Props = {
  layout: HawbOfficialLayoutConfig;
  model: HawbOfficialModel;
  /**
   * Digital PDF default: show neutral form underlay.
   * Physical preprinted print: pass false so only overlay ink hits stationery.
   */
  showUnderlay?: boolean;
};

function slotStyle(slot: HawbOverlaySlot): CSSProperties {
  return {
    position: 'absolute',
    top: `${slot.topPct}%`,
    left: `${slot.leftPct}%`,
    width: `${slot.widthPct}%`,
    fontFamily: 'Arial, Helvetica, "Helvetica Neue", sans-serif',
    fontSize: slot.fontSizePx ?? 8,
    fontWeight: slot.fontWeight ?? 400,
    textAlign: slot.align ?? 'left',
    color: '#111111',
    lineHeight: 1.25,
    whiteSpace: 'pre-line',
    margin: 0,
    zIndex: 2,
    overflow: 'hidden',
  };
}

function valueForSlot(id: string, model: HawbOfficialModel, layout: HawbOfficialLayoutConfig): string {
  switch (id) {
    case 'branding':
      return [model.companyName, model.companyPhone ? `PHONE: ${model.companyPhone}` : '']
        .filter(Boolean)
        .join('\n');
    case 'hawbNoTop':
    case 'hawbNoMid':
    case 'hawbNoFooter':
      return model.hawbNo;
    case 'mawbTop':
    case 'mawbMid':
      return model.mawbNo;
    case 'shipper':
      return model.shipperLines.join('\n');
    case 'consignee':
      return model.consigneeLines.join('\n');
    case 'agent':
      return model.agentLines.join('\n');
    case 'agentRight':
      return model.agentLines.join('\n');
    case 'departure':
      return model.departure;
    case 'destination':
      return model.destination;
    case 'toCode':
      return model.toCode;
    case 'flight':
    case 'flightDate':
      return model.flightDate;
    case 'currency':
      return model.currency;
    case 'declaredCarriage':
      return model.declaredCarriage;
    case 'declaredCustoms':
      return model.declaredCustoms || layout.customsDefaultWhenEmpty;
    case 'insurance':
      return model.insurance;
    case 'handling':
      return model.handling || model.accounting;
    case 'marks':
      return model.natureOfGoods ? model.natureOfGoods.split('\n')[0] || '' : '';
    case 'packagesLine':
      return model.pieces ? `TOTAL : (${model.pieces}) PACKAGES` : '';
    case 'pieces':
      return model.pieces;
    case 'gross':
      return model.grossWeight;
    case 'kg':
      return model.pieces || model.grossWeight ? 'K' : '';
    case 'rateClass':
      return model.natureOfGoods ? 'S' : '';
    case 'chargeable':
      return model.chargeableWeight;
    case 'nature':
      return model.natureOfGoods;
    case 'executedOn':
      return model.executedOn;
    case 'executedAt':
      return model.executedAt;
    case 'carrierSign':
      return [model.carrier ? `AS AGENT FOR THE CARRIER, ${model.carrier}` : '', model.companyName]
        .filter(Boolean)
        .join('\n');
    default:
      return '';
  }
}

/**
 * Pre-printed original face: neutral form underlay + coordinate-mapped overlay text.
 * Slots come from Fresa reference text geometry; branding is org profile only.
 */
export function HawbSparseOverlayFace({ layout, model, showUnderlay = true }: Props) {
  const isOriginal1 = layout.variant === 'original1';
  const slots = isOriginal1 ? HAWB_ORIGINAL1_OVERLAY_SLOTS : HAWB_ORIGINAL2_OVERLAY_SLOTS;

  return (
    <div
      data-hawb-sparse-face={layout.variant}
      data-hawb-underlay={showUnderlay ? 'on' : 'off'}
      className="fn-doc"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      {showUnderlay ? (
        <HawbPreprintedUnderlay variant={isOriginal1 ? 'original1' : 'original2'} />
      ) : null}

      {/* Issued-by / carrier logo — right of shipper cell (never over shipper text). */}
      {model.logoUrl ? (
        <img
          src={model.logoUrl}
          alt=""
          style={{
            position: 'absolute',
            top: isOriginal1 ? '4.5%' : '4.2%',
            left: isOriginal1 ? '50%' : '49%',
            // Keep inside issuing-agent band without crowding borders.
            height: 28,
            maxWidth: 100,
            objectFit: 'contain',
            zIndex: 3,
          }}
        />
      ) : null}

      {slots.map((slot) => {
        const value = valueForSlot(slot.id, model, layout);
        if (!value) return null;
        // Original-2 Fresa pin: top/footer HAWB nos are bold black (not inverted boxes).
        const emphasize =
          slot.id === 'hawbNoTop' || slot.id === 'hawbNoFooter'
            ? { fontWeight: 800 as const, fontSize: (slot.fontSizePx ?? 8) + 1 }
            : {};
        return (
          <p key={slot.id} data-hawb-slot={slot.id} style={{ ...slotStyle(slot), ...emphasize }}>
            {value}
          </p>
        );
      })}
    </div>
  );
}
