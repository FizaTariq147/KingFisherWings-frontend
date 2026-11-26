import { HAWB_ORIGINAL2_LAYOUT } from '../layouts/hawbOriginal2.layout';
import type { HawbOfficialModel } from '../hawbOfficial.types';
import { HawbOfficialPage } from '../HawbOfficialPage';
import { HawbSparseOverlayFace } from '../faces/HawbSparseOverlayFace';

type Props = {
  model: HawbOfficialModel;
  /**
   * Digital PDF matches Fresa Original-2: sparse data islands only
   * (no Draft-2 dense grid). Pass false for physical preprinted stationery.
   */
  showUnderlay?: boolean;
};

/**
 * HAWB Original Pre-Printed Format-2 (595×845).
 * Fresa sample is data-only sparse overlay — never the Draft-2 dense face.
 */
export function HawbOriginal2Document({ model, showUnderlay = false }: Props) {
  const layout = HAWB_ORIGINAL2_LAYOUT;
  return (
    <HawbOfficialPage layout={layout}>
      <HawbSparseOverlayFace layout={layout} model={model} showUnderlay={showUnderlay} />
    </HawbOfficialPage>
  );
}
