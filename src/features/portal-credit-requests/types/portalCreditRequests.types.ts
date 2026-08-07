export interface PortalCreditLimitRequestDto { requested_limit: number; justification: string; }
export interface PortalCreditLimitRequest {
  id: string; requestedLimit?: number; justification?: string; status?: string;
  createdAt?: string; reviewNotes?: string; approvedLimit?: number;
}
