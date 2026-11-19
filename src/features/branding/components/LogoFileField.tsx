import { useRef, useState } from 'react';
import { ImagePlus, Link2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BRAND_LOGO_ACCEPT } from '../constants/brandLogo.constants';
import { brandLogoService, validateBrandLogoFile } from '../services/brandLogo.service';
import { BrandLogo } from './BrandLogo';

type Props = {
  /** Current logo URL (form field). */
  value?: string;
  onChange: (logoUrl: string) => void;
  /**
   * Called after a successful upload / Apply URL. `persisted` means logo_url is
   * already on the organization/tenant record (safe across devices).
   */
  onUploaded?: (result: { logo_url: string; persisted: boolean }) => void;
  error?: string;
  /**
   * `organization` → POST /organization/logo (needs auth).
   * `tenant` → POST /tenants/:id/logo (needs tenantId).
   * `url-only` → file pick creates a local preview data URL until BE upload exists;
   *              still lets ops paste a CDN URL.
   */
  uploadMode: 'organization' | 'tenant' | 'url-only';
  tenantId?: string;
  disabled?: boolean;
  label?: string;
};

/**
 * Logo chooser: pick image file (upload when BE supports it) + optional URL.
 * Organization mode: Apply URL ingests the image so PDFs work on every device.
 */
export function LogoFileField({
  value,
  onChange,
  onUploaded,
  error,
  uploadMode,
  tenantId,
  disabled,
  label = 'Logo',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [applyingUrl, setApplyingUrl] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localOk, setLocalOk] = useState<string | null>(null);
  const busy = uploading || applyingUrl;

  const finishOrgResult = (result: { logo_url: string; persisted: boolean }) => {
    onChange(result.logo_url);
    onUploaded?.(result);
    if (result.persisted) {
      setLocalOk(
        'Logo URL saved — sidebar and invoice/quotation/credit/debit PDFs will use it on all devices.',
      );
    } else {
      setLocalError(
        'Logo ready in the form. Click Save profile so it appears on other devices and sessions.',
      );
    }
  };

  const onPick = async (file: File | null) => {
    setLocalError(null);
    setLocalOk(null);
    if (!file) return;
    const invalid = validateBrandLogoFile(file);
    if (invalid) {
      setLocalError(invalid);
      return;
    }

    setUploading(true);
    try {
      if (uploadMode === 'organization') {
        const result = await brandLogoService.uploadOrganizationLogo(file);
        finishOrgResult(result);
        return;
      }
      if (uploadMode === 'tenant') {
        if (!tenantId?.trim()) {
          // Create flow: preview locally; URL is saved after tenant exists / via URL field.
          const preview = URL.createObjectURL(file);
          onChange(preview);
          setLocalError(
            'Preview only until the tenant is saved. After create, open Edit and upload again — or paste a hosted logo URL.',
          );
          return;
        }
        const result = await brandLogoService.uploadTenantLogo(tenantId, file);
        onChange(result.logo_url);
        onUploaded?.(result);
        setLocalOk('Logo saved — it will show for this tenant on all devices.');
        return;
      }
      // url-only fallback preview
      onChange(URL.createObjectURL(file));
      setLocalError('Paste a public logo URL below and click Apply URL to persist.');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Logo upload failed. You can still paste a logo URL.';
      setLocalError(message);
      // Do not write blob: URLs into logo_url — they 401 on save and are not persistable.
      // url-only mode still allows a local preview until a hosted URL is pasted.
      if (uploadMode === 'url-only') {
        try {
          onChange(URL.createObjectURL(file));
        } catch {
          /* ignore */
        }
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onApplyUrl = async () => {
    setLocalError(null);
    setLocalOk(null);
    const raw = String(value ?? '').trim();
    if (!raw) {
      setLocalError('Paste a logo URL first.');
      return;
    }
    if (uploadMode !== 'organization') {
      onChange(raw);
      setLocalOk('Logo URL set. Save the form to keep it.');
      return;
    }

    setApplyingUrl(true);
    try {
      const result = await brandLogoService.applyOrganizationLogoUrl(raw);
      finishOrgResult(result);
    } catch (err) {
      setLocalError(
        err instanceof Error
          ? err.message
          : 'Could not apply that logo URL. Try Choose logo or another URL.',
      );
    } finally {
      setApplyingUrl(false);
    }
  };

  return (
    <div className="space-y-2 sm:col-span-2">
      <p className="text-xs font-medium text-[var(--color-neutral-600)]">{label}</p>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-[var(--color-neutral-200)] bg-white p-1">
          <BrandLogo logoUrl={value} className="h-full w-full object-contain" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={BRAND_LOGO_ACCEPT}
            className="sr-only"
            disabled={disabled || busy}
            onChange={(e) => void onPick(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <ImagePlus className="mr-1.5 h-3.5 w-3.5" />
                Choose logo
              </>
            )}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled || busy}
              onClick={() => {
                setLocalError(null);
                setLocalOk(null);
                onChange('');
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Input
            label="Logo URL (optional)"
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder="R2 /files link, https://…, or /files/…"
            value={value || ''}
            error={error}
            disabled={disabled || busy}
            onChange={(e) => {
              setLocalError(null);
              setLocalOk(null);
              onChange(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void onApplyUrl();
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 sm:mb-0.5"
          disabled={disabled || busy || !String(value ?? '').trim()}
          onClick={() => void onApplyUrl()}
        >
          {applyingUrl ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Applying…
            </>
          ) : (
            <>
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              Apply URL
            </>
          )}
        </Button>
      </div>
      {localError ? (
        <p className="text-xs text-amber-800" role="status">
          {localError}
        </p>
      ) : localOk ? (
        <p className="text-xs text-emerald-800" role="status">
          {localOk}
        </p>
      ) : (
        <p className="text-[11px] text-[var(--color-neutral-500)]">
          Paste your logo https:// URL and click Apply URL (or Choose logo). It is saved on
          the organization profile so every device and session loads the same logo in the
          sidebar and on invoice, quotation, credit, and debit PDFs.
        </p>
      )}
    </div>
  );
}
