/**
 * Fallback catalog when POST /masters/air-pallet-types/seed-defaults returns 500.
 * Shapes match CreateAirPalletTypeDto (OpenAPI).
 */
export const AIR_PALLET_TYPE_SEED_DEFAULTS: ReadonlyArray<{
  code: string;
  name: string;
  iata_codes?: string[];
  base_length_m?: number;
  base_width_m?: number;
  height_m?: number;
  usable_volume_m3?: number;
  inside_length_m?: number;
  inside_width_m?: number;
  inside_height_m?: number;
  aircraft_types?: string[];
  is_active?: boolean;
}> = [
  {
    code: 'LD3',
    name: 'LD3 Container',
    iata_codes: ['AKE', 'AVE'],
    base_length_m: 1.56,
    base_width_m: 1.53,
    height_m: 1.63,
    usable_volume_m3: 4.5,
    aircraft_types: ['A300', 'A330', 'B747-400', 'B777'],
    is_active: true,
  },
  {
    code: 'LD7',
    name: 'LD7 Pallet',
    iata_codes: ['PAG', 'PAJ'],
    base_length_m: 3.18,
    base_width_m: 2.24,
    height_m: 1.63,
    usable_volume_m3: 10.5,
    aircraft_types: ['A300', 'A330', 'B747-400', 'B777'],
    is_active: true,
  },
  {
    code: 'PMC',
    name: 'PMC Pallet',
    iata_codes: ['PMC', 'P1P'],
    base_length_m: 3.18,
    base_width_m: 2.44,
    height_m: 1.63,
    usable_volume_m3: 11.5,
    aircraft_types: ['A300', 'A330', 'B747-400', 'B777', 'B787'],
    is_active: true,
  },
  {
    code: 'PLA',
    name: 'PLA Pallet',
    iata_codes: ['PLA'],
    base_length_m: 3.18,
    base_width_m: 2.24,
    height_m: 1.63,
    usable_volume_m3: 10.0,
    aircraft_types: ['A300', 'A330', 'B747-400'],
    is_active: true,
  },
  {
    code: 'PGA',
    name: 'PGA Pallet',
    iata_codes: ['PGA'],
    base_length_m: 6.06,
    base_width_m: 2.44,
    height_m: 2.44,
    usable_volume_m3: 33.0,
    aircraft_types: ['B747-400', 'B747-8F'],
    is_active: true,
  },
  {
    code: 'AKE',
    name: 'AKE Container (LD3)',
    iata_codes: ['AKE'],
    base_length_m: 1.56,
    base_width_m: 1.53,
    height_m: 1.63,
    usable_volume_m3: 4.3,
    aircraft_types: ['A300', 'A330', 'B747-400', 'B777'],
    is_active: true,
  },
  {
    code: 'AKH',
    name: 'AKH Container',
    iata_codes: ['AKH'],
    base_length_m: 1.56,
    base_width_m: 1.53,
    height_m: 1.14,
    usable_volume_m3: 3.4,
    aircraft_types: ['A300', 'A330', 'B747-400'],
    is_active: true,
  },
  {
    code: 'PAG',
    name: 'PAG Pallet',
    iata_codes: ['PAG'],
    base_length_m: 3.18,
    base_width_m: 2.24,
    height_m: 1.63,
    usable_volume_m3: 10.5,
    aircraft_types: ['A300', 'A330', 'B747-400', 'B777'],
    is_active: true,
  },
];
