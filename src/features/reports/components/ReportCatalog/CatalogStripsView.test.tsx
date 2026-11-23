import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { ReportTemplate } from '../../types/reportCatalog.types';
import { CatalogStripsView } from './CatalogStripsView';

vi.mock('./CatalogOurThumbnail', () => ({
  CatalogOurThumbnail: () => <div data-testid="thumb-stub" />,
}));

/** jsdom has no layout — stub virtualizer so all rows mount. */
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: (opts: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: opts.count }, (_, index) => ({
        index,
        key: String(index),
        start: index * 120,
        size: 120,
        end: (index + 1) * 120,
      })),
    getTotalSize: () => opts.count * 120,
    measureElement: () => undefined,
  }),
}));

function tpl(
  partial: Partial<ReportTemplate> & Pick<ReportTemplate, 'code' | 'name' | 'family'>,
): ReportTemplate {
  return {
    id: partial.code,
    contexts: ['invoice'],
    formats: ['PDF'],
    gapStatus: 'covered_document_pdf',
    rolloutPhase: 1,
    defaultParams: [],
    ...partial,
  };
}

const fixtures: ReportTemplate[] = [
  tpl({
    code: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
    name: 'Tax Invoice Format 1',
    family: 'commercial',
  }),
  tpl({
    code: 'BROWSE_ONLY_SEA_DOC',
    name: 'Sea Draft Browse',
    family: 'sea_docs',
  }),
  tpl({
    code: 'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE',
    name: 'Standard Tax Invoice',
    family: 'commercial',
  }),
];

describe('CatalogStripsView', () => {
  it('renders Recommended section and collapsed other family groups with counts', () => {
    render(
      <CatalogStripsView
        items={fixtures}
        recordLabel="Invoice (live data)"
        onPreview={vi.fn()}
        onGenerate={vi.fn()}
        searchQuery=""
        familyFilter="all"
      />,
    );

    expect(screen.getByTestId('catalog-section-recommended')).toBeInTheDocument();
    expect(screen.getByText(/Formats for/)).toBeInTheDocument();
    expect(screen.getByText('Invoice (live data)')).toBeInTheDocument();

    const more = screen.getByTestId('catalog-section-more-formats');
    expect(more.textContent).toMatch(/\(1\)/);
    expect(more).toHaveAttribute('aria-expanded', 'false');
  });

  it('filters rows by search', () => {
    render(
      <CatalogStripsView
        items={fixtures}
        onPreview={vi.fn()}
        onGenerate={vi.fn()}
        searchQuery="Sea Draft"
        familyFilter="all"
      />,
    );

    const more = screen.getByTestId('catalog-section-more-formats');
    fireEvent.click(more);

    expect(screen.getAllByText('Sea Draft Browse').length).toBeGreaterThan(0);
    expect(screen.queryByText('Tax Invoice Format 1')).toBeNull();
    expect(screen.queryByText('Standard Tax Invoice')).toBeNull();
  });

  it('shows unsuitable reason on one line when Not suitable is expanded', () => {
    const invoice = {
      currency_code: 'AED',
      subtotal: 152567,
      tax_total: null,
      tax_amount: 7628.35,
      total_amount: 160195.35,
      lines: [
        { quantity: 1, unit_price: 152000, tax_amount: 7600, line_total: 159600 },
        { quantity: 1, unit_price: 567, tax_amount: 28.35, line_total: 595.35 },
      ],
    };

    render(
      <CatalogStripsView
        items={fixtures}
        invoiceCurrency={invoice}
        onPreview={vi.fn()}
        onGenerate={vi.fn()}
        searchQuery=""
        familyFilter="all"
      />,
    );

    const notSuitable = screen.getByTestId('catalog-section-not-suitable');
    fireEvent.click(notSuitable);
    const reasons = screen.getAllByTestId('catalog-unsuitable-reason');
    expect(reasons.length).toBeGreaterThan(0);
    for (const reason of reasons) {
      expect(reason.textContent).toMatch(/^not suitable for this invoice:/);
      expect(reason.textContent!.includes('\n')).toBe(false);
    }
  });

  it('shows empty state when nothing matches', () => {
    render(
      <CatalogStripsView
        items={fixtures}
        onPreview={vi.fn()}
        onGenerate={vi.fn()}
        searchQuery="zzzz-no-match"
        familyFilter="all"
      />,
    );
    expect(screen.getByTestId('catalog-strips-empty')).toBeInTheDocument();
    expect(screen.getByTestId('catalog-strips-empty').textContent).toMatch(/No formats match/i);
  });
});
