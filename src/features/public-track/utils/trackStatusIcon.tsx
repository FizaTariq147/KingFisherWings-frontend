import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Anchor,
  Ban,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Container,
  FileText,
  MapPin,
  Package,
  PackageCheck,
  PauseCircle,
  Plane,
  Ship,
  Ticket,
  TrainFront,
  Truck,
  Warehouse,
} from 'lucide-react';

/**
 * Pick a Lucide icon from track status / move / event text.
 * Matching is keyword-based so API codes and human labels both work.
 */
export function resolveTrackStatusIcon(input: {
  status?: string;
  move?: string;
  eventType?: string;
  label?: string;
  pending?: boolean;
}): LucideIcon {
  if (input.pending) return Clock3;

  const hay = [input.eventType, input.status, input.move, input.label]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[_-]+/g, ' ');

  if (!hay.trim()) return Truck;

  // Holds / exceptions first
  if (/\b(hold|on hold|detention|demurrage)\b/.test(hay)) return PauseCircle;
  if (/\b(cancel|cancelled|void|abort)\b/.test(hay)) return Ban;
  if (/\b(delay|exception|alert|damage|claim)\b/.test(hay)) return AlertTriangle;

  // Delivery / POD
  if (/\b(delivered|delivery|pod|proof of delivery|consignee)\b/.test(hay)) {
    return PackageCheck;
  }
  if (/\b(out for delivery|ofd|last mile)\b/.test(hay)) return Truck;

  // Customs / docs
  if (/\b(custom|clearance|declaration)\b/.test(hay)) return ClipboardCheck;
  if (/\b(port token|gate token|token)\b/.test(hay)) return Ticket;
  if (/\b(draft bl|bill of lading|bl issued|awb|hawb|mawb|document)\b/.test(hay)) {
    return FileText;
  }

  // Air
  if (/\b(air|flight|airport|aircraft|cargo flight)\b/.test(hay)) return Plane;

  // Sea / vessel
  if (
    /\b(vessel|voyage|ship|sailing|berth|discharge|loaded on|departed|arrival at port|sailed)\b/.test(
      hay,
    )
  ) {
    return Ship;
  }
  if (/\b(anchor|anchorage)\b/.test(hay)) return Anchor;

  // Rail / road / warehouse / empty
  if (/\b(rail|train|rake)\b/.test(hay)) return TrainFront;
  if (/\b(warehouse|depot|cfs|yard|storage)\b/.test(hay)) return Warehouse;
  if (/\b(empty|gate in empty|gate out empty)\b/.test(hay)) return Container;
  if (/\b(gate in|gate out|picked|pickup|truck|road|land|hauled)\b/.test(hay)) {
    return Truck;
  }

  // Container / package / booked
  if (/\b(container|stuffing|unstuffing|seal)\b/.test(hay)) return Container;
  if (/\b(booked|created|confirmed|registered)\b/.test(hay)) return ClipboardCheck;
  if (/\b(package|cargo|goods)\b/.test(hay)) return Package;
  if (/\b(complete|completed|done|success|closed)\b/.test(hay)) return CheckCircle2;
  if (/\b(pending|await|scheduled|planned|eta|etd)\b/.test(hay)) return Clock3;
  if (/\b(location|terminal|port|pol|pod|origin|destination)\b/.test(hay)) {
    return MapPin;
  }

  return Truck;
}
