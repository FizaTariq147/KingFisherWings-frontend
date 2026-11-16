import type { HawbOfficialModel } from '../hawbOfficial.types';
import { HAWB_DRAFT1_LAYOUT } from '../layouts/hawbDraft1.layout';
import { HawbOfficialPage } from '../HawbOfficialPage';
import { HawbDraft1DenseFace } from '../faces/HawbDraft1DenseFace';

/**
 * Format-specific document: HAWB Draft Report Format-1.
 * One copy face per page; multi-page PDF stacks nine intentional identical faces.
 */
export function HawbDraft1Document({ model }: { model: HawbOfficialModel }) {
  return (
    <HawbOfficialPage
      layout={HAWB_DRAFT1_LAYOUT}
      pageIndex={model.copyIndex}
      pageTotal={model.copyTotal}
    >
      <HawbDraft1DenseFace model={model} />
    </HawbOfficialPage>
  );
}
