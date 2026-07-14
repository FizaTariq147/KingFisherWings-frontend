/** Standard validation messages — keep copy consistent across modules. */
export const V = {
  required: 'This field is required',
  requiredSelect: 'Please make a selection',
  email: 'Enter a valid email address',
  emailDomain: 'Enter an email with a valid domain',
  emailMax: 'Email must be at most 255 characters',
  phone: 'Enter a valid E.164 phone (e.g. +971501234567)',
  phoneForCountry: (country: string, min: number, max: number, dial: string) =>
    min === max
      ? `Enter a valid ${country} number (${min} digits after +${dial})`
      : `Enter a valid ${country} number (${min}–${max} digits after +${dial})`,
  phoneForCountryExample: (country: string, dial: string, example: string) =>
    `Enter a valid ${country} number (e.g. +${dial}${example})`,
  vatInvalid: 'Enter a valid tax / VAT number for this country',
  postalInvalid: 'Enter a valid postal code for this country',
  timezoneForCountry: (country: string) =>
    `Timezone must be one of the zones for ${country}`,
  url: 'Enter a valid URL',
  uuid: 'Must be a valid UUID',
  countryCode: 'Use a 2-letter ISO 3166-1 alpha-2 country code (e.g. AE)',
  currencyCode: 'Use a 3-letter ISO 4217 currency code (e.g. AED)',
  dialCode: 'Use dial code with leading + (e.g. +971)',
  iataCode: 'Use a valid IATA code (2–3 alphanumeric characters)',
  icaoCode: 'Use a valid ICAO code (3–4 letters)',
  unLocode: 'Use a valid UN/LOCODE (5–10 chars, e.g. AEJEA)',
  portLocodeCountry:
    'UN/LOCODE must start with the selected country code (e.g. AE + AEJEA)',
  portMode: 'Select a valid mode (Sea, Air, Land, or Courier)',
  portLatLngPair: 'Provide both latitude and longitude, or leave both empty',
  imoNumber: 'IMO number must be exactly 7 digits',
  swiftBic: 'SWIFT/BIC must be 8 or 11 characters (e.g. BOMLAEAD)',
  awbPrefix: 'AWB prefix must be exactly 3 digits',
  hsCode: 'Enter a valid HS code (4–10 digits, optional dots; e.g. 8471.30)',
  hsDutyRate: 'Duty rate must be between 0 and 100',
  dgClass: 'Enter a valid DG class (1–9, optional subclass e.g. 3 or 2.1)',
  hsProhibitedRestricted:
    'Cannot mark both Prohibited and Restricted — banned items use Prohibited; permit-controlled items use Restricted',
  unNumber: 'UN number must be 4 digits (optional UN prefix)',
  hexColor: 'Must be a hex color (e.g. #0A66C2)',
  whitespace: 'Cannot be only spaces',
  consecutiveSpaces: 'Remove consecutive spaces',
  nameChars:
    'Use a valid name (letters required; numbers and common punctuation allowed)',
  nameLogical:
    'Enter a logical name with at least one letter (not only numbers or symbols)',
  nameEdges: 'Name cannot start or end with punctuation',
  departmentName:
    'Enter a valid and logical department name (e.g. Human Resources, Finance)',
  departmentNameLetters:
    'Department name must include at least two letters',
  departmentNameJunk:
    'Department name looks invalid — avoid codes, symbols-only, or repeated characters',
  designationName:
    'Enter a valid and logical designation name (e.g. Operations Manager, Sales Executive)',
  designationNameLetters:
    'Designation name must include at least two letters',
  designationNameJunk:
    'Designation name looks invalid — avoid codes, symbols-only, or repeated characters',
  branchName:
    'Enter a valid and logical branch name (e.g. Dubai Head Office, Airport Branch)',
  branchNameLetters:
    'Branch name must include at least two letters',
  branchNameJunk:
    'Branch name looks invalid — avoid codes, symbols-only, or repeated characters',
  minLength: (n: number) => `Must be at least ${n} characters`,
  maxLength: (n: number) => `Must be at most ${n} characters`,
  minValue: (n: number) => `Must be at least ${n}`,
  maxValue: (n: number) => `Must be at most ${n}`,
  integer: 'Must be a whole number',
  nonNegative: 'Must be zero or greater',
  positive: 'Must be greater than zero',
  passwordMin: (n: number) => `Password must be at least ${n} characters`,
  passwordUpper: 'Include at least one uppercase letter',
  passwordLower: 'Include at least one lowercase letter',
  passwordNumber: 'Include at least one number',
  passwordSpecial: 'Include at least one special character',
  passwordMatch: 'Passwords do not match',
  passwordDifferent: 'New password must be different from the current password',
  dateInvalid: 'Enter a valid date',
  dateRange: 'End date must be on or after start date',
  fileType: 'Invalid file type',
  fileSize: (mb: number) => `File must be under ${mb} MB`,
  arrayMin: (n: number) => `Select at least ${n} item${n === 1 ? '' : 's'}`,
  codeFormat: 'Use only uppercase letters, numbers, and hyphens',
  prefixFormat: 'Use only uppercase letters, numbers, underscores, and hyphens',
  latitude: 'Latitude must be between -90 and 90 (max 6 decimal places)',
  longitude: 'Longitude must be between -180 and 180 (max 6 decimal places)',
  uom: 'Select a valid unit of measure from master data',
  uomCategory: 'Enter a valid category (2–50 characters, e.g. Weight, Volume, Length, Count)',
  uomCode: 'Use a short uppercase code (e.g. CBM, KG, PCS)',
  warehouseCapacity: 'Capacity must be 0 or greater (sqm)',
  warehouseCode: 'Use an uppercase warehouse code (e.g. WH-JA3)',
  inactiveOption: 'Selected value is inactive or unavailable',
  decimals: (n: number) => `At most ${n} decimal places`,
  codeRelatedToName:
    'Code must relate to the name (e.g. Human Resources → HR or HUMAN-RESOURCES)',
  departmentCodePrefix:
    'Department code must start with the company slug/code, then the department name (e.g. KF-HUMAN-RESOURCES or KF-HR)',
  branchCodePrefix:
    'Branch code must be company prefix + branch name prefix (e.g. KF-DHO for Dubai Head Office)',
  containerSize:
    'Pick a size from the list or type your own (e.g. SIZE_40HC or 40HC)',
  containerTeu: 'TEU must be between 0 and 10 (e.g. 1, 2, 2.25)',
  containerPayload: 'Max payload must be 0 or greater (kg)',
  containerVolume: 'Volume must be 0 or greater (CBM)',
} as const;

