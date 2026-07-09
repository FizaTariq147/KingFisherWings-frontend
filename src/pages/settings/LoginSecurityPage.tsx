import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'
import { axiosInstance } from '@/lib/axios'
import { LoginSecurityForm } from '@/components/loginSecurity/LoginSecurityForm'

interface UserOption {
  id:    string
  name:  string
  email: string
}

export default function LoginSecurityPage() {
  const [users, setUsers]       = useState<UserOption[]>([])
  const [selectedId, setSelected] = useState<string>('')
  const [usersLoading, setUsersLoading] = useState(true)

  useEffect(() => {
    axiosInstance
      .get<{ data: UserOption[] }>('/api/users?limit=200')
      .then(({ data }) => {
        setUsers(data.data)
        if (data.data.length > 0) setSelected(data.data[0].id)
      })
      .finally(() => setUsersLoading(false))
  }, [])

  const selectedUser = users.find((u) => u.id === selectedId)

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-primary-50)' }}
        >
          <Shield size={18} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-[var(--color-neutral-900)]">
            Login Security
          </h1>
          <p className="text-xs text-[var(--color-neutral-400)]">
            Configure IP, MAC, and office hours restrictions per user.
          </p>
        </div>
      </div>

      {/* User selector */}
      <div className="mb-5">
        <label
          htmlFor="user-select"
          className="block text-xs font-medium text-[var(--color-neutral-600)] mb-1.5"
        >
          Select user
        </label>
        {usersLoading ? (
          <div className="h-9 rounded-lg bg-[var(--color-neutral-100)] animate-pulse" />
        ) : (
          <select
            id="user-select"
            value={selectedId}
            onChange={(e) => setSelected(e.target.value)}
            className="h-9 w-full rounded-lg border border-[var(--color-neutral-200)] px-3 text-sm text-[var(--color-neutral-800)] bg-white outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-100)]"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.email}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Form */}
      {selectedId && selectedUser && (
        <LoginSecurityForm userId={selectedId} userName={selectedUser.name} />
      )}
    </div>
  )
}