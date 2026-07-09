import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../../components/ui/Badge';

interface Employee {
  id: string;
  name: string;
  code: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  nationality: string;
  joinDate: string;
  contractType: 'Full Time' | 'Part Time' | 'Contract';
  status: 'Active' | 'Inactive' | 'On Leave';
  visaExpiry: string;
  passportExpiry: string;
  baseSalary: number;
  currency: string;
}

interface EmployeeDocument {
  id: string;
  name: string;
  type: string;
  expiry: string;
  status: 'Valid' | 'Expiring' | 'Expired';
}

interface LeaveRecord {
  id: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedOn: string;
}

interface SalaryRecord {
  id: string;
  month: string;
  basic: number;
  allowances: number;
  deductions: number;
  net: number;
  currency: string;
  paidOn: string;
  status: 'Paid' | 'Pending';
}

interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  email: string;
}

const mockEmployee: Employee = {
  id: '1',
  name: 'Shahzad Zafar',
  code: 'EMP-001',
  designation: 'Operations Manager',
  department: 'Operations',
  email: 'shahzad.zafar@kingfisherwings.ae',
  phone: '+971 50 123 4567',
  nationality: 'Pakistani',
  joinDate: '2021-03-01',
  contractType: 'Full Time',
  status: 'Active',
  visaExpiry: '2027-02-28',
  passportExpiry: '2028-06-15',
  baseSalary: 18000,
  currency: 'AED',
};

const mockDocuments: EmployeeDocument[] = [
  { id: '1', name: 'UAE Residence Visa',  type: 'Visa',       expiry: '2027-02-28', status: 'Valid' },
  { id: '2', name: 'Passport',            type: 'Passport',   expiry: '2028-06-15', status: 'Valid' },
  { id: '3', name: 'Emirates ID',         type: 'Emirates ID', expiry: '2027-02-28', status: 'Valid' },
  { id: '4', name: 'Labour Card',         type: 'Labour Card', expiry: '2026-08-01', status: 'Expiring' },
  { id: '5', name: 'Medical Insurance',   type: 'Insurance',  expiry: '2026-12-31', status: 'Valid' },
];

const mockLeave: LeaveRecord[] = [
  { id: '1', type: 'Annual Leave',  from: '2026-07-01', to: '2026-07-15', days: 15, status: 'Approved', appliedOn: '2026-06-01' },
  { id: '2', type: 'Sick Leave',    from: '2026-05-10', to: '2026-05-11', days: 2,  status: 'Approved', appliedOn: '2026-05-10' },
  { id: '3', type: 'Emergency',     from: '2026-03-20', to: '2026-03-21', days: 2,  status: 'Approved', appliedOn: '2026-03-20' },
  { id: '4', type: 'Annual Leave',  from: '2026-08-10', to: '2026-08-20', days: 11, status: 'Pending',  appliedOn: '2026-06-20' },
];

const mockSalary: SalaryRecord[] = [
  { id: '1', month: 'Jun 2026', basic: 18000, allowances: 3500, deductions: 0,    net: 21500, currency: 'AED', paidOn: '2026-06-30', status: 'Pending' },
  { id: '2', month: 'May 2026', basic: 18000, allowances: 3500, deductions: 200,  net: 21300, currency: 'AED', paidOn: '2026-05-31', status: 'Paid' },
  { id: '3', month: 'Apr 2026', basic: 18000, allowances: 3500, deductions: 0,    net: 21500, currency: 'AED', paidOn: '2026-04-30', status: 'Paid' },
  { id: '4', month: 'Mar 2026', basic: 18000, allowances: 3500, deductions: 0,    net: 21500, currency: 'AED', paidOn: '2026-03-31', status: 'Paid' },
  { id: '5', month: 'Feb 2026', basic: 18000, allowances: 3500, deductions: 500,  net: 21000, currency: 'AED', paidOn: '2026-02-28', status: 'Paid' },
];

