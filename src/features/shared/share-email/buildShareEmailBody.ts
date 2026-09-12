import { isLikelyEmail, parseEmailList } from './parseEmails';
import type { ShareEmailDto, ShareEmailFormValues } from './types';

/** Build API body from form values; omits empty fields so backend defaults apply. */
export function buildShareEmailBody(values: ShareEmailFormValues): ShareEmailDto {
  const to = parseEmailList(values.to_text);
  const cc = parseEmailList(values.cc_text);
  const invalid = [...to, ...cc].find((email) => !isLikelyEmail(email));
  if (invalid) {
    throw new Error(`Invalid email address: ${invalid}`);
  }

  const body: ShareEmailDto = {};
  if (to.length) body.to = to;
  if (cc.length) body.cc = cc;
  const message = values.message?.trim();
  // OpenAPI DocumentShareEmailDto.message maxLength = 2000
  if (message) body.message = message.slice(0, 2000);
  body.include_pdf = values.include_pdf !== false;
  return body;
}
