/**
 * Centralized validation architecture for KingFisher Tech Gold.
 *
 * - Keep module schemas in `features/<module>/schemas/*.schema.ts`
 * - Build fields with helpers from `@/lib/validation`
 * - Use `useAppForm` (or `withAppFormDefaults`) in form components
 * - Map API errors with `applyServerErrors` / `form.applyApiErrors`
 */

export { V, RULES } from './messages';
export {
  trimString,
  emptyToUndefined,
  toLowerCaseEmail,
  toUpperCaseCode,
  emptyToNumber,
  normalizeIsoCountryCode,
  normalizeName,
  isLogicalName,
  isValidLogicalDepartmentName,
} from './preprocessors';
export {
  requiredText,
  optionalText,
  optionalTextUndef,
  requiredName,
  optionalName,
  requiredDepartmentName,
  requiredDesignationName,
  requiredBranchName,
  requiredEmail,
  optionalEmail,
  requiredPhone,
  optionalPhone,
  withPhoneCountryRefine,
  requiredUrl,
  optionalUrl,
  optionalUrlOrEmpty,
  requiredUuid,
  optionalUuid,
  countryCode,
  currencyCode,
  dialCode,
  iataCode,
  icaoCode,
  unLocode,
  imoNumber,
  swiftBic,
  awbPrefix,
  hsCode,
  dgClass,
  dutyRatePercent,
  unNumber,
  entityCode,
  prefixCode,
  slugLower,
  hexColor,
  requiredSelect,
  masterSelect,
  latitude,
  longitude,
  integerField,
  amountField,
  passwordField,
  softPasswordField,
  passwordsMatch,
  dateString,
  fileMetaSchema,
  requiredArray,
  isNameField,
  isCodeField,
  isPrefixField,
} from './fields';
export { APP_FORM_DEFAULTS, withAppFormDefaults } from './formDefaults';
export { focusFirstInvalidField, getFirstErrorPath } from './focusFirstError';
export {
  parseServerValidationError,
  applyServerErrors,
  getServerErrorMessage,
} from './mapApiErrors';
export type { ServerErrorMapOptions } from './mapApiErrors';
export { useAppForm } from './useAppForm';
export {
  suggestCodeFromName,
  suggestInitialsFromName,
  suggestContainerTypeCode,
  suggestDepartmentCode,
  suggestBranchCode,
  suggestBranchNamePrefix,
  suggestWarehouseCode,
  normalizeCompanySlugPrefix,
  isDepartmentCodeWithCompanyPrefix,
  isBranchCodeWithCompanyPrefix,
  isCodeRelatedToName,
  nameKeyLetters,
  isValidContainerSize,
  normalizeContainerSize,
  parseContainerSize,
  resolveContainerSizeUnit,
  CONTAINER_SIZE_UNITS,
  CONTAINER_ISO_LENGTHS,
  CONTAINER_SIZE_PATTERN,
} from './nameCodeRelation';
export type { ContainerSizeUnit } from './nameCodeRelation';
