import assert from 'node:assert/strict';
import test from 'node:test';
import { parsePage } from './build-manifest.mjs';

const html = `
<table><tbody>
<tr class="th_download"><td><h3>S.No</h3></td><td><h3>SEA FREIGHT</h3></td><td><h3>AIR FREIGHT</h3></td><td><h3>ACCOUNTS</h3></td><td><h3>MY REPORTS</h3></td></tr>
<tr><td>1.</td>
<td><a href="https://fresatechnologies.com/wp-content/uploads/report-formats/hbl-draft-report-fomat-jasper.pdf">HBL Draft Report Format Jasper</a></td>
<td><a href="https://fresatechnologies.com/wp-content/uploads/report-formats/air-quotation-report-format.pdf">Air Quotation Report Format</a></td>
<td><a href="https://fresatechnologies.com/wp-content/uploads/report-formats/invoice-report-format-1-tax-invoice-india.pdf">Invoice Report Format-1 Tax Invoice India</a></td>
<td><a href="https://fresatechnologies.com/wp-content/uploads/report-formats/activity-completed-jobs-list-report-format.xlsx">Activity Completed Jobs</a></td>
</tr>
</tbody></table>
<h3>Invoice Formats</h3>
<ol class="report-list report_sorting">
<li><a href="https://fresatechnologies.com/wp-content/uploads/report-formats/invoice-report-format-1-tax-invoice-india.pdf">Invoice Report Format-1 Tax Invoice India</a></li>
</ol>
<h3>HBL</h3>
<ol class="report-list">
<li><a href="https://fresatechnologies.com/wp-content/fresa-std-files/fresagold/sample_reports/fg_hbl_hkg_rpm_ref_245.pdf">HBL Draft- Jasper</a></li>
</ol>
<a href="https://fresatechnologies.com/wp-content/uploads/2026/07/Fresa_Gold_Profile_20260727.pdf">Fresa Gold ERP Brochure</a>
`;

test('section headings follow the table column and the later list', () => {
  const links = parsePage(html);
  const byName = Object.fromEntries(links.map((link) => [link.linkText, link.section]));
  assert.equal(byName['HBL Draft Report Format Jasper'], 'SEA FREIGHT');
  assert.equal(byName['Air Quotation Report Format'], 'AIR FREIGHT');
  assert.equal(byName['Invoice Report Format-1 Tax Invoice India'], 'Invoice Formats');
  assert.equal(byName['Activity Completed Jobs'], 'MY REPORTS');
  assert.equal(byName['HBL Draft- Jasper'], 'HBL');
  assert.equal(links.find((link) => link.linkText.includes('Brochure')).section, '');
  assert.equal(links.length, 6);
});
