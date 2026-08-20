import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, X } from 'lucide-react';
import { SEARCH_MIN_CHARS, SEARCH_TYPE_FILTERS } from '../../constants/search.constants';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import type { SearchEntityTypeParam } from '../../api/search.api';
import type { SearchHit } from '../../types/search.types';
import {
  clearRecentSearches,
  loadRecentSearches,
  saveRecentSearch,
} from '../../utils/recentSearches';

function flattenHits(groups: Array<{ items: SearchHit[] }>): SearchHit[] {
  return groups.flatMap((g) => g.items);
}

export function GlobalSearch({ variant = 'compact' }: { variant?: 'compact' | 'inline' }) {
  const navigate = useNavigate();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<SearchEntityTypeParam[]>([
    'jobs',
    'quotations',
    'parties',
    'invoices',
  ]);
  const [recent, setRecent] = useState<string[]>(() => loadRecentSearches());
  const [activeIndex, setActiveIndex] = useState(-1);

  const typesParam =
    selectedTypes.length > 0 && selectedTypes.length < SEARCH_TYPE_FILTERS.length
      ? selectedTypes.join(',')
      : undefined;

  const {
    data,
    isFetching,
    isError,
    error,
    isWaitingForDebounce,
    canSearch,
    debouncedQuery,
  } = useGlobalSearch(
    { q: query, limit: 20, types: typesParam },
    { enabled: open },
  );

  const flatHits = useMemo(() => flattenHits(data?.groups ?? []), [data?.groups]);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const openSearch = useCallback(() => {
    setOpen(true);
    setRecent(loadRecentSearches());
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const selectHit = useCallback(
    (hit: SearchHit) => {
      const term = debouncedQuery || query.trim();
      if (term) setRecent(saveRecentSearch(term));
      close();
      setQuery('');
      if (hit.href && hit.href !== '#') navigate(hit.href);
    },
    [close, debouncedQuery, navigate, query],
  );

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, close]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (open) close();
        else openSearch();
        return;
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close, openSearch]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedQuery, data?.total]);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!flatHits.length) return;
      setActiveIndex((i) => (i + 1) % flatHits.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!flatHits.length) return;
      setActiveIndex((i) => (i <= 0 ? flatHits.length - 1 : i - 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && flatHits[activeIndex]) {
        selectHit(flatHits[activeIndex]);
      }
    }
  };

  const trimmed = query.trim();
  const showRecent = open && !trimmed;
  const showHint = open && trimmed.length > 0 && trimmed.length < SEARCH_MIN_CHARS;
  const showResults = open && canSearch && Boolean(debouncedQuery);
  const loading = isFetching || isWaitingForDebounce;

  const toggleType = (value: SearchEntityTypeParam) => {
    setSelectedTypes((prev) => {
      if (prev.includes(value)) {
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== value);
      }
      return [...prev, value];
    });
  };

  const panelClass =
    variant === 'inline'
      ? 'absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-800)] shadow-lg'
      : 'absolute right-0 top-full z-50 mt-2 w-[min(100vw-1.5rem,24rem)] overflow-hidden rounded-lg border border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-800)] shadow-lg';

  const typeFilters = (
    <div className={`flex flex-wrap gap-1.5 ${variant === 'inline' ? 'border-b border-[var(--color-neutral-100)] p-2' : 'mt-2 px-0.5'}`}>
      {SEARCH_TYPE_FILTERS.map((t) => {
        const on = selectedTypes.includes(t.value);
        return (
          <button
            key={t.value}
            type="button"
            aria-pressed={on}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${
              on
                ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-500)]'
            }`}
            onClick={() => toggleType(t.value)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );

  const resultsBody = (
    <div className="max-h-80 overflow-y-auto">
      {showRecent ? (
        <div className="p-2">
          <div className="mb-1 flex items-center justify-between px-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
              Recent
            </p>
            {recent.length > 0 ? (
              <button
                type="button"
                className="text-[10px] text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)]"
                onClick={() => {
                  clearRecentSearches();
                  setRecent([]);
                }}
              >
                Clear
              </button>
            ) : null}
          </div>
          {recent.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-[var(--color-neutral-400)]">
              Type at least {SEARCH_MIN_CHARS} characters to search.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {recent.map((r) => (
                <li key={r}>
                  <button
                    type="button"
                    className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-[var(--color-neutral-50)]"
                    onClick={() => {
                      setQuery(r);
                      inputRef.current?.focus();
                    }}
                  >
                    {r}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {showHint ? (
        <p className="px-3 py-6 text-center text-xs text-[var(--color-neutral-400)]">
          Enter at least {SEARCH_MIN_CHARS} characters
        </p>
      ) : null}

      {showResults && isError ? (
        <p className="px-3 py-6 text-center text-xs text-[var(--color-danger-600)]">
          {(error as Error)?.message || 'Search failed. Try again.'}
        </p>
      ) : null}

      {showResults && !isError && loading && !data ? (
        <p className="px-3 py-6 text-center text-xs text-[var(--color-neutral-400)]">Searching…</p>
      ) : null}

      {showResults && !isError && !loading && data && data.total === 0 ? (
        <p className="px-3 py-6 text-center text-xs text-[var(--color-neutral-400)]">
          No results for “{debouncedQuery}”
        </p>
      ) : null}

      {showResults && !isError && data && data.total > 0
        ? data.groups.map((group) => (
            <div key={group.type} className="border-t border-[var(--color-neutral-100)]">
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
                {group.label}
              </p>
              <ul>
                {group.items.map((hit) => {
                  const flatIdx = flatHits.findIndex(
                    (h) => h.id === hit.id && h.type === hit.type,
                  );
                  const active = flatIdx === activeIndex;
                  return (
                    <li key={`${hit.type}-${hit.id}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm ${
                          active
                            ? 'bg-[var(--color-primary-50)]'
                            : 'hover:bg-[var(--color-neutral-50)]'
                        }`}
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        onClick={() => selectHit(hit)}
                      >
                        <span className="font-medium text-[var(--color-neutral-800)]">{hit.title}</span>
                        {hit.subtitle ? (
                          <span className="text-xs text-[var(--color-neutral-500)]">{hit.subtitle}</span>
                        ) : null}
                        <span className="text-[10px] uppercase tracking-wide text-[var(--color-neutral-400)]">
                          {group.label}
                          {hit.status ? ` · ${hit.status}` : ''}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        : null}
    </div>
  );

  const resultsPanel = open ? (
    <div id={panelId} role="listbox" aria-label="Search results" className={panelClass}>
      {variant === 'compact' ? (
        <div className="border-b border-[var(--color-neutral-100)] p-2">
          <div className="flex items-center gap-2 rounded-md border border-[var(--color-neutral-200)] bg-white px-2">
            <Search size={16} className="shrink-0 text-[var(--color-neutral-400)]" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Search jobs, quotations, parties…"
              className="h-9 w-full bg-transparent text-sm text-[var(--color-neutral-800)] outline-none placeholder:text-[var(--color-neutral-400)]"
              aria-autocomplete="list"
              aria-controls={panelId}
              autoComplete="off"
            />
            {loading ? (
              <Loader2 size={16} className="shrink-0 animate-spin text-[var(--color-primary-500)]" />
            ) : null}
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                className="shrink-0 rounded p-0.5 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)]"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
          <p className="mt-1.5 px-1 text-[10px] text-[var(--color-neutral-400)]">
            Ctrl/⌘+K · ↑↓ to navigate · Enter to open · Esc to close
          </p>
          {typeFilters}
        </div>
      ) : (
        typeFilters
      )}
      {resultsBody}
    </div>
  ) : null;

  return (
    <div ref={rootRef} className={variant === 'inline' ? 'relative w-full' : 'relative'}>
      {variant === 'inline' ? (
        <div className="flex h-10 items-center gap-2 rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 text-[var(--color-neutral-800)]">
          <Search size={16} className="shrink-0 text-[var(--color-neutral-400)]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => {
              if (!open) openSearch();
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Search jobs, quotes, customers…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-neutral-400)]"
            aria-autocomplete="list"
            aria-controls={open ? panelId : undefined}
            aria-expanded={open}
            autoComplete="off"
          />
          {loading ? (
            <Loader2 size={16} className="shrink-0 animate-spin text-[var(--color-primary-500)]" />
          ) : null}
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              className="shrink-0 rounded p-0.5 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)]"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              <X size={16} />
            </button>
          ) : (
            <kbd className="hidden shrink-0 rounded border border-[var(--color-neutral-200)] bg-white px-1.5 py-0.5 text-[10px] text-[var(--color-neutral-400)] sm:inline">
              ⌘K
            </kbd>
          )}
        </div>
      ) : (
        <button
          type="button"
          aria-label="Search"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          className="flex items-center gap-1.5 hover:opacity-80 shrink-0"
          onClick={() => (open ? close() : openSearch())}
        >
          <Search size={20} />
          <span className="hidden lg:inline text-xs">Search</span>
        </button>
      )}
      {resultsPanel}
    </div>
  );
}
