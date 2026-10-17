import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { SectionAttachmentsPanel } from './SectionAttachmentsPanel';
import {
  OPS_SECTION_KEYS,
  OPS_SECTION_LABELS,
  type OpsSectionKey,
  type SectionAttachmentEntity,
} from './sectionAttachment.types';

/** Full section-files hub for shipment / quotation (and optional job). */
export function EntitySectionFilesPanel({
  entity,
  entityId,
  sections = OPS_SECTION_KEYS,
  title = 'Section files',
}: {
  entity: SectionAttachmentEntity;
  entityId: string;
  sections?: OpsSectionKey[];
  title?: string;
}) {
  const [section, setSection] = useState<OpsSectionKey>(sections[0] ?? 'deposits');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div className="space-y-3 px-4 pb-4">
        <p className="text-[12px] text-[var(--color-neutral-500)]">
          Uploads land on Documents and can be shared with customer/vendor portals. PDF and images
          open in the browser; other types download.
        </p>
        <label className="block space-y-1">
          <span className="text-[11px] font-medium text-[var(--color-neutral-600)]">Section</span>
          <select
            className="h-8 w-full max-w-md rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2 text-[13px]"
            value={section}
            onChange={(e) => setSection(e.target.value as OpsSectionKey)}
          >
            {sections.map((key) => (
              <option key={key} value={key}>
                {OPS_SECTION_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <SectionAttachmentsPanel
          key={section}
          entity={entity}
          entityId={entityId}
          section={section}
        />
      </div>
    </Card>
  );
}
