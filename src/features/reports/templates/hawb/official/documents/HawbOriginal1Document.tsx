import { HAWB_ORIGINAL1_LAYOUT } from '../layouts/hawbOriginal1.layout';
import type { HawbOfficialModel } from '../hawbOfficial.types';
import { HawbOfficialPage } from '../HawbOfficialPage';
import { HawbSparseOverlayFace } from '../faces/HawbSparseOverlayFace';

type Props = {
  model: HawbOfficialModel;
  /** Digital default true; physical preprinted stationery print should pass false. */
  showUnderlay?: boolean;
};

/** Format-specific document: HAWB Original Pre-Printed Format-1 (737×923). */
export function HawbOriginal1Document({ model, showUnderlay = true }: Props) {
  const layout = HAWB_ORIGINAL1_LAYOUT;
  return (
    <HawbOfficialPage layout={layout}>
      <HawbSparseOverlayFace layout={layout} model={model} showUnderlay={showUnderlay} />
    </HawbOfficialPage>
  );
}
