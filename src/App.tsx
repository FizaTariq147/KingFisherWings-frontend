import { useEffect } from 'react';
import { useUIStore } from './store/uiStore';

export default function App() {
  const { theme } = useUIStore();

  useEffect(() => {
    document.documentElement.classList.remove('theme-blue', 'theme-red');
    if (theme !== 'default') {
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-primary-50)]">
      <h1 className="text-2xl font-bold text-[var(--color-primary-700)]">
        Fresa Gold ✓
      </h1>
    </div>
  );
}