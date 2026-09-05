/** True when the blob content starts with the PDF magic header `%PDF`. */
export async function blobLooksLikePdf(blob: Blob): Promise<boolean> {
  if (!(blob instanceof Blob) || blob.size < 4) return false;
  if (blob.type === 'application/pdf') {
    // Still verify magic — some APIs mis-label HTML/JSON as application/pdf.
  }
  try {
    const header = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
    return (
      header.length >= 4 &&
      header[0] === 0x25 && // %
      header[1] === 0x50 && // P
      header[2] === 0x44 && // D
      header[3] === 0x46 // F
    );
  } catch {
    return false;
  }
}
