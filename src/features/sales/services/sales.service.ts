import { crmLeadsService } from '@/features/crm/services/crmLeads.service';
import { customerServiceService } from '@/features/customers/services/customerService.service';
import { partyService } from '@/features/parties/services/party.service';
import { tariffService } from '@/features/tariffs/services/tariff.service';
import type {
  SalesClientListParams,
  SalesClientRow,
  SalesShipmentFilters,
  SalesShipmentRow,
  SalesTariffListParams,
  SalesTariffRow,
  SalesVisitingCardParams,
  SalesVisitingCardRow,
} from '../types/sales.types';
import {
  filterVisitingCardLeads,
  mapLeadToVisitingCardRow,
  mapPartyToClientRow,
  mapTariffToSalesRow,
} from '../utils/normalizeSales';

export const salesService = {
  async listClients(params: SalesClientListParams = {}): Promise<SalesClientRow[]> {
    const result = await partyService.list({
      page: params.page ?? 1,
      limit: params.limit ?? 200,
      search: params.search,
      party_type: 'CUSTOMER',
      order: 'desc',
    });
    return result.parties.map(mapPartyToClientRow);
  },

  async listTariffs(params: SalesTariffListParams = {}): Promise<SalesTariffRow[]> {
    const result = await tariffService.list({
      page: params.page ?? 1,
      limit: params.limit ?? 200,
      search: params.search,
      order: 'desc',
    });
    let rows = result.tariffs.map(mapTariffToSalesRow);
    if (params.search?.trim()) {
      const term = params.search.trim().toLowerCase();
      rows = rows.filter((row) =>
        [row.owner, row.client, row.charge, row.origin, row.destination, row.service]
          .join(' ')
          .toLowerCase()
          .includes(term),
      );
    }
    return rows;
  },

  async listSalesShipments(filters: SalesShipmentFilters): Promise<SalesShipmentRow[]> {
    return customerServiceService.listShipments(filters);
  },

  async listVisitingCards(params: SalesVisitingCardParams = {}): Promise<SalesVisitingCardRow[]> {
    const result = await crmLeadsService.list({
      page: params.page ?? 1,
      limit: params.limit ?? 200,
      search: params.search,
    });
    return filterVisitingCardLeads(result.items, params.search).map(mapLeadToVisitingCardRow);
  },
};
