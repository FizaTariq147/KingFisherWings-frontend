export interface EmployeeRow {
  id: string;
  branch: string;
  name: string;
  code: string;
  type: string;
  designation: string;
  department: string;
  birthDate: string;
  employment: string;
  gender: string;
  grade: string;
  joinDate: string;
  mobile: string;
  status: 'ACTIVE' | 'INACTIVE';
}