const mockEmergency: EmergencyContact = {
  name: 'Ayesha Zafar',
  relation: 'Spouse',
  phone: '+971 55 987 6543',
  email: 'ayesha.zafar@gmail.com',
};

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  Active:    'success',
  Inactive:  'neutral',
  'On Leave': 'warning',
  Valid:     'success',
  Expiring:  'warning',
  Expired:   'danger',
  Approved:  'success',
  Pending:   'warning',
  Rejected:  'danger',
  Paid:      'success',
};

type Tab = 'personal' | 'documents' | 'leave' | 'salary' | 'emergency';

const tabs: { key: Tab; label: string }[] = [
  { key: 'personal',  label: 'Personal Info' },
  { key: 'documents', label: 'Documents' },
  { key: 'leave',     label: 'Leave Summary' },
  { key: 'salary',    label: 'Salary History' },
  { key: 'emergency', label: 'Emergency Contact' },
];

export default function EmployeeProfile() {
  const [activeTab, setActiveTab] = useState<Tab>('personal');

  const { data: employee }         = useQuery<Employee>({ queryKey: ['employee', '1'], queryFn: async () => mockEmployee });
  const { data: documents = [] }   = useQuery<EmployeeDocument[]>({ queryKey: ['emp-docs', '1'], queryFn: async () => mockDocuments });
  const { data: leaveRecords = [] } = useQuery<LeaveRecord[]>({ queryKey: ['emp-leave', '1'], queryFn: async () => mockLeave });
  const { data: salaryRecords = [] } = useQuery<SalaryRecord[]>({ queryKey: ['emp-salary', '1'], queryFn: async () => mockSalary });
  const { data: emergency }        = useQuery<EmergencyContact>({ queryKey: ['emp-emergency', '1'], queryFn: async () => mockEmergency });

  if (!employee) return null;

  const totalLeaveUsed    = leaveRecords.filter((l) => l.status === 'Approved').reduce((s, l) => s + l.days, 0);
  const pendingLeave      = leaveRecords.filter((l) => l.status === 'Pending').length;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-200" />
          <div>
            <p className="text-sm text-muted-foreground">Employee</p>
            <h1 className="text-xl font-semibold">{employee.name}</h1>
            <p className="text-sm">{employee.designation}</p>
          </div>
        </div>
        <Badge variant={statusVariant[employee.status] ?? 'neutral'}>{employee.status}</Badge>
      </div>

      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'personal' && (
          <div className="space-y-2">
            <p><strong>Code:</strong> {employee.code}</p>
            <p><strong>Department:</strong> {employee.department}</p>
            <p><strong>Email:</strong> {employee.email}</p>
            <p><strong>Phone:</strong> {employee.phone}</p>
            <p><strong>Nationality:</strong> {employee.nationality}</p>
            <p><strong>Join Date:</strong> {employee.joinDate}</p>
            <p><strong>Contract Type:</strong> {employee.contractType}</p>
            <p><strong>Base Salary:</strong> {employee.baseSalary} {employee.currency}</p>
          </div>
        )}
        {activeTab === 'documents' && (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">Expires: {doc.expiry}</p>
                </div>
                <Badge variant={statusVariant[doc.status] ?? 'neutral'}>{doc.status}</Badge>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'leave' && (
          <div className="space-y-2">
            <p><strong>Total Leave Used:</strong> {totalLeaveUsed} days</p>
            <p><strong>Pending Requests:</strong> {pendingLeave}</p>
            <div className="mt-4 space-y-2">
              {leaveRecords.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{leave.type}</p>
                    <p className="text-sm text-muted-foreground">{leave.from} to {leave.to} ({leave.days} days)</p>
                  </div>
                  <Badge variant={statusVariant[leave.status] ?? 'neutral'}>{leave.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'salary' && (
          <div className="space-y-2">
            {salaryRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{record.month}</p>
                  <p className="text-sm text-muted-foreground">Net: {record.net} {record.currency}</p>
                </div>
                <Badge variant={statusVariant[record.status] ?? 'neutral'}>{record.status}</Badge>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'emergency' && emergency && (
          <div className="space-y-2">
            <p><strong>Name:</strong> {emergency.name}</p>
            <p><strong>Relation:</strong> {emergency.relation}</p>
            <p><strong>Phone:</strong> {emergency.phone}</p>
            <p><strong>Email:</strong> {emergency.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}
