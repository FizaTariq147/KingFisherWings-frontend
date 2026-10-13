import { axiosInstance } from '@/lib/axios';
import { portalApiClient } from '@/lib/portalApiClient';
import { vendorApiClient } from '@/lib/vendorApiClient';
import { withGatewayRetry } from '@/lib/wakeApi';
import { unwrap } from '@/features/online-payments/utils/billingApiHelpers';
import {
  PORTAL_TOOLS_API,
  STAFF_TOOLS_API,
  VENDOR_TOOLS_API,
  type ToolsConverterKind,
} from '../api/tools.api';

export const staffToolsService = {
  async convert(kind: ToolsConverterKind, body: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(STAFF_TOOLS_API.converter(kind), body),
    );
    return unwrap(res.data);
  },
};

export const vendorToolsService = {
  async convert(kind: ToolsConverterKind, body: Record<string, unknown>) {
    const res = await vendorApiClient.post(VENDOR_TOOLS_API.converter(kind), body);
    return unwrap(res.data);
  },
};

export const portalToolsService = {
  async convert(kind: ToolsConverterKind, body: Record<string, unknown>) {
    const res = await portalApiClient.post(PORTAL_TOOLS_API.converter(kind), body);
    return unwrap(res.data);
  },
};
