import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { FieldError } from '@/components/ui/FieldError/FieldError';
import { useInlineValidation } from '@/lib/validation';
import { useJobNoteMutations } from '../../hooks/useJobActions';
import { useJobNotes } from '../../hooks/useJobs';
import { createJobNoteSchema, updateJobNoteSchema } from '../../schemas/job.schema';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface JobNotesPanelProps {
  jobId: string;
}

function noteTextareaClass(hasError: boolean) {
  return `w-full min-h-[80px] rounded-md border px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)] ${
    hasError
      ? 'border-[var(--color-danger-500)]'
      : 'border-[var(--color-neutral-200)]'
  }`;
}

export function JobNotesPanel({ jobId }: JobNotesPanelProps) {
  const { data: notes = [], refetch } = useJobNotes(jobId);
  const mutations = useJobNoteMutations(jobId);
  const validation = useInlineValidation();
  const [text, setText] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const addNote = async () => {
    const ok = await validation.runValidated(createJobNoteSchema, { note: text }, async (dto) => {
      await mutations.create.mutateAsync(dto);
      setText('');
    });
    if (ok) refetch();
  };

  const saveEdit = async (noteId: string) => {
    const ok = await validation.runValidated(
      updateJobNoteSchema,
      { note: editText },
      async (dto) => {
        await mutations.update.mutateAsync({ noteId, dto });
        setEditId(null);
      },
    );
    if (ok) refetch();
  };

  return (
    <div className="space-y-4">
      {(error || validation.formError) && (
        <p className="text-sm text-[var(--color-danger-600)]">{error || validation.formError}</p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-400)]">No notes yet.</p>
          ) : (
            notes.map((raw) => {
              const n = raw as {
                id: string;
                note?: string;
                content?: string;
                created_at?: string;
              };
              const body = n.note ?? n.content ?? '';
              const isEditing = editId === n.id;
              return (
                <div key={n.id} className="text-sm border-b border-[var(--color-neutral-100)] pb-2">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        className={noteTextareaClass(Boolean(validation.fieldError('note')))}
                        value={editText}
                        onChange={(e) => {
                          setEditText(e.target.value);
                          validation.clearField('note');
                        }}
                      />
                      <FieldError message={validation.fieldError('note')} />
                      <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={() => saveEdit(n.id)}>
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditId(null);
                            validation.clearErrors();
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p>{body}</p>
                      {n.created_at && (
                        <p className="text-xs text-[var(--color-neutral-400)] mt-1">
                          {n.created_at}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditId(n.id);
                            setEditText(body);
                            validation.clearErrors();
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() => run(() => mutations.remove.mutateAsync(n.id))}
                        >
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add note</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-2">
          <textarea
            className={noteTextareaClass(Boolean(validation.fieldError('note')))}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              validation.clearField('note');
            }}
          />
          <FieldError message={validation.fieldError('note')} />
          <Button
            type="button"
            disabled={mutations.create.isPending}
            onClick={() => void addNote()}
          >
            Add note
          </Button>
        </div>
      </Card>
    </div>
  );
}
