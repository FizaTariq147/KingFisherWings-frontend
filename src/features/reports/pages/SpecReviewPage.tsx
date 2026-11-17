import { useEffect, useMemo, useState } from 'react'

type Span = {
  id: string
  text: string
  font: string
  size: number
  x: number
  y: number
  width: number
  role: 'static' | 'dynamic'
  binding?: string
}

type Spec = {
  code: string
  page: { width: number; height: number }
  spans: Span[]
}

const PILOTS = [
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'HBL_DRAFT_REPORT_FORMAT_JASPER',
  'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
]

export default function SpecReviewPage() {
  const [code, setCode] = useState(PILOTS[0])
  const [spec, setSpec] = useState<Spec | null>(null)
  const [mode, setMode] = useState<'all' | 'static' | 'dynamic'>('dynamic')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    setSpec(null)
    setMessage('')
    fetch(`/__spec-review/spec?code=${encodeURIComponent(code)}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Spec request failed (${response.status})`)
        return response.json()
      })
      .then((body: Spec) => {
        if (!cancelled) setSpec(body)
      })
      .catch((error: unknown) => {
        if (!cancelled) setMessage(error instanceof Error ? error.message : 'Could not load the spec')
      })
    return () => {
      cancelled = true
    }
  }, [code])

  const visible = useMemo(
    () => (spec?.spans || []).filter((span) => mode === 'all' || span.role === mode),
    [spec, mode],
  )

  function updateSpan(id: string, patch: Partial<Span>) {
    setSpec((current) => {
      if (!current) return current
      return {
        ...current,
        spans: current.spans.map((span) => (span.id === id ? { ...span, ...patch } : span)),
      }
    })
  }

  async function save() {
    if (!spec) return
    setMessage('Saving…')
    const response = await fetch(`/__spec-review/spec?code=${encodeURIComponent(code)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        code,
        spans: spec.spans.map((span) => ({ id: span.id, role: span.role, binding: span.binding || '' })),
      }),
    })
    setMessage(response.ok ? 'Saved the draft spec. It is not accepted.' : `Save failed (${response.status})`)
  }

  if (!import.meta.env.DEV) return null

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        <header className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold">Pilot spec review</h1>
          <p className="text-sm text-slate-600">Draft only. Nothing here is accepted.</p>
          <select className="rounded border bg-white px-2 py-1 text-sm" value={code} onChange={(event) => setCode(event.target.value)}>
            {PILOTS.map((pilot) => (
              <option key={pilot} value={pilot}>{pilot}</option>
            ))}
          </select>
          <select className="rounded border bg-white px-2 py-1 text-sm" value={mode} onChange={(event) => setMode(event.target.value as 'all' | 'static' | 'dynamic')}>
            <option value="dynamic">Dynamic spans</option>
            <option value="static">Static spans</option>
            <option value="all">All spans</option>
          </select>
          <button type="button" className="rounded bg-slate-900 px-3 py-1 text-sm text-white" onClick={() => void save()}>
            Save draft
          </button>
          {message ? <span className="text-sm">{message}</span> : null}
        </header>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="relative overflow-auto rounded border bg-white">
            {spec ? (
              <div className="relative mx-auto" style={{ width: '100%', maxWidth: 720 }}>
                <img
                  alt="Pinned reference"
                  className="block w-full"
                  src={`/__spec-review/png?code=${encodeURIComponent(code)}`}
                />
                {visible.map((span) => (
                  <div
                    key={span.id}
                    title={`${span.id} ${span.text}`}
                    className={span.role === 'dynamic' ? 'absolute border border-amber-500 bg-amber-400/20' : 'absolute border border-sky-600 bg-sky-500/15'}
                    style={{
                      left: `${(span.x / spec.page.width) * 100}%`,
                      top: `${((spec.page.height - span.y - span.size) / spec.page.height) * 100}%`,
                      width: `${Math.max(span.width, 4) / spec.page.width * 100}%`,
                      height: `${Math.max(span.size, 4) / spec.page.height * 100}%`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="p-4 text-sm">Loading the pinned page…</p>
            )}
          </div>
          <div className="max-h-[85vh] overflow-auto rounded border bg-white">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className="p-2">Span</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Binding</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((span) => (
                  <tr key={span.id} className="border-t align-top">
                    <td className="p-2">
                      <div className="font-medium">{span.id}</div>
                      <div className="max-w-40 break-words text-slate-600">{span.text}</div>
                    </td>
                    <td className="p-2">
                      <select
                        className="rounded border px-1 py-0.5"
                        value={span.role}
                        onChange={(event) => updateSpan(span.id, {
                          role: event.target.value as Span['role'],
                          binding: event.target.value === 'static' ? '' : span.binding,
                        })}
                      >
                        <option value="static">static</option>
                        <option value="dynamic">dynamic</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        className="w-full rounded border px-1 py-0.5"
                        value={span.binding || ''}
                        disabled={span.role !== 'dynamic'}
                        onChange={(event) => updateSpan(span.id, { binding: event.target.value })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
