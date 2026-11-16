import type { HawbOfficialModel } from '../hawbOfficial.types';
import { HAWB_DRAFT_LAYOUT } from '../layouts/hawbDraft.layout';
import { HawbOfficialPage } from '../HawbOfficialPage';
import { HawbDraftDenseFace } from '../faces/HawbDraftDenseFace';

/** Format-specific document: HAWB Draft Report Format. */
export function HawbDraftDocument({ model }: { model: HawbOfficialModel }) {
  return (
    <HawbOfficialPage layout={HAWB_DRAFT_LAYOUT}>
      <HawbDraftDenseFace model={model} />
    </HawbOfficialPage>
  );
}
