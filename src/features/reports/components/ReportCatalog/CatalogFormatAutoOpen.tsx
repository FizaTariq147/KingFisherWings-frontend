import { isInvoiceReportFormatCode } from '../../types/invoiceFormatPreview.types';
import { isAccountsFormatCode } from '../../constants/accountsFormatCatalog';
import { isWmsFormatCode } from '../../constants/wmsFormatCatalog';
import { isArrivalNoticeFormatCode } from '../../constants/arrivalNoticeFormatCatalog';
import { isDeliveryOrderFormatCode } from '../../constants/deliveryOrderFormatCatalog';
import { isHawbFormatCode, getHawbFormatSpec } from '../../constants/hawbFormatCatalog';
import { isHblFormatCode, getHblFormatSpec } from '../../constants/hblFormatCatalog';
import { isOtherReportsFormatCode } from '../../constants/otherReportsFormatCatalog';
import { isQuotationFormatCode } from '../../constants/quotationFormatCatalog';
import { isOpsListFormatCode } from '../../constants/opsListFormatCatalog';
import { isCommercialExtraFormatCode } from '../../constants/commercialExtraFormatCatalog';
import { isSeaDocsExtraFormatCode } from '../../constants/seaDocsExtraFormatCatalog';
import { isLeftoverFormatCode } from '../../constants/leftoverFormatCatalog';
import { hasInvoiceFormatUiLayout } from '../../data/invoiceFormatUiLayouts';
import { hasAccountsFormatUiLayout } from '../../data/accountsFormatUiLayouts';
import { hasWmsFormatUiLayout } from '../../data/wmsFormatUiLayouts';
import { hasArrivalNoticeFormatUiLayout } from '../../data/arrivalNoticeFormatUiLayouts';
import { hasDeliveryOrderFormatUiLayout } from '../../data/deliveryOrderFormatUiLayouts';
import { hasOtherReportsFormatUiLayout } from '../../data/otherReportsFormatUiLayouts';
import { hasQuotationFormatUiLayout } from '../../data/quotationFormatUiLayouts';
import { hasOpsListFormatUiLayout } from '../../data/opsListFormatUiLayouts';
import { hasCommercialExtraFormatUiLayout } from '../../data/commercialExtraFormatUiLayouts';
import { hasSeaDocsExtraFormatUiLayout } from '../../data/seaDocsExtraFormatUiLayouts';
import { hasLeftoverFormatUiLayout } from '../../data/leftoverFormatUiLayouts';
import { hasAnyFormatUiLayout } from '../../data/resolveAnyFormatUiLayout';
import { isClientFlowInvoiceCode } from '../../flow/invoiceFlowOptions';
import { hasCatalogLayoutPdf } from '../../utils/generateCatalogLayoutPdf';
import { isClientLayoutFallbackEnabled } from '../../utils/clientLayoutFallback';
import type { ReportContextIds } from '../../utils/reportParameterUtils';
import { InvoiceFormatAutoPdf } from './InvoiceFormatAutoPdf';
import { AccountsFormatAutoPdf } from './AccountsFormatAutoPdf';
import { WmsFormatAutoPdf } from './WmsFormatAutoPdf';
import { ArrivalNoticeFormatAutoPdf } from './ArrivalNoticeFormatAutoPdf';
import { DeliveryOrderFormatAutoPdf } from './DeliveryOrderFormatAutoPdf';
import { HawbFormatAutoPdf } from './HawbFormatAutoPdf';
import { HblFormatAutoPdf } from './HblFormatAutoPdf';
import { OtherReportsFormatAutoPdf } from './OtherReportsFormatAutoPdf';
import { QuotationFormatAutoPdf } from './QuotationFormatAutoPdf';
import { OpsListFormatAutoPdf } from './OpsListFormatAutoPdf';
import { CommercialExtraFormatAutoPdf } from './CommercialExtraFormatAutoPdf';
import { SeaDocsExtraFormatAutoPdf } from './SeaDocsExtraFormatAutoPdf';
import { LeftoverFormatAutoPdf } from './LeftoverFormatAutoPdf';
import { CatalogReportAutoPdf } from './CatalogReportAutoPdf';
import { FlowInvoiceAutoPdf } from './FlowInvoiceAutoPdf';