/** Shared regex / limits for business rules. */
export const RULES = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  /**
   * Logical business / person names:
   * - Unicode letters (any language)
   * - numbers
   * - spaces and common punctuation: - ' & , ( ) . /
   */
  NAME_CHARS: /^[\p{L}\p{M}0-9\s\-'&(),./]+$/u,
  CODE_MIN: 2,
  CODE_MAX: 20,
  CODE_PATTERN: /^[A-Z0-9-]+$/,
  PREFIX_MAX: 10,
  PREFIX_PATTERN: /^[A-Z0-9_-]+$/,
  COUNTRY: /^[A-Z]{2}$/,
  CURRENCY: /^[A-Z]{3}$/,
  /** Strict-ish email local@domain */
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMAIL_MAX: 255,
  /** E.164: + then 7–15 digits total (country + national). */
  E164: /^\+[1-9]\d{6,14}$/,
  PHONE_DIGIT_MIN: 7,
  /** E.164 max total digits (country code + subscriber). */
  PHONE_DIGIT_MAX: 15,
  DIAL_CODE: /^\+[1-9]\d{0,3}$/,
  IATA: /^[A-Z0-9]{2,3}$/,
  ICAO: /^[A-Z]{3,4}$/,
  UN_LOCODE: /^[A-Z]{2}[A-Z0-9]{3,8}$/,
  UN_LOCODE_MIN: 5,
  UN_LOCODE_MAX: 10,
  PORT_MODES: ['AIR', 'SEA', 'LAND', 'COURIER'] as const,
  IMO: /^\d{7}$/,
  SWIFT_BIC: /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
  AWB_PREFIX: /^\d{3}$/,
  /** HS: 4–10 digits, optional dotted groups (e.g. 8471.30 or 847130). Stored length 4–12. */
  HS_CODE: /^\d{4}([.\s]?\d{2}){0,3}$/,
  HS_CODE_MIN_LEN: 4,
  HS_CODE_MAX_LEN: 12,
  /** IMDG/ICAO class 1–9 with optional subclass (e.g. 3, 2.1, Class 8). */
  DG_CLASS: /^(CLASS\s*)?[1-9](\.[0-9]{1,2})?$/i,
  DUTY_MIN: 0,
  DUTY_MAX: 100,
  UN_NUMBER: /^(UN)?\d{4}$/i,
  LAT_MIN: -90,
  LAT_MAX: 90,
  LNG_MIN: -180,
  LNG_MAX: 180,
  GEO_DECIMALS: 6,
} as const;
