import type { HawbOfficialLayoutConfig, HawbOfficialModel } from './hawbOfficial.types';

/** Short airport name for Original-1 destination band (pin: "DUBAI INTERNATIONAL"). */
function shortDestination(dest: string): string {
  const t = dest.trim();
  if (!t) return '';
  // Drop trailing "(DXB)" / "AIRPORT (DXB)" noise for the sparse pin band.
  return t
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/\s+AIRPORT\s*$/i, '')
    .trim();
}

function flightCode(model: HawbOfficialModel): string {
  const m = model.flightDate.match(/[A-Z]{2}\d{2,4}/i);
  return m?.[0]?.toUpperCase() || model.carrier;
}

function ctnLine(model: HawbOfficialModel): string {
  const fromHandling = (model.handling || '').match(/CTN\s*-?\s*([\d\-–]+)/i);
  if (fromHandling) return `CTN - ${fromHandling[1]}`;
  const fromNature = (model.natureOfGoods || '').match(/CTN\s*-?\s*([\d\-–]+)/i);
  if (fromNature) return `CTN - ${fromNature[1]}`;
  return '';
}

/**
 * Map overlay slot id → printable value for Original-1/2 sparse faces.
 * Never invents Fresa identity; empty when model field empty (entity-bound).
 */
export function sparseValueForSlot(
  id: string,
  model: HawbOfficialModel,
  layout: HawbOfficialLayoutConfig,
): string {
  switch (id) {
    case 'branding':
      return [model.companyName, model.companyPhone ? `PHONE: ${model.companyPhone}` : '']
        .filter(Boolean)
        .slice(0, 2)
        .join('\n');
    case 'hawbNoTop':
    case 'hawbNoMid':
    case 'hawbNoFooter':
      return model.hawbNo;
    case 'mawbTop':
    case 'mawbMid':
      return model.mawbNo;
    case 'shipper':
      return model.shipperLines.slice(0, 4).join('\n');
    case 'consignee':
      return model.consigneeLines.slice(0, 4).join('\n');
    case 'agent':
      return model.companyName || model.agentLines[0] || '';
    case 'agentRight':
      return [model.companyName || model.agentLines[0], model.companyPhone ? `PHONE: ${model.companyPhone}` : '']
        .filter(Boolean)
        .join('\n');
    case 'departure':
      return model.departure;
    case 'destination':
      return shortDestination(model.destination);
    case 'toCode':
      return model.toCode;
    case 'flight':
      return flightCode(model);
    case 'flightDate':
      return model.flightDate;
    case 'currency':
      return model.currency;
    case 'chgsPp1':
    case 'chgsPp2':
      return model.currency || model.pieces ? 'PP' : '';
    case 'declaredCarriage':
      return model.declaredCarriage;
    case 'declaredCustoms':
      return model.declaredCustoms || layout.customsDefaultWhenEmpty;
    case 'insurance':
      return model.insurance;
    case 'handling':
      // Pin right band is FREIGHT PREPAID (accounting / incoterm), not CTN marks.
      return model.accounting || model.handling;
    case 'marks':
      return model.handling || '';
    case 'packagesLine':
      return model.pieces ? `TOTAL : (${model.pieces}) PACKAGES ONLY` : '';
    case 'pieces':
      return model.pieces;
    case 'gross':
      return model.grossWeight;
    case 'kg':
      return model.pieces || model.grossWeight ? 'K' : '';
    case 'rateClass':
      return model.natureOfGoods ? 'S' : '';
    case 'chargeable':
      return model.chargeableWeight;
    case 'rateTotal':
      return model.total || (model.pieces || model.grossWeight ? '0.00' : '');
    case 'nature': {
      const first = (model.natureOfGoods || '')
        .split(/\n/)
        .map((l) => l.trim())
        .filter(Boolean)[0];
      return first || '';
    }
    case 'ctnBelow':
      return ctnLine(model);
    case 'prepaid1':
    case 'prepaid2':
      return model.pieces || model.grossWeight ? '0.00' : '';
    case 'carrierSignName':
      return model.companyName;
    case 'carrierSign':
      return model.carrier ? `AS AGENT FOR THE CARRIER,\n${model.carrier}` : '';
    case 'executedOn':
      return model.executedOn;
    case 'executedAt':
      return model.executedAt;
    case 'signatory':
      return '';
    default:
      return '';
  }
}
