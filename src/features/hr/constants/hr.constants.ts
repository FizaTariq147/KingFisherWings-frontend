export const EMPLOYEE_STATUSES = [
  'ACTIVE',
  'PROBATION',
  'ON_LEAVE',
  'SUSPENDED',
  'TERMINATED',
] as const;

export const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'] as const;
export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
export const MARITAL_STATUSES = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'] as const;
export const STAFF_GRADES = ['JUNIOR', 'STAFF', 'SUPERVISOR', 'MANAGER', 'EXECUTIVE'] as const;
export const CONTRACT_TYPES = ['LIMITED', 'UNLIMITED'] as const;

export const LEAVE_TYPES = [
  'ANNUAL',
  'SICK',
  'UNPAID',
  'MATERNITY_PATERNITY',
  'EMERGENCY',
  'HAJJ',
] as const;

export const LEAVE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'CANCELLED'] as const;

export const DOCUMENT_TYPES = [
  'PASSPORT',
  'VISA',
  'LABOR_CARD',
  'EMIRATES_ID',
  'MEDICAL_INSURANCE',
  'DRIVING_LICENSE',
  'PROFESSIONAL_CERT',
  'CONTRACT',
  'DEPENDENT_PASSPORT',
  'DEPENDENT_VISA',
] as const;

export const SALARY_COMPONENT_CODES = [
  'BASIC',
  'HOUSING',
  'TRANSPORT',
  'MOBILE',
  'OVERTIME',
  'OTHER',
] as const;

export const LETTER_TYPES = [
  'APPOINTMENT',
  'CONFIRMATION',
  'SALARY_REVISION',
  'WARNING',
  'EXPERIENCE',
  'EMPLOYMENT_CERT',
  'NOC',
  'RESIGNATION_ACCEPTANCE',
  'END_OF_SERVICE',
  'REFERENCE',
] as const;

export const LETTER_TYPE_OPTIONS: ReadonlyArray<{
  type: (typeof LETTER_TYPES)[number];
  description: string;
}> = [
  { type: 'APPOINTMENT', description: 'Confirm a new employee appointment.' },
  { type: 'CONFIRMATION', description: 'Confirm employment after probation.' },
  { type: 'SALARY_REVISION', description: 'Notify an employee of a salary revision.' },
  { type: 'WARNING', description: 'Issue an official warning to an employee.' },
  { type: 'EXPERIENCE', description: 'Experience certificate for past employment.' },
  { type: 'EMPLOYMENT_CERT', description: 'Certificate of current employment.' },
  { type: 'NOC', description: 'No objection certificate for employee requests.' },
  { type: 'RESIGNATION_ACCEPTANCE', description: 'Acknowledge and accept a resignation.' },
  { type: 'END_OF_SERVICE', description: 'Confirm end of service and clearance.' },
  { type: 'REFERENCE', description: 'Reference letter for verification purposes.' },
];

export const TIMESHEET_STATUSES = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'] as const;

export const LOAN_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'CLOSED'] as const;

export const ADVANCE_STATUSES = ['OPEN', 'CLOSED'] as const;

export function labelEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
