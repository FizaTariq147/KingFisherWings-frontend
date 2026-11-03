import { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BRAND_LOGO_ACCEPT } from '../constants/brandLogo.constants';
import { brandLogoService, validateBrandLogoFile } from '../services/brandLogo.service';
import { BrandLogo } from './BrandLogo';

type Props = {
  /** Current logo URL (form field). */
  value?: string;
  onChange: (logoUrl: string) => void;
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
 * Never blocks save — URL field remains editable as fallback.
 */
export function LogoFileField({
  value,
  onChange,
  error,
  uploadMode,
  tenantId,
  disabled,
  label = 'Logo',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onPick = async (file: File | null) => {
    setLocalError(null);
    if (!file) return;
    const invalid = validateBrandLogoFile(file);
    if (invalid) {
      setLocalError(invalid);
      return;
    }

    setUploading(true);
    try {
      if (uploadMode === 'organization') {
        const { logo_url } = await brandLogoService.uploadOrganizationLogo(file);
        onChange(logo_url);
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
        const { logo_url } = await brandLogoService.uploadTenantLogo(tenantId, file);
        onChange(logo_url);
        return;
      }
      // url-only fallback preview
      onChange(URL.createObjectURL(file));
      setLocalError('Paste a public logo URL below to persist (file upload API not configured).');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Logo upload failed. You can still paste a logo URL.';
      setLocalError(message);
      // Keep UX unblocked: local preview so user sees the choice.
      try {
        onChange(URL.createObjectURL(file));
      } catch {
        /* ignore */
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
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
            disabled={disabled || uploading}
            onChange={(e) => void onPick(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || uploading}
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
              disabled={disabled || uploading}
              onClick={() => {
                setLocalError(null);
                onChange('');
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>
      <Input
        label="Logo URL (optional)"
        type="url"
        placeholder="https://… or leave empty for default KingFisher logo"
        value={value || ''}
        error={error}
        disabled={disabled || uploading}
        onChange={(e) => {
          setLocalError(null);
          onChange(e.target.value);
        }}
      />
      {localError ? (
        <p className="text-xs text-amber-800" role="status">
          {localError}
        </p>
      ) : (
        <p className="text-[11px] text-[var(--color-neutral-500)]">
          PNG, JPG, WebP or SVG · max 2 MB. Default software logo is used when empty.
        </p>
      )}
    </div>
  );
}
