import { describe, expect, it } from 'vitest';
import { resolveReportLogoUrl } from '../constants/reportBranding.constants';
import { applySharedLayoutChrome, SHARED_LAYOUT_CHROME } from './applySharedLayoutChrome';
import { chromeFromOrganizationProfile } from './resolveReportOrgChrome';
import { brandLogoSrc } from '../components/ReportCatalog/invoiceLayouts/brandLogoSrc';
import { mapToHblJasperPilotModel } from '../templates/hbl/jasperPilot/mapToHblJasperPilotModel';
import { isHblJasperPilotCode } from '../templates/hbl/jasperPilot/hblJasperPilot.config';
import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

const baseLayout = {
  code: 'TEST_FORMAT',
  formatNumber: 1,
  name: 'Test',
  paper: 'A4' as const,
  theme: {
    primary: '#000',
    accent: '#000',
    fill: '#fff',
    panel: '#fff',
    orange: '#f00',
    red: '#f00',
    cyan: '#0ff',
    ink: '#000',
    gray: '#666',
    white: '#fff',
  },
  branding: {
    company: 'Demo JSON Co',
    address: 'Demo St',
    web: 'demo.example',
    logo: 'kingfisher' as const,
  },
  demo: {},
  blocks: [],
} satisfies InvoiceFormatUiLayout;

describe('report company branding', () => {
  it('uses registered org logo and name when profile is present', () => {
    const chrome = chromeFromOrganizationProfile({
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Acme Freight LLC',
      display_name: 'Acme Freight',
      logo_url: 'https://cdn.example.com/acme-logo.png',
      primary_color: '',
      website: 'https://acme.example',
      address: '1 Harbour Rd',
      city: 'Dubai',
      country_code: 'AE',
      phone: '+971500000000',
      email: 'ops@acme.example',
      language: 'en',
      base_currency: 'AED',
      timezone: 'Asia/Dubai',
      financial_year_start: 1,
      vat_number: 'VAT-1',
      cr_number: '',
      iata_cargo_agent_code: '',
      customs_code: '',
      customs_license_no: '',
    });
    expect(chrome.company).toBe('Acme Freight');
    expect(chrome.logoUrl).toBe('https://cdn.example.com/acme-logo.png');
    expect(chrome.address).toContain('1 Harbour Rd');
    expect(chrome.profileLoaded).toBe(true);

    const layout = applySharedLayoutChrome(baseLayout, chrome);
    expect(layout.branding.company).toBe('Acme Freight');
    expect(layout.branding.logoUrl).toBe('https://cdn.example.com/acme-logo.png');
    expect(brandLogoSrc(layout.branding)).toBe('https://cdn.example.com/acme-logo.png');
  });

  it('changing active company chrome changes report branding', () => {
    const a = chromeFromOrganizationProfile({
      id: 'a',
      name: 'Alpha Co',
      display_name: 'Alpha',
      logo_url: 'https://cdn.example.com/alpha.png',
      primary_color: '',
      website: '',
      address: '',
      city: '',
      country_code: '',
      phone: '',
      email: '',
      language: 'en',
      base_currency: 'USD',
      timezone: 'UTC',
      financial_year_start: null,
      vat_number: '',
      cr_number: '',
      iata_cargo_agent_code: '',
      customs_code: '',
      customs_license_no: '',
    });
    const b = chromeFromOrganizationProfile({
      id: 'b',
      name: 'Beta Co',
      display_name: 'Beta',
      logo_url: 'https://cdn.example.com/beta.png',
      primary_color: '',
      website: '',
      address: '',
      city: '',
      country_code: '',
      phone: '',
      email: '',
      language: 'en',
      base_currency: 'USD',
      timezone: 'UTC',
      financial_year_start: null,
      vat_number: '',
      cr_number: '',
      iata_cargo_agent_code: '',
      customs_code: '',
      customs_license_no: '',
    });
    expect(applySharedLayoutChrome(baseLayout, a).branding.company).toBe('Alpha');
    expect(applySharedLayoutChrome(baseLayout, b).branding.company).toBe('Beta');
    expect(applySharedLayoutChrome(baseLayout, a).branding.logoUrl).not.toBe(
      applySharedLayoutChrome(baseLayout, b).branding.logoUrl,
    );
  });

  it('handles missing logo safely without inventing a registered logo', () => {
    expect(resolveReportLogoUrl(null)).toBeUndefined();
    expect(resolveReportLogoUrl('')).toBeUndefined();
    const chrome = chromeFromOrganizationProfile({
      id: 'c',
      name: 'No Logo Co',
      display_name: 'No Logo Co',
      logo_url: '',
      primary_color: '',
      website: '',
      address: '',
      city: '',
      country_code: '',
      phone: '',
      email: '',
      language: 'en',
      base_currency: 'USD',
      timezone: 'UTC',
      financial_year_start: null,
      vat_number: '',
      cr_number: '',
      iata_cargo_agent_code: '',
      customs_code: '',
      customs_license_no: '',
    });
    expect(chrome.logoUrl).toBe('');
    expect(brandLogoSrc(applySharedLayoutChrome(baseLayout, chrome).branding)).toBe('');
  });

  it('handles missing company profile without fabricating contact details', () => {
    const chrome = chromeFromOrganizationProfile(null);
    expect(chrome.profileLoaded).toBe(false);
    expect(chrome.company).toBe('');
    expect(chrome.address).toBe('');
    expect(chrome.phone).toBe('');
    expect(chrome.email).toBe('');
    expect(chrome.logoUrl).toBe('');
    expect(SHARED_LAYOUT_CHROME.company).toBe('');
  });

  it('keeps HBL Jasper pilot functional with registered branding', () => {
    expect(isHblJasperPilotCode('HBL_DRAFT_REPORT_FORMAT_JASPER')).toBe(true);
    const model = mapToHblJasperPilotModel({
      companyName: 'Acme Freight',
      logoUrl: 'https://cdn.example.com/acme-logo.png',
      shipperLines: ['Shipper'],
      entityBound: true,
    });
    expect(model.companyName).toBe('Acme Freight');
    expect(model.logoUrl).toBe('https://cdn.example.com/acme-logo.png');
    expect(model.blNumber).toBe('');
  });
});
