import type { CSSProperties } from 'react';
import type { HawbOfficialLayoutConfig, HawbOfficialModel } from '../hawbOfficial.types';
import { HawbPreprintedUnderlay } from './HawbPreprintedUnderlay';
import {
  HAWB_ORIGINAL1_OVERLAY_SLOTS,
  type HawbOverlaySlot,
} from '../overlays/hawbOriginal1.fields';
import { HAWB_ORIGINAL2_OVERLAY_SLOTS } from '../overlays/hawbOriginal2.fields';
import { sparseValueForSlot } from '../sparseSlotValues';

type Props = {
  layout: HawbOfficialLayoutConfig;
  model: HawbOfficialModel;
  /**
   * Digital PDF default for Originals: false (Fresa pin is data-only white).
   * Physical preprinted print: also false. Pass true only for debug underlay.
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
    color: '#000000',
    lineHeight: 1.15,
    whiteSpace: 'pre-line',
    margin: 0,
    padding: 0,
    zIndex: 2,
    overflow: 'hidden',
    maxHeight:
      slot.id === 'shipper' || slot.id === 'consignee' || slot.id === 'nature' ? '9%' : undefined,
  };
}

/**
 * Pre-printed original face: coordinate-mapped overlay text only (Fresa sparse).
 * Optional underlay is for debug — Generate uses vector sparse PDF instead.
 */
export function HawbSparseOverlayFace({ layout, model, showUnderlay = false }: Props) {
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

      {model.logoUrl ? (
        <img
          src={model.logoUrl}
          alt=""
          style={{
            position: 'absolute',
            top: isOriginal1 ? '3.8%' : '3.6%',
            left: isOriginal1 ? '52%' : '51%',
            height: 22,
            maxWidth: 84,
            objectFit: 'contain',
            zIndex: 3,
          }}
        />
      ) : null}

      {slots.map((slot) => {
        if (slot.id === 'branding' && model.logoUrl) return null;
        const value = sparseValueForSlot(slot.id, model, layout);
        if (!value) return null;
        const emphasize =
          slot.id === 'hawbNoTop' || slot.id === 'hawbNoFooter' || slot.id === 'mawbTop'
            ? { fontWeight: 700 as const }
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
