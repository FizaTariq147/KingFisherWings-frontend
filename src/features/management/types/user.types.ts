export interface UserRow {
  id: string;
  name: string;
  displayName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCK';
  company: string;
  type: string;
  remarks: string;
  login: string;
}