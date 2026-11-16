import { HAWB_ORIGINAL2_LAYOUT } from '../layouts/hawbOriginal2.layout';
import type { HawbOfficialModel } from '../hawbOfficial.types';
import { HawbOfficialPage } from '../HawbOfficialPage';
import { HawbSparseOverlayFace } from '../faces/HawbSparseOverlayFace';

type Props = {
  model: HawbOfficialModel;
  /** Digital default true; physical preprinted stationery print should pass false. */
  showUnderlay?: boolean;
};

/** Format-specific document: HAWB Original Pre-Printed Format-2. */
export function HawbOriginal2Document({ model, showUnderlay = true }: Props) {
  const layout = HAWB_ORIGINAL2_LAYOUT;
  return (
    <HawbOfficialPage layout={layout}>
      <HawbSparseOverlayFace layout={layout} model={model} showUnderlay={showUnderlay} />
    </HawbOfficialPage>
  );
}
