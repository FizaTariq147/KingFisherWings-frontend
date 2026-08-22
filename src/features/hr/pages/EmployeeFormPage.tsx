import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { EmployeeForm } from '@/features/hr/components/EmployeeForm';
import { hrService } from '@/features/hr/services/hr.service';
import type { CreateEmployeeDto } from '@/features/hr/types/hr.types';

export default function EmployeeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  const [error, setError] = useState<string | null>(null);

  const { data: employee, isLoading } = useQuery({
    queryKey: ['hr', 'employee', id],
    queryFn: () => hrService.getEmployee(id!),
    enabled: isEdit,
  });

  const save = useMutation({
    mutationFn: (dto: CreateEmployeeDto) =>
      isEdit ? hrService.updateEmployee(id!, dto) : hrService.createEmployee(dto),
    onSuccess: (row) => {
      void queryClient.invalidateQueries({ queryKey: ['hr', 'employees'] });
      navigate(`/hr/employee-master/${row.id}`);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Could not save employee.');
    },
  });

  return (
    <div className="space-y-3">
      <PageBackLink to="/hr/employee-master" label="Back to employees" />
      <div className="bg-white border border-gray-200 rounded-md p-5">
        <h2 className="text-[17px] font-medium text-gray-800 mb-4">
          {isEdit ? 'Edit employee' : 'Create employee'}
        </h2>
        {isEdit && isLoading ? (
          <p className="text-sm text-gray-500">Loading employee…</p>
        ) : (
          <EmployeeForm
            employee={isEdit ? employee : null}
            submitting={save.isPending}
            error={error}
            onSubmit={(dto) => {
              setError(null);
              save.mutate(dto);
            }}
          />
        )}
      </div>
    </div>
  );
}
