import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useJobNoteMutations } from '../../hooks/useJobActions';
import { useJobNotes } from '../../hooks/useJobs';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface JobNotesPanelProps {
  jobId: string;
}

export function JobNotesPanel({ jobId }: JobNotesPanelProps) {
  const { data: notes = [], refetch } = useJobNotes(jobId);
  const mutations = useJobNoteMutations(jobId);
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

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-[var(--color-danger-600)]">{error}</p>}
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
                        className="w-full min-h-[60px] rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            run(async () => {
                              await mutations.update.mutateAsync({
                                noteId: n.id,
                                dto: { note: editText },
                              });
                              setEditId(null);
                            })
                          }
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditId(null)}
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
            className="w-full min-h-[80px] rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            type="button"
            disabled={mutations.create.isPending}
            onClick={() =>
              run(async () => {
                if (!text.trim()) return;
                await mutations.create.mutateAsync({ note: text.trim() });
                setText('');
              })
            }
          >
            Add note
          </Button>
        </div>
      </Card>
    </div>
  );
}
