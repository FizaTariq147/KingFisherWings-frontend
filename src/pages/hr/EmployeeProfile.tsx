import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { hrService } from '../../features/hr/services/hr.service';
import { DOCUMENT_TYPES, labelEnum } from '../../features/hr/constants/hr.constants';
import {
  createDocumentSchema,
  createDependentSchema,
  createEmploymentHistorySchema,
  createQualificationSchema,
  createSkillSchema,
  linkUserSchema,
  parseWithFieldErrors,
  type FieldErrors,
} from '../../features/hr/schemas/hr.schema';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  ACTIVE: 'success',
  PROBATION: 'info',
  ON_LEAVE: 'warning',
  SUSPENDED: 'warning',
  TERMINATED: 'danger',
  INACTIVE: 'neutral',
  Valid: 'success',
  Expiring: 'warning',
  Expired: 'danger',
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'danger',
};

type Tab = 'personal' | 'documents' | 'leave' | 'salary' | 'emergency' | 'career';

const tabs: { key: Tab; label: string }[] = [
  { key: 'personal', label: 'Personal Info' },
  { key: 'documents', label: 'Documents' },
  { key: 'leave', label: 'Leave Summary' },
  { key: 'salary', label: 'Salary History' },
  { key: 'career', label: 'Career' },
  { key: 'emergency', label: 'Emergency Contact' },
];

