export type CustomerFilterOption = {
  value: string;
  label: string;
};

export type CustomerServiceFilterOptions = {
  branches: CustomerFilterOption[];
  clients: CustomerFilterOption[];
  salesPersons: CustomerFilterOption[];
  departments: CustomerFilterOption[];
  ports: CustomerFilterOption[];
  carriers: CustomerFilterOption[];
  vessels: CustomerFilterOption[];
  shippers: CustomerFilterOption[];
  consignees: CustomerFilterOption[];
};
