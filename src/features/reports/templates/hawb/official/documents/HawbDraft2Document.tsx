import type { HawbOfficialModel } from '../hawbOfficial.types';
import { HAWB_DRAFT2_LAYOUT } from '../layouts/hawbDraft2.layout';
import { HawbOfficialPage } from '../HawbOfficialPage';
import { HawbDraft2DenseFace } from '../faces/HawbDraft2DenseFace';

/** Format-specific document: HAWB Draft Report Format-2 (Air Waybill). */
export function HawbDraft2Document({ model }: { model: HawbOfficialModel }) {
  return (
    <HawbOfficialPage layout={HAWB_DRAFT2_LAYOUT}>
      <HawbDraft2DenseFace model={model} />
    </HawbOfficialPage>
  );
}
