export const ORGANIZATION_API = {
  profile: '/organization/profile',
  bankAccounts: '/organization/bank-accounts',
  bankAccountById: (id: string) => `/organization/bank-accounts/${id}`,
  numberFormats: '/organization/number-formats',
  numberFormatByType: (documentType: string) =>
    `/organization/number-formats/${encodeURIComponent(documentType)}`,
  numberFormatPreview: (documentType: string) =>
    `/organization/number-formats/${encodeURIComponent(documentType)}/preview`,
} as const;
