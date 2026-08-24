import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import { safePdfText } from '@/features/files/utils/sanitizePdfText';
import { labelEnum } from '../constants/hr.constants';
import type { EmployeeRow } from '../types/employee.types';import type { LetterRecord } from '../types/hr.types';

function wrapLines(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function buildLetterBody(letterType: string, employeeName: string, employee?: EmployeeRow | null): string {
  const designation = safePdfText(employee?.designation?.trim() || 'the assigned role', 'the assigned role');
  const department = safePdfText(employee?.department?.trim() || 'the company', 'the company');
  const code = safePdfText(employee?.code?.trim() || '');
  const employeeLine = code ? `${employeeName} (${code})` : employeeName;
  switch (letterType) {
    case 'APPOINTMENT':
      return `This is to confirm the appointment of ${employeeLine} as ${designation} in ${department}, effective from the date mentioned in the employee record. This appointment is subject to company policies and the terms of employment.`;
    case 'CONFIRMATION':
      return `We are pleased to confirm the employment of ${employeeLine} as ${designation} in ${department} following successful completion of the probation period.`;
    case 'SALARY_REVISION':
      return `This letter confirms a salary revision for ${employeeLine}, ${designation}, in ${department}. Updated compensation details are maintained in the payroll records.`;
    case 'WARNING':
      return `This letter serves as an official warning to ${employeeLine}, ${designation}. The employee is required to comply with company policies and corrective actions discussed with HR.`;
    case 'EXPERIENCE':
      return `To whom it may concern,\n\nThis is to certify that ${employeeLine} was employed with our organization as ${designation} in ${department}. This certificate is issued upon request for experience verification purposes.`;
    case 'EMPLOYMENT_CERT':
      return `To whom it may concern,\n\nThis is to certify that ${employeeLine} is currently employed with our organization as ${designation} in ${department}.`;
    case 'NOC':
      return `This No Objection Certificate is issued for ${employeeLine}, ${designation}, for the purpose stated in the employee request and internal approval records.`;
    case 'RESIGNATION_ACCEPTANCE':
      return `We acknowledge receipt and acceptance of the resignation submitted by ${employeeLine}, ${designation}. HR will coordinate the clearance and final settlement process.`;
    case 'END_OF_SERVICE':
      return `This letter confirms the end of service for ${employeeLine}, ${designation}, in ${department}. Final settlement and clearance will be processed as per company policy and applicable labor law.`;
    case 'REFERENCE':
      return `To whom it may concern,\n\nWe confirm that ${employeeLine} was associated with our organization as ${designation}. For further verification, please contact the HR department.`;
    default:
      return `This HR letter is issued for ${employeeLine} regarding ${labelEnum(letterType)}.`;
  }
}

/** Client-side PDF when the API saves the letter row but does not return pdf_url yet. */
export async function generateHrLetterPdfFallback(
  letter: LetterRecord,
  employee?: EmployeeRow | null,
): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const text = rgb(0.12, 0.14, 0.18);

  const employeeName = safePdfText(
    employee?.name?.trim() ||
      `${employee?.firstName ?? ''} ${employee?.lastName ?? ''}`.trim() ||
      (letter.employee !== '—' ? letter.employee : 'Employee'),
    'Employee',
  );
  const letterTitle = safePdfText(labelEnum(letter.letter_type), 'HR Letter');
  const marginX = 54;  const maxWidth = 487;
  let y = 720;

  page.drawText(letterTitle, { x: marginX, y, size: 15, font: titleFont, color: text });
  y -= 28;

  page.drawText(`Dear ${employeeName},`, { x: marginX, y, size: 11, font: bodyFont, color: text });
  y -= 22;

  const paragraphs = buildLetterBody(letter.letter_type, employeeName, employee).split('\n\n');
  for (const paragraph of paragraphs) {
    for (const line of wrapLines(paragraph, bodyFont, 11, maxWidth)) {
      if (y < 120) break;
      page.drawText(line, { x: marginX, y, size: 11, font: bodyFont, color: text });
      y -= 16;
    }
    y -= 8;
  }

  y = Math.min(y, 140);
  page.drawText('Yours sincerely,', { x: marginX, y, size: 11, font: bodyFont, color: text });
  y -= 36;
  page.drawText('Authorized Signatory', { x: marginX, y, size: 11, font: titleFont, color: text });

  const bytes = await pdf.save();
  return new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' });
}
