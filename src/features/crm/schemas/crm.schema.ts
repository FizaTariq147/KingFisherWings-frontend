import { z } from 'zod';
import {
  CALL_OUTCOMES,
  CALL_PURPOSES,
  CALL_TYPES,
  ENQUIRY_STATUSES,
  FOLLOW_UP_STATUSES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  PERIOD_TYPES,
  PRIORITIES,
  SERVICE_TYPES,
} from '../constants/crm.constants';
import {
  amountField,
  countryCode,
  currencyCode,
  dateString,
  integerField,
  latitude,
  longitude,
  optionalEmail,
  optionalName,
  optionalPhone,
  optionalTextUndef,
  optionalUuid,
  requiredName,
  requiredText,
  requiredUuid,
  withPhoneCountryRefine,
} from '@/lib/validation';

const leadSourceSchema = z.enum(LEAD_SOURCES);
const leadStatusSchema = z.enum(LEAD_STATUSES);
const prioritySchema = z.enum(PRIORITIES);
const callTypeSchema = z.enum(CALL_TYPES);
const callPurposeSchema = z.enum(CALL_PURPOSES);
const callOutcomeSchema = z.enum(CALL_OUTCOMES);
const followUpStatusSchema = z.enum(FOLLOW_UP_STATUSES);
const enquiryStatusSchema = z.enum(ENQUIRY_STATUSES);
const serviceTypeSchema = z.enum(SERVICE_TYPES);
const periodTypeSchema = z.enum(PERIOD_TYPES);

const tagsField = z.preprocess(
  (v) => (typeof v === 'string' ? v : Array.isArray(v) ? v.join(', ') : ''),
  z.string().max(500).optional(),
);

function splitTags(value?: string) {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

const leadObject = z.object({
  company_name: requiredName({ max: 300 }),
  contact_name: requiredName({ max: 200 }),
  contact_country_code: countryCode(false),
  email: optionalEmail(),
  phone: optionalPhone(),
  potential_volume: optionalTextUndef({ max: 200 }),
  service_requirements: optionalTextUndef({ max: 2000 }),
  source: leadSourceSchema.optional(),
  status: leadStatusSchema.optional(),
  assigned_salesperson_id: optionalUuid(),
  priority: prioritySchema.optional(),
  tags: tagsField,
  notes: optionalTextUndef({ max: 4000 }),
  lost_reason: optionalTextUndef({ max: 500 }),
});

export const createLeadSchema = withPhoneCountryRefine(leadObject, {
  phoneKey: 'phone',
  countryKey: 'contact_country_code',
  required: false,
});

export const updateLeadSchema = withPhoneCountryRefine(leadObject.partial(), {
  phoneKey: 'phone',
  countryKey: 'contact_country_code',
  required: false,
});

export const convertLeadSchema = z.object({
  party_code: optionalTextUndef({ min: 1, max: 30 }),
});

const callLogObject = z.object({
  lead_id: optionalUuid(),
  party_id: optionalUuid(),
  date_time: requiredText({ min: 1, max: 40 }),
  contact_person: requiredName({ max: 200 }),
  call_type: callTypeSchema,
  purpose: callPurposeSchema,
  discussion_summary: requiredText({ min: 3, max: 4000 }),
  outcome: callOutcomeSchema,
  next_action: optionalTextUndef({ max: 500 }),
  next_followup_date: dateString({ required: false }),
  gps_latitude: latitude({ required: false }),
  gps_longitude: longitude({ required: false }),
  duration_minutes: integerField({ required: false, min: 0, max: 1440, allowNegative: false }),
});

export const createCallLogSchema = callLogObject;

const followUpObject = z.object({
  lead_id: optionalUuid(),
  party_id: optionalUuid(),
  enquiry_id: optionalUuid(),
  due_date: requiredText({ min: 1, max: 40 }),
  subject: requiredText({ min: 2, max: 200 }),
  notes: optionalTextUndef({ max: 4000 }),
  owner_id: optionalUuid(),
});

export const createFollowUpSchema = followUpObject;

export const patchFollowUpSchema = z.object({
  status: followUpStatusSchema.optional(),
  due_date: dateString({ required: false }),
  notes: optionalTextUndef({ max: 4000 }),
});

const enquiryObject = z.object({
  lead_id: optionalUuid(),
  party_id: optionalUuid(),
  salesperson_id: optionalUuid(),
  service_type: serviceTypeSchema,
  origin_port_id: optionalUuid(),
  dest_port_id: optionalUuid(),
  cargo_details: optionalTextUndef({ max: 4000 }),
  incoterms: optionalTextUndef({ min: 3, max: 10 }),
  special_requirements: optionalTextUndef({ max: 4000 }),
  currency_code: currencyCode(true),
  status: enquiryStatusSchema.optional(),
});

export const createEnquirySchema = enquiryObject;
export const updateEnquirySchema = enquiryObject.partial();

export const createBudgetSchema = z.object({
  salesperson_id: requiredUuid(),
  period_type: periodTypeSchema,
  period_start: dateString({ required: true }),
  target_amount: amountField({ required: true, min: 0, allowNegative: false, maxDecimals: 2 }),
  target_volume: integerField({ required: false, min: 0, allowNegative: false }),
  job_type: serviceTypeSchema.optional(),
});

export const createSubscriberSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z.string().min(1).email(),
  ),
  full_name: optionalName(),
  party_id: optionalUuid(),
  country_code: countryCode(false),
  tags: tagsField,
});

export const createCampaignTemplateSchema = z.object({
  name: requiredText({ min: 2, max: 200 }),
  subject: requiredText({ min: 2, max: 300 }),
  body: requiredText({ min: 5, max: 20000 }),
});

export const createCampaignSchema = createCampaignTemplateSchema.extend({
  scheduled_at: dateString({ required: false }),
  filter_party_type: optionalTextUndef({ max: 50 }),
  filter_country: countryCode(false),
});

export type CreateLeadFormValues = z.infer<typeof createLeadSchema>;
export type UpdateLeadFormValues = z.infer<typeof updateLeadSchema>;
export type CreateCallLogFormValues = z.infer<typeof createCallLogSchema>;
export type CreateFollowUpFormValues = z.infer<typeof createFollowUpSchema>;
export type CreateEnquiryFormValues = z.infer<typeof createEnquirySchema>;
export type UpdateEnquiryFormValues = z.infer<typeof updateEnquirySchema>;
export type CreateBudgetFormValues = z.infer<typeof createBudgetSchema>;
export type CreateSubscriberFormValues = z.infer<typeof createSubscriberSchema>;
export type CreateCampaignTemplateFormValues = z.infer<typeof createCampaignTemplateSchema>;
export type CreateCampaignFormValues = z.infer<typeof createCampaignSchema>;

/** Strip UI-only fields before API submit. */
export function toCreateLeadDto(values: CreateLeadFormValues) {
  const { contact_country_code: _c, tags, ...rest } = values;
  return { ...rest, tags: splitTags(tags) };
}

export function toUpdateLeadDto(values: UpdateLeadFormValues) {
  const { contact_country_code: _c, tags, ...rest } = values;
  return {
    ...rest,
    ...(tags !== undefined ? { tags: splitTags(tags) } : {}),
  };
}

export function toCreateSubscriberDto(values: CreateSubscriberFormValues) {
  const { tags, ...rest } = values;
  return { ...rest, tags: splitTags(tags) };
}
