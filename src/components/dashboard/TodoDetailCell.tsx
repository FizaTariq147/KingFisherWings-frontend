import { useState } from 'react'

interface TodoDetailCellProps {
  text: string
}

export function TodoDetailCell({ text }: TodoDetailCellProps) {
  const [expanded, setExpanded] = useState(false)
  // Rough heuristic — long free-text entries (e.g. pasted job notes) are the
  // ones that actually need truncation; short ones never show the toggle.
  const isLong = text.length > 110

  return (
    <div>
      <p className={expanded || !isLong ? '' : 'line-clamp-2'}>{text}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] font-medium mt-0.5 hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}
