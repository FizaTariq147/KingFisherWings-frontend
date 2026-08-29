import { BookOpen, Headphones, ListChecks, Anchor, Truck, Tags } from 'lucide-react';
import type { MenuTile } from '../../customers/types/menu.types';

export const nvoccMenu: MenuTile[] = [
  {
    id: 'all-jobs',
    title: 'All Jobs',
    description: 'To view all the jobs list by salesperson wise, customer wise and report segment wise.',
    icon: BookOpen,
    iconColor: 'bg-sky-500',
    path: '/nvocc/all-jobs',
  },
  {
    id: 'nvocc-tariffs',
    title: 'Tariffs',
    description: 'Maintain NVOCC freight tariffs, surcharges, and validity by trade lane.',
    icon: Tags,
    iconColor: 'bg-amber-500',
    path: '/nvocc/tariffs',
  },
  {
    id: 'booking-list',
    title: 'Booking List',
    description: 'To show the all N.V.O.C.C Booking List vessel, container details etc..',
    icon: BookOpen,
    iconColor: 'bg-sky-500',
    path: '/nvocc/booking-list',
  },
  {
    id: 'enquiry-list',
    title: 'Enquiry List',
    description: 'To maintain your clients enquiry N.V.O.C.C regarding your cargo movement.',
    icon: Headphones,
    iconColor: 'bg-sky-500',
    path: '/nvocc/enquiry-list',
  },
  {
    id: 'load-list',
    title: 'Load List',
    description: 'To view NVOCC Load list details by vessel, voyage, container details, origin, destination details etc.',
    icon: ListChecks,
    iconColor: 'bg-emerald-500',
    path: '/nvocc/load-list',
  },
  {
    id: 'vessel-voyage-master-list',
    title: 'Vessel Voyage Master List',
    description: 'To maintain the vessel voyage, ETD, ETA, port details here',
    icon: Anchor,
    iconColor: 'bg-emerald-500',
    path: '/nvocc/vessel-voyage-master',
  },
];

// Rendered separately with the centered layout, same pattern as other Reports tiles
export const reportsNvoccTile: MenuTile = {
  id: 'reports-nvocc',
  title: 'Reports - NVOCC',
  description: 'To view all reports related to NVOCC module.',
  icon: Truck,
  iconColor: 'bg-sky-500',
  path: '/nvocc/reports',
};