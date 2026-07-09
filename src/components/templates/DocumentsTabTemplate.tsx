// PASTE THIS AT: src/components/templates/DocumentsTabTemplate.tsx
// Maps directly to Ch.16.3 (document categories) and Ch.3.5 (document rights)
// from the spec — every job type's Documents tab composes this the same way.

import { FileText, Eye, Download, Mail, CheckCircle2 } from 'lucide-react';

export interface JobDocument {
  id: string;
  type: string;
  category: string; // Shipping | Finance | Communication | Internal | Operations
  status: 'draft' | 'original';
  generatedAt: string;
  rights: { view?: boolean; download?: boolean; email?: boolean; finalize?: boolean };
}

interface DocumentsTabTemplateProps {
  documents: JobDocument[];
  availableTypes?: { type: string; category: string }[]; // not yet generated
  onGenerate?: (type: string) => void;
  onView?: (doc: JobDocument) => void;
  onDownload?: (doc: JobDocument) => void;
  onEmail?: (doc: JobDocument) => void;
  onFinalize?: (doc: JobDocument) => void;
}

export function DocumentsTabTemplate({
  documents, availableTypes = [], onGenerate, onView, onDownload, onEmail, onFinalize,
}: DocumentsTabTemplateProps) {
  const byCategory = documents.reduce<Record<string, JobDocument[]>>((acc, d) => {
    (acc[d.category] ??= []).push(d);
    return acc;
  }, {});

  const notYetGenerated = availableTypes.filter(
    (t) => !documents.some((d) => d.type === t.type)
  );

  return (
    <div className="space-y-6">
      {Object.entries(byCategory).map(([category, docs]) => (
        <div key={category} className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">{category}</h3>
          <div className="divide-y divide-slate-50">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-slate-300" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{doc.type}</p>
                    <p className="text-xs text-slate-400">{new Date(doc.generatedAt).toLocaleString()}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    doc.status === 'original' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {doc.status === 'original' ? 'Original' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {doc.rights.view && (
                    <button onClick={() => onView?.(doc)} className="p-1.5 rounded-md text-slate-400 hover:text-navy hover:bg-surface transition-colors" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  {doc.rights.download && (
                    <button onClick={() => onDownload?.(doc)} className="p-1.5 rounded-md text-slate-400 hover:text-navy hover:bg-surface transition-colors" title="Download">
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  {doc.rights.email && (
                    <button onClick={() => onEmail?.(doc)} className="p-1.5 rounded-md text-slate-400 hover:text-navy hover:bg-surface transition-colors" title="Email">
                      <Mail className="h-4 w-4" />
                    </button>
                  )}
                  {doc.rights.finalize && doc.status === 'draft' && (
                    <button onClick={() => onFinalize?.(doc)} className="flex items-center gap-1 text-xs font-medium text-brandOrange hover:text-brandOrange-700 px-2 transition-colors">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Finalize
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {notYetGenerated.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Not yet generated</h3>
          <div className="flex flex-wrap gap-2">
            {notYetGenerated.map((t) => (
              <button
                key={t.type}
                onClick={() => onGenerate?.(t.type)}
                className="rounded-lg border border-dashed border-slate-300 text-slate-500 text-xs font-medium px-3 py-2 hover:border-brandOrange hover:text-brandOrange transition-colors"
              >
                + Generate {t.type}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}