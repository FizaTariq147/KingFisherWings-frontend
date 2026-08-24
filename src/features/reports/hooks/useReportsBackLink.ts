import { useSearchParams } from 'react-router-dom';

export function isFromReports(searchParams: URLSearchParams): boolean {
  return searchParams.get('from') === 'reports';
}

export function withFromReports(path: string): string {
  if (path.includes('from=reports')) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}from=reports`;
}

export function useReportsBackLink(fallback: { to: string; label: string }) {
  const [searchParams] = useSearchParams();
  if (isFromReports(searchParams)) {
    return { to: '/reports', label: 'Back to Reports' };
  }
  return fallback;
}
