export interface MenuTile {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;   // tailwind bg class
  path: string;
  /** Optional group heading on module menus (e.g. Customer Portal / Vendor Portal). */
  section?: string;
  /** Live count from API (Customers menu). */
  badge?: number;
  badgeLoading?: boolean;
  /** Short label shown beside the count, e.g. "this month". */
  badgeHint?: string;
}