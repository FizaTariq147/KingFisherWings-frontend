/**
 * @deprecated T&C pages no longer overlay logo/company chrome — kept for call-site
 * compatibility. Official T&C PDF is appended as-is (original fonts).
 */
export type CustomerTermsBranding = {
  logoUrl: string;
  companyName: string;
};

/** No-op branding — appendOfficialCustomerTermsPdf ignores overlays. */
export async function resolveCustomerTermsBranding(): Promise<CustomerTermsBranding> {
  return {
    logoUrl: '',
    companyName: '',
  };
}
