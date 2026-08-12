export interface MenuTile {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;   // tailwind bg class
  path: string;
  /** Optional group heading on module menus (e.g. Customer Portal / Vendor Portal). */
  section?: string;
}