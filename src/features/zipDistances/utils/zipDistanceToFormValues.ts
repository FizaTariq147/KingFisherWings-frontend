import type { CreateZipDistanceFormValues, ZipDistance } from '../types/zipDistance.types';

export const ZIP_DISTANCE_FORM_DEFAULTS: CreateZipDistanceFormValues = {
  from_zip: '',
  to_zip: '',
  distance: 0,
  unit: 'KM',
  is_active: true,
};

export function zipDistanceToFormValues(z: ZipDistance): CreateZipDistanceFormValues {
  return {
    from_zip: z.from_zip,
    from_city: z.from_city || undefined,
    to_zip: z.to_zip,
    to_city: z.to_city || undefined,
    distance: z.distance,
    unit: z.unit === 'Miles' ? 'Miles' : 'KM',
    is_active: z.is_active !== false,
  };
}
