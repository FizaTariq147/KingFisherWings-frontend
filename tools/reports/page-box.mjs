/**
 * Page dictionary boxes. Coordinates drawn by the renderer stay in MediaBox
 * space. The geometry check converts both sides into displayed space, which
 * is what Poppler rasters after /Rotate.
 */
import fs from 'node:fs';
import { PDFDocument, PDFName, PDFNumber } from 'pdf-lib';

function fine(value) {
  return Math.round(Number(value) * 10000) / 10000;
}

function numbersOf(array) {
  if (!array || typeof array.size !== 'function') return null;
  const numbers = [];
  for (let index = 0; index < array.size(); index += 1) {
    const item = array.lookup(index);
    const value = typeof item?.asNumber === 'function' ? item.asNumber() : Number(item);
    if (!Number.isFinite(value)) return null;
    numbers.push(fine(value));
  }
  return numbers.length === 4 ? numbers : null;
}

export async function readPageBoxes(filePath) {
  const doc = await PDFDocument.load(fs.readFileSync(filePath), { updateMetadata: false });
  return doc.getPages().map((page) => {
    const media = page.getMediaBox();
    const cropRaw = page.node.CropBox();
    const crop = cropRaw ? numbersOf(page.node.context.lookup(cropRaw)) : null;
    const rotate = ((page.getRotation().angle % 360) + 360) % 360;
    const unitRaw = page.node.getInheritableAttribute(PDFName.of('UserUnit'));
    const userUnit = unitRaw instanceof PDFNumber ? fine(unitRaw.asNumber()) : 1;
    return {
      rotate,
      mediaBox: [fine(media.x), fine(media.y), fine(media.x + media.width), fine(media.y + media.height)],
      cropBox: crop,
      userUnit,
    };
  });
}

export function displayPoint(x, y, box) {
  const [x0, y0, x1, y1] = box.mediaBox;
  const px = x - x0;
  const py = y - y0;
  const width = x1 - x0;
  const height = y1 - y0;
  const rotate = ((box.rotate || 0) % 360 + 360) % 360;
  if (rotate === 90) return { x: py, y: width - px };
  if (rotate === 180) return { x: width - px, y: height - py };
  if (rotate === 270) return { x: height - py, y: px };
  return { x: px, y: py };
}

function displayRect(rect, box) {
  const corners = [
    displayPoint(rect.x, rect.y, box),
    displayPoint(rect.x + rect.width, rect.y, box),
    displayPoint(rect.x, rect.y + rect.height, box),
    displayPoint(rect.x + rect.width, rect.y + rect.height, box),
  ];
  const xs = corners.map((point) => point.x);
  const ys = corners.map((point) => point.y);
  return {
    ...rect,
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

function displayCommandPoint(point, box) {
  if (Array.isArray(point) && Array.isArray(point[0])) return point.map((item) => displayCommandPoint(item, box));
  if (!Array.isArray(point)) return point;
  const displayed = displayPoint(point[0], point[1], box);
  return [displayed.x, displayed.y];
}

export function displayGeometry(page, box) {
  if (!page) return page;
  const frame = box || page.pageBox;
  if (!frame?.mediaBox) return page;
  return {
    ...page,
    lines: (page.lines || []).map((line) => {
      const start = displayPoint(line.x1, line.y1, frame);
      const end = displayPoint(line.x2, line.y2, frame);
      return { ...line, x1: start.x, y1: start.y, x2: end.x, y2: end.y };
    }),
    rects: (page.rects || []).map((rect) => displayRect(rect, frame)),
    paths: (page.paths || []).map((path) => ({
      ...path,
      commands: (path.commands || []).map((command) => ({
        ...command,
        p: displayCommandPoint(command.p, frame),
      })),
    })),
  };
}

function sameBox(left, right) {
  if (!left && !right) return true;
  if (!left || !right || left.length !== right.length) return false;
  return left.every((value, index) => Math.abs(value - right[index]) <= 0.001);
}

export function pageBoxMismatch(reference, rendered) {
  const fields = [];
  if ((reference?.rotate || 0) !== (rendered?.rotate || 0)) fields.push('Rotate');
  if (!sameBox(reference?.mediaBox, rendered?.mediaBox)) fields.push('MediaBox');
  if (!sameBox(reference?.cropBox, rendered?.cropBox)) fields.push('CropBox');
  if (Math.abs((reference?.userUnit || 1) - (rendered?.userUnit || 1)) > 0.001) fields.push('UserUnit');
  return fields;
}
