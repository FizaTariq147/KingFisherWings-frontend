import { salesService } from './sales.service';
import type { ClientRow } from '../types/client.types';

/** @deprecated Use salesService.listClients or useSalesClients — kept for legacy imports. */
export const clientService = {
  getClients: async (): Promise<ClientRow[]> => {
    const rows = await salesService.listClients({ limit: 200 });
    return rows.map((row) => ({
      createdBy: row.createdBy,
      code: row.code,
      name: row.name,
      status: row.status,
      type: row.type,
      category: row.category,
      port: row.port,
      website: row.website,
      vendorCode: row.vendorCode,
      remarks: row.remarks,
    }));
  },
};