export default function EmployeeProfile() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [docOpen, setDocOpen] = useState(false);
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0]);
  const [docNo, setDocNo] = useState('');
  const [docExpiry, setDocExpiry] = useState('');
  const [careerModal, setCareerModal] = useState<'history' | 'qualification' | 'skill' | 'dependent' | 'link' | null>(
    null,
  );
  const [employerName, setEmployerName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [qualTitle, setQualTitle] = useState('');
  const [qualInstitution, setQualInstitution] = useState('');
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [depName, setDepName] = useState('');
  const [depRelation, setDepRelation] = useState<'SPOUSE' | 'CHILD' | 'OTHER'>('SPOUSE');
  const [linkUserId, setLinkUserId] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { data: employee, isLoading, isError, error } = useQuery({
    queryKey: ['hr', 'employee', id],
    queryFn: () => hrService.getEmployee(id),
    enabled: Boolean(id),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['hr', 'employee-docs', id],
    queryFn: () => hrService.listDocuments(id),
    enabled: Boolean(id) && activeTab === 'documents',
  });

  const { data: leaveRecords = [] } = useQuery({
    queryKey: ['hr', 'employee-leave', id],
    queryFn: () => hrService.listLeaveRequests({ employee_id: id }),
    enabled: Boolean(id) && activeTab === 'leave',
  });

  const { data: dependents = [] } = useQuery({
    queryKey: ['hr', 'employee-dependents', id],
    queryFn: () => hrService.listDependents(id),
    enabled: Boolean(id) && (activeTab === 'emergency' || activeTab === 'career'),
  });

  const { data: history = [] } = useQuery({
    queryKey: ['hr', 'employee-history', id],
    queryFn: () => hrService.listEmploymentHistory(id),
    enabled: Boolean(id) && activeTab === 'career',
  });

  const { data: qualifications = [] } = useQuery({
    queryKey: ['hr', 'employee-qualifications', id],
    queryFn: () => hrService.listQualifications(id),
    enabled: Boolean(id) && activeTab === 'career',
  });

  const { data: skills = [] } = useQuery({
    queryKey: ['hr', 'employee-skills', id],
    queryFn: () => hrService.listSkills(id),
    enabled: Boolean(id) && activeTab === 'career',
  });

  const addDocument = useMutation({
    mutationFn: (payload: {
      document_type: (typeof DOCUMENT_TYPES)[number];
      document_no?: string;
      expires_at?: string;
    }) => hrService.createDocument(id, payload),
    onSuccess: () => {
      setDocOpen(false);
      setDocNo('');
      setDocExpiry('');
      setFieldErrors({});
      void queryClient.invalidateQueries({ queryKey: ['hr', 'employee-docs', id] });
    },
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Could not add document.'),
  });

  const submitCareer = async () => {
    setActionError(null);
    try {
      if (careerModal === 'history') {
        const parsed = parseWithFieldErrors(createEmploymentHistorySchema, {
          employer_name: employerName,
          job_title: jobTitle.trim() || undefined,
        });
        if (!parsed.success) {
          setFieldErrors(parsed.fieldErrors);
          setActionError(parsed.message);
          return;
        }
        await hrService.addEmploymentHistory(id, parsed.data);
        void queryClient.invalidateQueries({ queryKey: ['hr', 'employee-history', id] });
      } else if (careerModal === 'qualification') {
        const parsed = parseWithFieldErrors(createQualificationSchema, {
          title: qualTitle,
          institution: qualInstitution.trim() || undefined,
        });
        if (!parsed.success) {
          setFieldErrors(parsed.fieldErrors);
          setActionError(parsed.message);
          return;
        }
        await hrService.addQualification(id, parsed.data);
        void queryClient.invalidateQueries({ queryKey: ['hr', 'employee-qualifications', id] });
      } else if (careerModal === 'skill') {
        const parsed = parseWithFieldErrors(createSkillSchema, {
          name: skillName,
          level: skillLevel.trim() || undefined,
        });
        if (!parsed.success) {
          setFieldErrors(parsed.fieldErrors);
          setActionError(parsed.message);
          return;
        }
        await hrService.addSkill(id, parsed.data);
        void queryClient.invalidateQueries({ queryKey: ['hr', 'employee-skills', id] });
      } else if (careerModal === 'dependent') {
        const parsed = parseWithFieldErrors(createDependentSchema, {
          full_name: depName,
          relation: depRelation,
        });
        if (!parsed.success) {
          setFieldErrors(parsed.fieldErrors);
          setActionError(parsed.message);
          return;
        }
        await hrService.addDependent(id, parsed.data);
        void queryClient.invalidateQueries({ queryKey: ['hr', 'employee-dependents', id] });
      } else if (careerModal === 'link') {
        const parsed = parseWithFieldErrors(linkUserSchema, { user_id: linkUserId });
        if (!parsed.success) {
          setFieldErrors(parsed.fieldErrors);
          setActionError(parsed.message);
          return;
        }
        await hrService.linkEmployeeUser(id, { user_id: parsed.data.user_id });
      }
      setCareerModal(null);
      setFieldErrors({});
      setEmployerName('');
      setJobTitle('');
      setQualTitle('');
      setQualInstitution('');
      setSkillName('');
      setSkillLevel('');
      setDepName('');
      setLinkUserId('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not save.');
    }
  };

  const submitDocument = () => {
    setActionError(null);
    const parsed = parseWithFieldErrors(createDocumentSchema, {
      document_type: docType,
      document_no: docNo.trim() || undefined,
      expires_at: docExpiry || undefined,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setActionError(parsed.message);
      return;
    }
    setFieldErrors({});
    addDocument.mutate({
      document_type: parsed.data.document_type,
      document_no: parsed.data.document_no,
      expires_at: parsed.data.expires_at,
    });
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500 p-6">Loading employee…</p>;
  }

  if (isError || !employee) {
    return (
      <div className="space-y-3 p-6">
        <PageBackLink to="/hr/employee-master" label="Back to employees" />
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : 'Employee not found.'}
        </p>
      </div>
    );
  }

  const totalLeaveUsed = leaveRecords
    .filter((item) => item.status.toUpperCase().includes('APPROV'))
    .reduce((sum, item) => sum + item.days, 0);
  const pendingLeave = leaveRecords.filter((item) => item.status.toUpperCase().includes('PEND')).length;

  return (
    <div className="space-y-4">
      <PageBackLink to="/hr/employee-master" label="Back to employees" />
      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-lg font-semibold text-slate-600">
            {employee.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Employee</p>
            <h2 className="text-xl font-semibold">{employee.name}</h2>
            <p className="text-sm">{employee.designation || labelEnum(employee.type || '')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant[employee.status] ?? 'neutral'}>{employee.status}</Badge>
          <Button variant="secondary" onClick={() => navigate(`/hr/employee-master/${id}/edit`)}>
            Edit
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
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
          <div className="space-y-2 text-sm">
            <p><strong>Code:</strong> {employee.code || '—'}</p>
            <p><strong>Department:</strong> {employee.department || '—'}</p>
            <p><strong>Email:</strong> {employee.email || '—'}</p>
            <p><strong>Phone:</strong> {employee.mobile || '—'}</p>
            <p><strong>Nationality:</strong> {employee.nationality || '—'}</p>
            <p><strong>Join Date:</strong> {employee.joinDate || '—'}</p>
            <p><strong>Contract Type:</strong> {employee.contractType ? labelEnum(employee.contractType) : '—'}</p>
            <p>
              <strong>Base Salary:</strong> {employee.basicSalary || 0} AED
            </p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-3">
            <Button size="sm" onClick={() => setDocOpen(true)}>
              + Add document
            </Button>
            {documents.length === 0 ? (
              <p className="text-sm text-gray-500">No documents on file.</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{labelEnum(doc.document_type)}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.document_no ? `${doc.document_no} · ` : ''}Expires: {doc.expires_at || '—'}
                    </p>
                  </div>
                  <Badge variant={statusVariant[doc.status] ?? 'neutral'}>{doc.status}</Badge>
                </div>
              ))
            )}
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
                    <p className="font-medium">{labelEnum(leave.type)}</p>
                    <p className="text-sm text-muted-foreground">
                      {leave.from} to {leave.to} ({leave.days} days)
                    </p>
                  </div>
                  <Badge variant={statusVariant[leave.status] ?? 'neutral'}>{leave.status}</Badge>
                </div>
              ))}
              {leaveRecords.length === 0 && (
                <p className="text-sm text-gray-500">No leave requests for this employee.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'salary' && (
          <div className="space-y-2 text-sm">
            <p><strong>Basic:</strong> {employee.basicSalary || 0} AED</p>
            <p><strong>Housing:</strong> {employee.housingAllowance || 0} AED</p>
            <p><strong>Transport:</strong> {employee.transportAllowance || 0} AED</p>
            <p className="text-xs text-gray-500">
              Payslip history is generated from payroll runs (HR → Pay Roll).
            </p>
          </div>
        )}

        {activeTab === 'career' && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => { setFieldErrors({}); setCareerModal('history'); }}>
                + Employment history
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { setFieldErrors({}); setCareerModal('qualification'); }}>
                + Qualification
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { setFieldErrors({}); setCareerModal('skill'); }}>
                + Skill
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { setFieldErrors({}); setCareerModal('dependent'); }}>
                + Dependent
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { setFieldErrors({}); setCareerModal('link'); }}>
                Link user account
              </Button>
            </div>
            <div>
              <p className="font-medium mb-2">Employment history</p>
              {history.length === 0 ? (
                <p className="text-gray-500">No history yet.</p>
              ) : (
                history.map((row) => (
                  <p key={row.id} className="border rounded p-2 mb-2">
                    {row.employer_name}
                    {row.job_title ? ` · ${row.job_title}` : ''}
                    {row.start_date ? ` (${row.start_date}${row.end_date ? `–${row.end_date}` : ''})` : ''}
                  </p>
                ))
              )}
            </div>
            <div>
              <p className="font-medium mb-2">Qualifications</p>
              {qualifications.length === 0 ? (
                <p className="text-gray-500">No qualifications yet.</p>
              ) : (
                qualifications.map((row) => (
                  <p key={row.id} className="border rounded p-2 mb-2">
                    {row.title}
                    {row.institution ? ` · ${row.institution}` : ''}
                    {row.year_awarded ? ` · ${row.year_awarded}` : ''}
                  </p>
                ))
              )}
            </div>
            <div>
              <p className="font-medium mb-2">Skills</p>
              {skills.length === 0 ? (
                <p className="text-gray-500">No skills yet.</p>
              ) : (
                skills.map((row) => (
                  <p key={row.id} className="border rounded p-2 mb-2">
                    {row.name}
                    {row.level ? ` · ${row.level}` : ''}
                  </p>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="space-y-3 text-sm">
            <p><strong>Name:</strong> {employee.emergencyName || '—'}</p>
            <p><strong>Phone:</strong> {employee.emergencyPhone || '—'}</p>
            {dependents.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="font-medium">Dependents</p>
                {dependents.map((dep) => (
                  <p key={dep.id}>
                    {dep.full_name} · {labelEnum(dep.relation)}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        open={docOpen}
        onClose={() => setDocOpen(false)}
        title="Add document"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDocOpen(false)}>
              Cancel
            </Button>
            <Button disabled={addDocument.isPending} onClick={submitDocument}>
              {addDocument.isPending ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Type</span>
            <select
              className="w-full h-9 border rounded px-3"
              value={docType}
              onChange={(e) => setDocType(e.target.value as typeof docType)}
            >
              {DOCUMENT_TYPES.map((item) => (
                <option key={item} value={item}>
                  {labelEnum(item)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Document no.</span>
            <input
              className={`w-full h-9 border rounded px-3 ${fieldErrors.document_no ? 'border-red-400' : ''}`}
              maxLength={80}
              value={docNo}
              onChange={(e) => setDocNo(e.target.value)}
            />
            {fieldErrors.document_no ? (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.document_no}</span>
            ) : null}
          </label>
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Expiry</span>
            <input
              type="date"
              className={`w-full h-9 border rounded px-3 ${fieldErrors.expires_at ? 'border-red-400' : ''}`}
              value={docExpiry}
              onChange={(e) => setDocExpiry(e.target.value)}
            />
            {fieldErrors.expires_at ? (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.expires_at}</span>
            ) : null}
          </label>
        </div>
      </Modal>

      <Modal
        open={Boolean(careerModal)}
        onClose={() => setCareerModal(null)}
        title={
          careerModal === 'history'
            ? 'Add employment history'
            : careerModal === 'qualification'
              ? 'Add qualification'
              : careerModal === 'skill'
                ? 'Add skill'
                : careerModal === 'dependent'
                  ? 'Add dependent'
                  : 'Link user account'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setCareerModal(null)}>
              Cancel
            </Button>
            <Button onClick={() => void submitCareer()}>Save</Button>
          </>
        }
      >
        <div className="space-y-3">
          {careerModal === 'history' && (
            <>
              <label className="block text-sm">
                <span className="block text-xs text-gray-600 mb-1">Employer *</span>
                <input className="w-full h-9 border rounded px-3" value={employerName} onChange={(e) => setEmployerName(e.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="block text-xs text-gray-600 mb-1">Job title</span>
                <input className="w-full h-9 border rounded px-3" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </label>
            </>
          )}
          {careerModal === 'qualification' && (
            <>
              <label className="block text-sm">
                <span className="block text-xs text-gray-600 mb-1">Title *</span>
                <input className="w-full h-9 border rounded px-3" value={qualTitle} onChange={(e) => setQualTitle(e.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="block text-xs text-gray-600 mb-1">Institution</span>
                <input className="w-full h-9 border rounded px-3" value={qualInstitution} onChange={(e) => setQualInstitution(e.target.value)} />
              </label>
            </>
          )}
          {careerModal === 'skill' && (
            <>
              <label className="block text-sm">
                <span className="block text-xs text-gray-600 mb-1">Skill *</span>
                <input className="w-full h-9 border rounded px-3" value={skillName} onChange={(e) => setSkillName(e.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="block text-xs text-gray-600 mb-1">Level</span>
                <input className="w-full h-9 border rounded px-3" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} />
              </label>
            </>
          )}
          {careerModal === 'dependent' && (
            <>
              <label className="block text-sm">
                <span className="block text-xs text-gray-600 mb-1">Full name *</span>
                <input className="w-full h-9 border rounded px-3" value={depName} onChange={(e) => setDepName(e.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="block text-xs text-gray-600 mb-1">Relation *</span>
                <select className="w-full h-9 border rounded px-3" value={depRelation} onChange={(e) => setDepRelation(e.target.value as typeof depRelation)}>
                  <option value="SPOUSE">Spouse</option>
                  <option value="CHILD">Child</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
            </>
          )}
          {careerModal === 'link' && (
            <label className="block text-sm">
              <span className="block text-xs text-gray-600 mb-1">User ID (UUID) *</span>
              <input className="w-full h-9 border rounded px-3" value={linkUserId} onChange={(e) => setLinkUserId(e.target.value)} placeholder="Staff user UUID" />
              {fieldErrors.user_id ? <span className="text-xs text-red-600">{fieldErrors.user_id}</span> : null}
            </label>
          )}
        </div>
      </Modal>
    </div>
  );
}
