import type { ComponentType } from 'react';
import type { BlDraftClassicModel } from '../BlDraftClassicDocument';
import { BlFamilyCombinedDocument } from './BlFamilyCombinedDocument';
import { BlFamilyJasperDocument } from './BlFamilyJasperDocument';
import { BlFamilyMtDocument } from './BlFamilyMtDocument';
import { BlFamilyMultimodalDocument } from './BlFamilyMultimodalDocument';
import { BlFamilyOceanDocument } from './BlFamilyOceanDocument';

export type HblBlFamilyVariant = 'combined' | 'jasper' | 'multimodal' | 'mt' | 'ocean';

export const HBL_FAMILY_DOCUMENTS: Record<
  HblBlFamilyVariant,
  ComponentType<{ model: BlDraftClassicModel }>
> = {
  jasper: BlFamilyJasperDocument,
  combined: BlFamilyCombinedDocument,
  multimodal: BlFamilyMultimodalDocument,
  mt: BlFamilyMtDocument,
  ocean: BlFamilyOceanDocument,
};

export function resolveHblFamilyDocument(variant: string | undefined | null) {
  const key = (variant || 'combined') as HblBlFamilyVariant;
  return HBL_FAMILY_DOCUMENTS[key] || BlFamilyCombinedDocument;
}

export {
  BlFamilyCombinedDocument,
  BlFamilyJasperDocument,
  BlFamilyMtDocument,
  BlFamilyMultimodalDocument,
  BlFamilyOceanDocument,
};
