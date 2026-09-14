import type { InvoiceFormatPreview } from '../../../types/invoiceFormatPreview.types';
import {
  ArabicRtlLayout,
  DebitVietnamLayout,
  GenericLayout,
  LandLayout,
  PreprintedLayout,
  SimpleLayout,
  SummaryLayout,
  TaxIndiaLayout,
  UsaLayout,
  WarehouseLayout,
} from './layouts';

/** Pick the Fresa-style layout shell for this catalog format. */
export function InvoiceFormatLayoutByKind({ preview }: { preview: InvoiceFormatPreview }) {
  switch (preview.layoutKind) {
    case 'tax_india':
      return <TaxIndiaLayout preview={preview} />;
    case 'summary':
      return <SummaryLayout preview={preview} />;
    case 'simple':
      return <SimpleLayout preview={preview} />;
    case 'arabic_rtl':
      return <ArabicRtlLayout preview={preview} />;
    case 'usa':
      return <UsaLayout preview={preview} />;
    case 'land':
      return <LandLayout preview={preview} />;
    case 'preprinted':
      return <PreprintedLayout preview={preview} />;
    case 'warehouse':
      return <WarehouseLayout preview={preview} />;
    case 'debit_vietnam':
      return <DebitVietnamLayout preview={preview} />;
    case 'generic':
    default:
      return <GenericLayout preview={preview} />;
  }
}
