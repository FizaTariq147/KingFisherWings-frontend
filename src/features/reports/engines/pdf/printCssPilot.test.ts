import { describe, expect, it } from 'vitest';
import {
  ARRIVAL_NOTICE_PDF_PILOT_ACCEPTANCE,
  buildArrivalNoticePrintHtml,
} from './printCssPilot';
import type { ArrivalNoticeViewModel } from '../../mappings/types';

describe('arrival notice print-CSS pilot', () => {
  it('builds selectable-text HTML with A4 page rule and repeating thead', () => {
    const model: ArrivalNoticeViewModel = {
      formatCode: 'ARRIVAL_NOTICE_REPORT_FORMAT_1',
      formatName: 'Arrival Notice Report Format-1',
      companyName: 'KingFisher Wings',
      shipper: { lines: ['Shipper Co'] },
      consignee: { lines: ['Consignee Co'] },
      notify: { lines: ['Notify Co'] },
      vesselFlight: 'VESSEL / 001',
      pol: 'INMAA',
      pod: 'AEJEA',
      tableHeaders: ['Pkg', 'Weight', 'Commodity'],
      tableRows: [['10', '100', 'General']],
      lines: [],
    };
    const html = buildArrivalNoticePrintHtml(model);
    expect(html).toContain('@page { size: A4 portrait');
    expect(html).toContain('thead { display: table-header-group; }');
    expect(html).toContain('ARRIVAL_NOTICE_REPORT_FORMAT_1');
    expect(html).toContain('Shipper Co');
    expect(ARRIVAL_NOTICE_PDF_PILOT_ACCEPTANCE.selectableText).toBe(true);
  });
});
