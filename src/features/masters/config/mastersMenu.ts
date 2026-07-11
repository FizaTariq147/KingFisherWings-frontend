import {
  Barcode, Activity, Home, Plane, Paperclip, Tag, Building2, BookOpen, Package, Users, Boxes, Container,
  Globe, DollarSign, FileEdit, IdCard, Layers, Star, Hash, Anchor,
  Bell, Building, Users2, PackageOpen, MapPinned, Ship, Percent, Map,
  PhoneCall, Waves, Warehouse, UserCheck, ShipWheel, Route, MessageSquare, Globe2,
} from 'lucide-react';
import type { MenuTile } from '../../customers/types/menu.types';

export const mastersMenu: MenuTile[] = [

      { id: 'awb-stock-master', title: 'AWB Stock Master', description: 'To maintain airline AWB number stock and generate a serious of number.', icon: Barcode, iconColor: 'bg-sky-500', path: '/masters/awb-stock-master' },
  { id: 'activity-master', title: 'Activity Master', description: 'To maintain all the activities like container activity, documentation, customer service and etc.', icon: Activity, iconColor: 'bg-teal-500', path: '/masters/activity-master' },
  { id: 'address-search', title: 'Address Search', description: 'To maintain address details for all the master address where ever we need such as area, building no, street and type of', icon: Home, iconColor: 'bg-emerald-400', path: '/masters/address-search' },
  { id: 'airport', title: 'Airport', description: 'To maintain port details for the Air Port such as port code, port name, Zone code, region code, ISO code and etc.', icon: Plane, iconColor: 'bg-green-600', path: '/masters/airport' },
  { id: 'attachments-search', title: 'Attachments Search', description: 'To maintain all the Job & shipments related documents such as IATA code, VAT no, TIN no and etc.', icon: Paperclip, iconColor: 'bg-green-500', path: '/masters/attachments-search' },
  { id: 'category-master', title: 'Category Master', description: 'To Maintain All The Categories Such As Origin Agent, Delivery Agent, Shipper And Etc.', icon: Tag, iconColor: 'bg-yellow-500', path: '/masters/category-master' },
  { id: 'city', title: 'City', description: 'To maintain city details such as District code, name, state code, state name, city country code and etc.', icon: Building2, iconColor: 'bg-orange-500', path: '/masters/city' },
  { id: 'clause-master', title: 'Clause Master', description: 'List to Add and Edit Clause, Stamp and Provision', icon: BookOpen, iconColor: 'bg-orange-600', path: '/masters/clause-master' },

  { id: 'commodity', title: 'Commodity', description: 'To maintain all the commodity details such as code, type, hazardous, perishable and etc.', icon: Package, iconColor: 'bg-red-500', path: '/masters/commodity' },
  { id: 'contacts-search', title: 'Contacts Search', description: "To maintain contacts details for all the master's contacts where we need such as contact name, designation, category and etc.", icon: Users, iconColor: 'bg-pink-500', path: '/masters/contacts-search' },
  { id: 'container-inventory', title: 'Container Inventory', description: 'To maintain the container no, type, lease organization, location and amount here', icon: Boxes, iconColor: 'bg-purple-500', path: '/masters/container-inventory' },
  { id: 'container-type', title: 'Container Type', description: 'To maintain container details such as container type, volume, weight, interior width and etc.', icon: Container, iconColor: 'bg-purple-600', path: '/masters/container-type' },

  { id: 'country', title: 'Country', description: 'To maintain country details such as country code, name, local currency, AWB currency and etc.', icon: Globe, iconColor: 'bg-purple-500', path: '/masters/country' },
  { id: 'currency', title: 'Currency', description: 'To maintain currency, code and currency name of the respective currency code.', icon: DollarSign, iconColor: 'bg-gray-500', path: '/masters/currency' },
  { id: 'custom-report-master', title: 'Custom Report Master', description: 'To maintain custom report alignment and column details here', icon: FileEdit, iconColor: 'bg-teal-500', path: '/masters/custom-report-master' },
  { id: 'designation', title: 'Designation', description: 'To maintain employees designation details such as designation name ( Manager, Chairman, HR, Admin and etc )', icon: IdCard, iconColor: 'bg-blue-500', path: '/masters/designation' },

  { id: 'division', title: 'Division', description: 'To maintain division details such as division code, name (Freight Forwarding, Warehouse) and etc.', icon: Layers, iconColor: 'bg-blue-500', path: '/masters/division' },
  { id: 'favorites', title: 'Favorites', description: "Favorites maintains the user's bookmarks.", icon: Star, iconColor: 'bg-teal-500', path: '/masters/favorites' },
  { id: 'hs-codes', title: 'HS Codes', description: 'To maintain all the HS Code details such as code, name, section, chapter, sub heading and etc.', icon: Hash, iconColor: 'bg-green-500', path: '/masters/hs-codes' },
  { id: 'landport', title: 'Landport', description: 'To maintain port details for the Land port such as port code, port name, Zone code, region code, ISO code and etc.', icon: Anchor, iconColor: 'bg-lime-500', path: '/masters/landport' },

  { id: 'notifications', title: 'Notifications', description: 'To maintain notification messages, such as internal communication between the team members.', icon: Bell, iconColor: 'bg-yellow-500', path: '/masters/notifications' },
  { id: 'organization', title: 'Organization', description: 'To maintain all the customer or organization details such as organization logo, organization type and category.', icon: Building, iconColor: 'bg-pink-500', path: '/masters/organization' },
  { id: 'organization-group-list', title: 'Organization Group List', description: 'To maintain organization group details such as code, name and type', icon: Users2, iconColor: 'bg-red-500', path: '/masters/organization-group-list' },
  { id: 'pack', title: 'Pack', description: 'To maintain package details such as bundles, bags, boxes, pallets and etc.', icon: PackageOpen, iconColor: 'bg-red-400', path: '/masters/pack' },

  { id: 'port-clause-map', title: 'Port Clause Map', description: 'To Map Clauses/ Stamps/ Provisions to Ports', icon: MapPinned, iconColor: 'bg-pink-500', path: '/masters/port-clause-map' },
  { id: 'ports', title: 'Ports', description: 'To maintain ports details such as Airport code, Sea Port code, port name, Port Zone code, Port Zone name and etc.', icon: Ship, iconColor: 'bg-purple-500', path: '/masters/ports' },
  { id: 'rate-basis', title: 'Rate Basis', description: "To maintain rate details such as rate code(LR, F), and rate name( Per Pallet, Per Cubic Feet) and etc.", icon: Percent, iconColor: 'bg-purple-500', path: '/masters/rate-basis' },
  { id: 'region', title: 'Region', description: 'To maintain region details such as region code (SEA, AP) and region name (South East Asia, Asia Pacific).', icon: Map, iconColor: 'bg-indigo-500', path: '/masters/region' },

  { id: 'sales-call-activity', title: 'Sales Call Activity', description: 'To maintain sales call activity list.', icon: PhoneCall, iconColor: 'bg-gray-500', path: '/masters/sales-call-activity' },
  { id: 'seaport', title: 'Seaport', description: 'To maintain seaport details such as sea port code, name, IDX code, ISO code, IATA code and etc.', icon: Waves, iconColor: 'bg-blue-500', path: '/masters/seaport' },
  { id: 'storage-slab-master', title: 'Storage Slab Master', description: 'To maintain the Storage slab details with branch and department wise expiry date and amount etc.', icon: Warehouse, iconColor: 'bg-teal-500', path: '/masters/storage-slab-master' },
  { id: 'tracking-users', title: 'Tracking Users', description: 'To maintain client tracking users.', icon: UserCheck, iconColor: 'bg-blue-500', path: '/masters/tracking-users' },

  { id: 'vessel-list', title: 'Vessel List', description: 'To maintain vessel details such as name, type, built on year, size etc.', icon: ShipWheel, iconColor: 'bg-blue-500', path: '/masters/vessel-list' },
  { id: 'voyage-master-list', title: 'Voyage Master List', description: 'To maintain voyage master list', icon: Route, iconColor: 'bg-green-500', path: '/masters/voyage-master-list' },
  { id: 'whatsapp-sms-history', title: 'WhatsApp SMS History', description: 'To View and Maintain WhatsApp and SMS History', icon: MessageSquare, iconColor: 'bg-green-500', path: '/masters/whatsapp-sms-history' },
  { id: 'zone', title: 'Zone', description: 'To maintain zone details such as zone code (SZ, NZ), zone name (South Zone, North Zone) and etc.', icon: Globe2, iconColor: 'bg-yellow-500', path: '/masters/zone' },
];