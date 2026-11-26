import { HAWB_ORIGINAL1_LAYOUT } from '../layouts/hawbOriginal1.layout';
import type { HawbOfficialModel } from '../hawbOfficial.types';
import { HawbOfficialPage } from '../HawbOfficialPage';
import { HawbSparseOverlayFace } from '../faces/HawbSparseOverlayFace';

type Props = {
  model: HawbOfficialModel;
  /**
   * Digital PDF matches Fresa Original-1: sparse data islands only
   * (no Draft dense grid). Underlay boxes are optional for print preview.
   * Pass false for ink-only on physical preprinted stationery.
   */
  showUnderlay?: boolean;
};

/**
 * HAWB Original Pre-Printed Format-1 (737×923).
 * Fresa sample is data-only sparse overlay — never the Draft dense face.
 */
export function HawbOriginal1Document({ model, showUnderlay = false }: Props) {
  const layout = HAWB_ORIGINAL1_LAYOUT;
  return (
    <HawbOfficialPage layout={layout}>
      <HawbSparseOverlayFace layout={layout} model={model} showUnderlay={showUnderlay} />
    </HawbOfficialPage>
  );
}
