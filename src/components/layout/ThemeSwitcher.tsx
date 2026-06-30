import { useThemeStore, type Theme } from '../../store/themeStore'

const SWATCHES: { theme: Theme; color: string; label: string }[] = [
  { theme: 'green', color: '#16A34A', label: 'Forest Green' },
  { theme: 'blue',  color: '#2563EB', label: 'Ocean Blue' },
  { theme: 'red',   color: '#E11D48', label: 'Crimson Red' },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore()

  return (
    <div className="flex items-center gap-3" role="group" aria-label="Select theme">
      {SWATCHES.map(({ theme: t, color, label }) => (
        <button
          key={t}
          type="button"
          aria-label={label}
          aria-pressed={theme === t}
          onClick={() => setTheme(t)}
          className={[
            'w-7 h-7 rounded-full transition-shadow shrink-0',
            theme === t ? 'ring-2 ring-offset-2 ring-[var(--color-neutral-400)]' : '',
          ].join(' ')}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}