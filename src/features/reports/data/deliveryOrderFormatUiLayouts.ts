import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

import { DELIVERY_ORDER_FORMAT_UI_LAYOUTS } from './deliveryOrderFormatUiLayouts.generated.ts';



/** Permanent JSON UI layouts for Delivery Order formats. */

export const DELIVERY_ORDER_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] =

  DELIVERY_ORDER_FORMAT_UI_LAYOUTS;



const byCode = new Map(

  DELIVERY_ORDER_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]),

);



const FALLBACK_LAYOUT_CODE = 'DELIVERY_ORDER_REPORT_FORMAT_17';



function resolveLayoutCode(code: string): string {

  const needle = code.trim().toUpperCase();

  if (byCode.has(needle)) return needle;

  if (/^DELIVERY_ORDER_REPORT_FORMAT_\d+$/.test(needle)) return FALLBACK_LAYOUT_CODE;

  return needle;

}



export function getDeliveryOrderFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {

  const resolved = resolveLayoutCode(code);

  if (!resolved) return undefined;

  return byCode.get(resolved);

}



export function hasDeliveryOrderFormatUiLayout(code: string): boolean {

  return Boolean(getDeliveryOrderFormatUiLayout(code));

}



export function listDeliveryOrderFormatUiLayouts(): InvoiceFormatUiLayout[] {

  return DELIVERY_ORDER_FORMAT_UI_LAYOUT_LIST;

}

