import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errFile = path.join(root, 'src/features/reports/qa/visual-evidence/tsc-build-errors.txt');
const outFile = path.join(
  root,
  'src/features/reports/qa/visual-evidence/tsc-error-classification.json',
);

const lines = fs
  .readFileSync(errFile, 'utf8')
  .split(/\r?\n/)
  .filter((l) => /error TS/.test(l));

const brandingTouched = new Set(
  execSync('git diff HEAD --name-only -- src/features/reports src/features/shared/bl-draft', {
    encoding: 'utf8',
    cwd: root,
  })
    .split(/\r?\n/)
    .filter(Boolean)
    .map((p) => p.replace(/\\/g, '/')),
);

function norm(p) {
  return p.replace(/\\/g, '/');
}

const rows = lines.map((l) => {
  const m = l.match(/^(.*?)\((\d+),(\d+)\): error (TS\d+): (.*)$/);
  if (!m) return { raw: l };
  const file = norm(m[1]);
  const reportsRelated =
    file.includes('src/features/reports/') || file.includes('src/features/shared/bl-draft/');
  const inBrandingDiff = [...brandingTouched].some(
    (t) => file === norm(t) || file.endsWith(norm(t)) || norm(t).endsWith(file),
  );
  return {
    file,
    line: Number(m[2]),
    col: Number(m[3]),
    code: m[4],
    msg: m[5],
    reportsRelated,
    inBrandingDiff,
  };
});

const blLogo = rows.filter(
  (r) =>
    /Cannot find name ['"]logo['"]/.test(r.msg || '') ||
    (/BlFamily/.test(r.file || '') && /logo/.test(r.msg || '')),
);

const reportRows = rows.filter((r) => r.reportsRelated);
const brandingReport = reportRows.filter((r) => r.inBrandingDiff);

// Baseline: was this file already erroring in HEAD for same line? We can't re-run HEAD easily;
// use git show + whether file is unmodified for non-diff files = pre-existing.
const classified = reportRows.map((r) => ({
  ...r,
  classification: r.inBrandingDiff
    ? 'in_branding_diff_scope'
    : r.reportsRelated
      ? 'reports_module_not_in_branding_diff_likely_preexisting'
      : 'unrelated',
}));

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(
  outFile,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      method:
        'Parse tsc -b output; mark reports/bl-draft paths; intersect with git diff HEAD for branding/HAWB touch set. Files not in branding diff are classified as likely pre-existing (not introduced by this change set). BlFamily logo symbol errors checked explicitly.',
      totalErrors: rows.length,
      reportsRelatedCount: reportRows.length,
      brandingDiffReportsErrors: brandingReport,
      blFamilyLogoErrorsRemaining: blLogo,
      blFamilyLogoFixedConfirmed: blLogo.length === 0,
      reportsRelated: classified,
    },
    null,
    2,
  ),
);

console.log(
  JSON.stringify(
    {
      total: rows.length,
      reports: reportRows.length,
      brandingDiffHits: brandingReport.length,
      blLogoRemaining: blLogo.length,
      out: path.relative(root, outFile),
    },
    null,
    2,
  ),
);
