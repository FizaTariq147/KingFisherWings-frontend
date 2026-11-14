import { describe, expect, it } from 'vitest';
import { getHawbFormatUiLayout } from '../data/hawbFormatUiLayouts';
import { listHawbFormats } from '../constants/hawbFormatCatalog';
import { isHblJasperPilotCode } from '../templates/hbl/jasperPilot';
import { getHblFormatUiLayout } from '../data/hblFormatUiLayouts';

describe('distinct report layouts', () => {
  it('official HAWB codes resolve to distinct hawbAwbShell variants', () => {
    const variants = listHawbFormats().map((row) => {
      const layout = getHawbFormatUiLayout(row.code);
      const shell = layout?.blocks.find((b) => b.type === 'hawbAwbShell');
      expect(shell, row.code).toBeTruthy();
      expect(shell && 'variant' in shell ? shell.variant : null).toBeTruthy();
      return shell && 'variant' in shell ? shell.variant : null;
    });
    expect(new Set(variants).size).toBe(5);
  });

  it('HBL Jasper pilot keeps its own layout code (not FG_HBL_HKG alias)', () => {
    expect(isHblJasperPilotCode('HBL_DRAFT_REPORT_FORMAT_JASPER')).toBe(true);
    const layout = getHblFormatUiLayout('HBL_DRAFT_REPORT_FORMAT_JASPER');
    expect(layout?.code).toBe('HBL_DRAFT_REPORT_FORMAT_JASPER');
  });
});
