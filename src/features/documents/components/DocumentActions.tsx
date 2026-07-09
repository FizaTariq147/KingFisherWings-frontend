import {
  Eye, ScanEye, Download, Mail, Pencil, CheckCircle, Trash2, Printer,
} from 'lucide-react'

export interface DocumentRights {
  canView: boolean
  canPreview: boolean
  canDownload: boolean
  canEmail: boolean
  canEdit: boolean
  canFinalize: boolean
  canDelete: boolean
  canReprint: boolean
}

interface DocumentActionsProps {
  rights: DocumentRights
  onAction: (action: string) => void
}

const ACTIONS = [
  { key: 'canView',     action: 'view',     Icon: Eye,         label: 'View' },
  { key: 'canPreview',  action: 'preview',  Icon: ScanEye,     label: 'Preview' },
  { key: 'canDownload', action: 'download', Icon: Download,    label: 'Download' },
  { key: 'canEmail',    action: 'email',    Icon: Mail,        label: 'Email' },
  { key: 'canEdit',     action: 'edit',     Icon: Pencil,      label: 'Edit' },
  { key: 'canFinalize', action: 'finalize', Icon: CheckCircle, label: 'Finalize' },
  { key: 'canDelete',   action: 'delete',   Icon: Trash2,      label: 'Delete' },
  { key: 'canReprint',  action: 'reprint',  Icon: Printer,     label: 'Reprint' },
] as const

export default function DocumentActions({ rights, onAction }: DocumentActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {ACTIONS.map(({ key, action, Icon, label }) => {
        if (!rights[key as keyof DocumentRights]) return null
        const isDelete = action === 'delete'
        return (
          <button
            key={action}
            type="button"
            title={label}
            aria-label={label}
            onClick={() => onAction(action)}
            className={[
              'size-8 rounded-md flex items-center justify-center transition-colors',
              isDelete ? 'text-red-500 hover:bg-red-50' : 'hover:bg-gray-100',
            ].join(' ')}
          >
            <Icon size={15} aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}