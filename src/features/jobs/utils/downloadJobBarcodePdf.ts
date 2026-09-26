import { openPdfBlobInNewTab } from '@/features/files/utils/pdfBranding';
import type { Job } from '../types/job.types';
import { renderCode128PngBytes } from '../components/Code128Barcode';
import { generateJobBarcodePdf } from '../utils/generateJobBarcodePdf';
import {
  jobToBarcodePdfModel,
  type JobBarcodePdfLabelBundle,
} from '../utils/jobToBarcodePdfModel';
import { jobBarcodeLabelTitle, resolveJobBarcodeValue } from '../utils/resolveJobBarcode';

function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Always render a print-grade CODE128 (black, thick modules, quiet zone) for the sticker PDF. */
async function barcodePngForJob(job: Job): Promise<Uint8Array | undefined> {
  try {
    return await renderCode128PngBytes(resolveJobBarcodeValue(job), {
      displayValue: false,
    });
  } catch {
    return undefined;
  }
}

/** Build + download the KingFisher-formatted job barcode PDF. */
export async function downloadJobBarcodePdf(opts: {
  job: Job;
  labels?: JobBarcodePdfLabelBundle;
  svg?: SVGSVGElement | null;
  openPreview?: boolean;
}): Promise<void> {
  const { job, labels, openPreview } = opts;
  const png = await barcodePngForJob(job);
  const model = jobToBarcodePdfModel(job, labels, png);
  const blob = await generateJobBarcodePdf(model);
  const fileName = `sticker-${jobBarcodeLabelTitle(job).replace(/[^\w.-]+/g, '_')}.pdf`;
  if (openPreview) {
    openPdfBlobInNewTab(blob, null, fileName);
  }
  triggerDownload(blob, fileName);
}
