export const NAV_LINKS = [
  { label: 'Home',     to: '/home' },
  { label: 'Features', to: '/features' },
  { label: 'Modules',  to: '/modules' },
  { label: 'Pricing',  to: '/pricing' },
  { label: 'Contact',  to: '/contact' },
] as const

export const REGIONAL_CONTACTS = [
  { flag: '🇦🇪', country: 'UAE',       phone: '+971 50 552 6783', href: 'https://wa.me/971505526783' },
  { flag: '🇸🇬', country: 'Singapore', phone: '+65 8914 5129',    href: 'https://wa.me/6589145129' },
  { flag: '🇲🇾', country: 'Malaysia',  phone: '+60 10 212 9414',  href: 'tel:+60102129414' },
  { flag: '🇺🇸', country: 'USA',       phone: '+1 (848) 247 9538',href: 'https://wa.me/18482479538' },
  { flag: '🇮🇳', country: 'India',     phone: '+91 93449 12004',  href: 'https://wa.me/919344912004' },
  { flag: '🇹🇿', country: 'Tanzania',  phone: '+255 745 788 788', href: 'https://wa.me/255745788788' },
  { flag: '🇬🇧', country: 'UK',        phone: '+44 20 3996 2915', href: 'tel:+442039962915' },
] as const

export const FEATURES = [
  {
    title: 'Instant Quotations',
    icon: 'FileText' as const,
    desc: 'Create and convert quotes to jobs in one click.',
  },
  {
    title: 'Multi-mode Shipments',
    icon: 'Ship' as const,
    desc: 'Sea, air and road from a single screen.',
  },
  {
    title: 'Auto Documentation',
    icon: 'Clipboard' as const,
    desc: 'B/L, invoices, manifests generated automatically.',
  },
  {
    title: 'MIS Dashboards',
    icon: 'BarChart3' as const,
    desc: 'Real-time profit and lane analytics.',
  },
] as const

export const MODULES = [
  { name: 'Sales & CRM',        icon: 'Users' as const },
  { name: 'Organizations',      icon: 'Building' as const },
  { name: 'Quotations',         icon: 'FileText' as const },
  { name: 'Customer Service',   icon: 'Headphones' as const },
  { name: 'Documentation',      icon: 'Clipboard' as const },
  { name: 'Accounts',           icon: 'Calculator' as const },
  { name: 'Management (MIS)',   icon: 'BarChart2' as const },
  { name: 'WMS',                icon: 'Package' as const },
  { name: 'HR & Payroll',       icon: 'IdCard' as const },
] as const

export const STATS = [
  { value: '1000+', label: 'Customers' },
  { value: '30+',   label: 'Countries' },
  { value: '15+',   label: 'Years' },
  { value: '5',     label: 'Branches' },
] as const

export const TESTIMONIALS = [
  {
    quote: 'Fresa Gold has greatly improved our efficiency by reducing manual work and providing real-time visibility.',
    name: 'Akhil',
    company: 'MCL Shipping LLC',
  },
  {
    quote: 'Very convenient, user friendly and comfortable for our team. Excellent customer service.',
    name: 'Deepak Kumar',
    company: 'Berrio Logistics',
  },
  {
    quote: 'Sincere appreciation for excellent support on application development and enhancement.',
    name: 'Mathew Soo',
    company: 'FM Global Logistics',
  },
] as const

export const FOOTER_LINKS = {
  product: [
    { label: 'Features',  to: '/features' },
    { label: 'Modules',   to: '/modules' },
    { label: 'Pricing',   to: '/pricing' },
    { label: 'Contact',   to: '/contact' },
  ],
  company: [
    { label: 'About Fresa',    href: 'https://fresatechnologies.com/about' },
    { label: 'Certifications', href: 'https://fresatechnologies.com/certifications' },
    { label: 'Blog',           href: 'https://fresatechnologies.com/blog' },
    { label: 'Careers',        href: 'https://fresatechnologies.com/careers' },
  ],
  // icon field removed — lucide-react has no social brand icons
  social: [
    { label: 'LinkedIn',  href: 'https://linkedin.com/company/fresatechnologies' },
    { label: 'YouTube',   href: 'https://youtube.com/@fresatechnologies' },
    { label: 'Instagram', href: 'https://instagram.com/fresatechnologies' },
    { label: 'Twitter',   href: 'https://twitter.com/fresatech' },
  ],
} as const