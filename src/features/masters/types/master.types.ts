/** Shared Master module types — ERP JWT / axiosInstance. */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MasterListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  order?: 'asc' | 'desc';
  /** Extra query flags (e.g. currency_id for exchange-rates, mode for ports). */
  extra?: Record<string, string | number | boolean>;
}

export type MasterRecord = Record<string, unknown> & {
  id: string;
  is_active?: boolean;
  deleted_at?: string | null;
};

export interface MasterListResult {
  items: MasterRecord[];
  meta: PaginationMeta;
}

export type MasterFieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'textarea'
  | 'email'
  | 'url';

export interface MasterFieldOption {
  value: string;
  label: string;
}

export interface MasterFieldConfig {
  name: string;
  label: string;
  type: MasterFieldType;
  required?: boolean;
  /** Static options for select / multiselect. */
  options?: MasterFieldOption[];
  /** Load options from another master resource key. */
  optionsFrom?: string;
  optionsValueKey?: string;
  optionsLabelKey?: string;
  /** Clear/reload when this field changes. */
  dependsOn?: string;
  placeholder?: string;
  mono?: boolean;
  /**
   * When type is text but API expects string[], split CSV on submit
   * (legacy). Prefer `multiselect` for new fields.
   */
  csvToArray?: boolean;
}

export interface MasterColumnConfig {
  key: string;
  label: string;
  mono?: boolean;
}

export interface MasterResourceConfig {
  key: string;
  title: string;
  basePath: string;
  columns: MasterColumnConfig[];
  fields: MasterFieldConfig[];
  /** Primary display field for titles/labels. */
  labelField: string;
  supportsDelete?: boolean;
  /** No PATCH/DELETE by id (exchange-rates). */
  createOnly?: boolean;
  /** Default list query extras. */
  listDefaults?: Record<string, string | number | boolean>;
  /** Menu path override if different from /masters/:key */
  menuPath?: string;
}

export type MasterStatusFilter = 'all' | 'active' | 'inactive';
