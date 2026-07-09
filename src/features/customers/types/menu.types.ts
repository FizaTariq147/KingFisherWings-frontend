export interface MenuTile {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;   // tailwind bg class
  path: string;
}