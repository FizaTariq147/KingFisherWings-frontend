export const DISTANCE_UNITS = ['KM', 'Miles'] as const;
export type DistanceUnit = (typeof DISTANCE_UNITS)[number];

export const DEFAULT_ZIP_DISTANCE_PAGE_SIZE = 20;