type Props = {
  code: string;
  context?: ReportContextIds | null;
  autoOpen?: boolean;
};

/**
 * Opens the matching Freightnest client PDF for a catalogue code.
 * Used so the format screen behaves like the sample index: click name → PDF,
 * without Import / Bind / Activate / Generate first.
 */
export function CatalogFormatAutoOpen({ code, context, autoOpen = true }: Props) {
  if (!code || !isClientLayoutFallbackEnabled()) return null;

  if (isClientFlowInvoiceCode(code)) {
    return <FlowInvoiceAutoPdf code={code} context={context} autoOpen={autoOpen} />;
  }

  const invoiceId = context?.invoice_id;
  const quotationId = context?.quotation_id;

  if (isInvoiceReportFormatCode(code) && hasInvoiceFormatUiLayout(code)) {
    return (
      <InvoiceFormatAutoPdf
        code={code}
        invoiceId={invoiceId}
        context={context}
        autoOpen={autoOpen}
      />
    );
  }
  if (isAccountsFormatCode(code) && hasAccountsFormatUiLayout(code)) {
    return <AccountsFormatAutoPdf code={code} context={context} autoOpen={autoOpen} />;
  }
  if (isWmsFormatCode(code) && hasWmsFormatUiLayout(code)) {
    return <WmsFormatAutoPdf code={code} context={context} autoOpen={autoOpen} />;
  }
  if (
    isArrivalNoticeFormatCode(code) &&
    (hasArrivalNoticeFormatUiLayout(code) || hasCatalogLayoutPdf(code))
  ) {
    return <ArrivalNoticeFormatAutoPdf code={code} context={context} autoOpen={autoOpen} />;
  }
  if (
    isDeliveryOrderFormatCode(code) &&
    (hasDeliveryOrderFormatUiLayout(code) || hasCatalogLayoutPdf(code))
  ) {
    return <DeliveryOrderFormatAutoPdf code={code} context={context} autoOpen={autoOpen} />;
  }
  if (isHawbFormatCode(code) && Boolean(getHawbFormatSpec(code))) {
    return <HawbFormatAutoPdf code={code} context={context} autoOpen={autoOpen} />;
  }
  if (isHblFormatCode(code) && Boolean(getHblFormatSpec(code))) {
    return <HblFormatAutoPdf code={code} context={context} autoOpen={autoOpen} />;
  }
  if (isOtherReportsFormatCode(code) && hasOtherReportsFormatUiLayout(code)) {
    return <OtherReportsFormatAutoPdf code={code} context={context} autoOpen={autoOpen} />;
  }
  if (isQuotationFormatCode(code) && hasQuotationFormatUiLayout(code)) {
    return (
      <QuotationFormatAutoPdf
        code={code}
        quotationId={quotationId}
        context={context}
        autoOpen={autoOpen}
      />
    );
  }
  if (isOpsListFormatCode(code) && hasOpsListFormatUiLayout(code)) {
    return <OpsListFormatAutoPdf code={code} context={context} autoOpen={autoOpen} />;
  }
  if (isCommercialExtraFormatCode(code) && hasCommercialExtraFormatUiLayout(code)) {
    return <CommercialExtraFormatAutoPdf code={code} context={context} autoOpen={autoOpen} />;
  }
  if (isSeaDocsExtraFormatCode(code) && hasSeaDocsExtraFormatUiLayout(code)) {
    return <SeaDocsExtraFormatAutoPdf code={code} context={context} autoOpen={autoOpen} />;
  }
  if (isLeftoverFormatCode(code) && hasLeftoverFormatUiLayout(code)) {
    return <LeftoverFormatAutoPdf code={code} context={context} autoOpen={autoOpen} />;
  }
  if (hasAnyFormatUiLayout(code) || hasCatalogLayoutPdf(code)) {
    return (
      <CatalogReportAutoPdf
        code={code}
        invoiceId={invoiceId}
        context={context}
        autoOpen={autoOpen}
      />
    );
  }

  return null;
}
