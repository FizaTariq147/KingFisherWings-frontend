import type { EmployeeRow } from '../types/employee.types';
import { hrService } from './hr.service';

/** Employee list — GET /hr/employees */
export const employeeService = {
  getEmployees: async (): Promise<EmployeeRow[]> => {
    return hrService.listEmployees({ limit: 100 });
  },
};
