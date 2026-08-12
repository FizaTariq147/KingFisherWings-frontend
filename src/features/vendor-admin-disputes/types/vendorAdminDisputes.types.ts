export interface AdminVendorDispute {
  id: string;
  invoiceId?: string;
  invoiceNumber?: string;
  partyId?: string;
  partyName?: string;
  reason?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  staffNotes?: string;
}

export interface ReviewVendorDisputeDto {
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  staff_notes?: string;
}
