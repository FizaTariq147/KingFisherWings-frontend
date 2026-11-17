/**
 * Walk a pdfjs operator list once.
 * Text spans are one show-text operator each, with the fill color from the
 * graphics state. Elements fully outside the page box are dropped.
 */
import { OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';

function round1(value) {
  return Math.round(Number(value) * 10) / 10;
}

function hex(color) {
  const raw = [...(color || [0, 0, 0])];
  while (raw.length < 3) raw.push(raw[0] || 0);
  const channels = raw.slice(0, 3).map((channel) =>
    Math.max(0, Math.min(255, Math.round(Number(channel) > 1 ? Number(channel) : Number(channel) * 255))),
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function asList(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && typeof value.length === 'number') {
    return Array.from({ length: value.length }, (_, index) => value[index]);
  }
  return value == null ? [] : [value];
}

function colorOf(args) {
  const raw = asList(args).filter((value) => value != null && typeof value !== 'object');
  if (!raw.length && args && typeof args === 'object') {
    return [0, 1, 2].map((index) => Number(args[index]) || 0);
  }
  return raw.slice(0, 4).map((value) => Number(value) || 0);
}

function cmykToRgb(channels) {
  const [c, m, y, k] = [0, 1, 2, 3].map((index) => {
    const value = Number(channels[index]) || 0;
    return value > 1 ? value / 255 : value;
  });
  return [
    (1 - c) * (1 - k),
    (1 - m) * (1 - k),
    (1 - y) * (1 - k),
  ];
}

function identity() {
  return [1, 0, 0, 1, 0, 0];
}

function multiply(left, right) {
  const [a0, b0, c0, d0, e0, f0] = left;
  const [a, b, c, d, e, f] = right;
  return [
    a0 * a + c0 * b,
    b0 * a + d0 * b,
    a0 * c + c0 * d,
    b0 * c + d0 * d,
    a0 * e + c0 * f + e0,
    b0 * e + d0 * f + f0,
  ];
}

function mapPoint(ctm, x, y) {
  return [ctm[0] * x + ctm[2] * y + ctm[4], ctm[1] * x + ctm[3] * y + ctm[5]];
}

function matrixOf(args) {
  const list = asList(args);
  const raw = list.length >= 6 ? list : list[0] && asList(list[0]).length >= 6 ? asList(list[0]) : null;
  if (!raw) return null;
  return [0, 1, 2, 3, 4, 5].map((index) => Number(raw[index]) || 0);
}

function freshState() {
  return {
    ctm: identity(),
    fill: [0, 0, 0],
    stroke: [0, 0, 0],
    lineWidth: 0.6,
    dash: [],
    dashPhase: 0,
    fontId: '',
    fontSize: 8,
    textMatrix: identity(),
    lineMatrix: identity(),
    hScale: 100,
    charSpacing: 0,
    wordSpacing: 0,
    leading: 0,
    fillSource: 'rgb',
  };
}

function cloneState(state) {
  return {
    ...state,
    ctm: state.ctm.slice(),
    fill: state.fill.slice(),
    stroke: state.stroke.slice(),
    dash: state.dash.slice(),
    textMatrix: state.textMatrix.slice(),
    lineMatrix: state.lineMatrix.slice(),
  };
}

function intersects(box, page) {
  return box.maxX > 0 && box.minX < page.width && box.maxY > 0 && box.minY < page.height;
}

function numberArg(args) {
  if (typeof args === 'number') return args;
  const list = asList(args);
  return Number(list[0]) || 0;
}

function glyphsOf(arg) {
  const glyphs = [];
  for (const item of asList(arg)) {
    if (typeof item === 'number') {
      glyphs.push(item);
      continue;
    }
    if (item && item.unicode != null) {
      glyphs.push(item);
      continue;
    }
    if (item && typeof item.length === 'number') {
      for (const glyph of asList(item)) {
        if (typeof glyph === 'number' || (glyph && glyph.unicode != null)) glyphs.push(glyph);
      }
    }
  }
  return glyphs;
}

function fontNameOf(page, fontId) {
  try {
    if (page?.commonObjs?.has?.(fontId)) {
      const font = page.commonObjs.get(fontId);
      return font?.name || font?.loadedName || String(fontId || 'unknown');
    }
  } catch {
    return String(fontId || 'unknown');
  }
  return String(fontId || 'unknown');
}

const FILL_OPS = new Set([
  OPS.fill,
  OPS.eoFill,
  OPS.fillStroke,
  OPS.eoFillStroke,
  OPS.closeFillStroke,
  OPS.closeEOFillStroke,
]);

function paintKind(fns, index) {
  for (let k = index + 1; k < Math.min(fns.length, index + 6); k += 1) {
    const next = fns[k];
    if (next === OPS.clip || next === OPS.eoClip) return 'clip';
    if (FILL_OPS.has(next)) return next === OPS.fill || next === OPS.eoFill ? 'fill' : 'both';
    if (next === OPS.stroke || next === OPS.closeStroke) return 'stroke';
    if (next === OPS.endPath || next === OPS.constructPath || next === OPS.rectangle) return 'none';
  }
  return 'none';
}

function pushBox(rects, lines, minX, minY, maxX, maxY, style) {
  const width = maxX - minX;
  const height = maxY - minY;
  if (width > 2 && height > 2) {
    rects.push({
      x: round1(minX),
      y: round1(minY),
      width: round1(width),
      height: round1(height),
      strokeWidth: style.strokeWidth,
      stroke: style.paint === 'fill' ? null : style.stroke,
      fill: style.paint === 'stroke' ? null : style.fill,
      dash: style.dash,
      dashPhase: style.dashPhase,
    });
  } else if (width > 4 && height >= 0.15 && height <= 2.5) {
    lines.push({
      x1: round1(minX),
      y1: round1(minY + height / 2),
      x2: round1(maxX),
      y2: round1(minY + height / 2),
      width: round1(height),
      color: style.stroke || style.fill || '#000000',
      dash: style.dash,
      dashPhase: style.dashPhase,
    });
  } else if (height > 4 && width >= 0.15 && width <= 2.5) {
    lines.push({
      x1: round1(minX + width / 2),
      y1: round1(minY),
      x2: round1(minX + width / 2),
      y2: round1(maxY),
      width: round1(width),
      color: style.stroke || style.fill || '#000000',
      dash: style.dash,
      dashPhase: style.dashPhase,
    });
  }
}

function shapesFromPath(pathOps, nums, state, style, uncaptured) {
  const rects = [];
  const lines = [];
  let j = 0;
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let points = [];
  function commit(closed) {
    if (points.length < 2) {
      points = [];
      return;
    }
    const mapped = points.map((point) => mapPoint(state.ctm, point[0], point[1]));
    if (closed) mapped.push(mapped[0]);
    const xs = mapped.map((point) => point[0]);
    const ys = mapped.map((point) => point[1]);
    const axis = mapped.every((point, index) => {
      if (index === 0) return true;
      const prev = mapped[index - 1];
      return Math.abs(point[0] - prev[0]) < 0.8 || Math.abs(point[1] - prev[1]) < 0.8;
    });
    if (closed && axis && mapped.length >= 4 && mapped.length <= 8) {
      pushBox(rects, lines, Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), style);
    } else if (axis) {
      for (let index = 1; index < mapped.length; index += 1) {
        const prev = mapped[index - 1];
        const point = mapped[index];
        if (Math.hypot(point[0] - prev[0], point[1] - prev[1]) < 2) continue;
        lines.push({
          x1: round1(prev[0]),
          y1: round1(prev[1]),
          x2: round1(point[0]),
          y2: round1(point[1]),
          width: style.strokeWidth,
          color: style.stroke || '#000000',
          dash: style.dash,
          dashPhase: style.dashPhase,
        });
      }
    } else {
      uncaptured.nonAxisPaths += 1;
    }
    points = [];
  }
  for (const op of pathOps) {
    if (op === OPS.rectangle || op === 19) {
      commit(false);
      const rx = nums[j++];
      const ry = nums[j++];
      const width = nums[j++];
      const height = nums[j++];
      const corners = [
        mapPoint(state.ctm, rx, ry),
        mapPoint(state.ctm, rx + width, ry),
        mapPoint(state.ctm, rx, ry + height),
        mapPoint(state.ctm, rx + width, ry + height),
      ];
      pushBox(
        rects,
        lines,
        Math.min(...corners.map((point) => point[0])),
        Math.min(...corners.map((point) => point[1])),
        Math.max(...corners.map((point) => point[0])),
        Math.max(...corners.map((point) => point[1])),
        style,
      );
    } else if (op === OPS.moveTo || op === 13) {
      commit(false);
      x = nums[j++];
      y = nums[j++];
      startX = x;
      startY = y;
      points = [[x, y]];
    } else if (op === OPS.lineTo || op === 14) {
      x = nums[j++];
      y = nums[j++];
      points.push([x, y]);
    } else if (op === OPS.curveTo || op === 15) {
      uncaptured.curves += 1;
      j += 6;
      x = nums[j - 2];
      y = nums[j - 1];
    } else if (op === OPS.curveTo2 || op === OPS.curveTo3 || op === 16 || op === 17) {
      uncaptured.curves += 1;
      j += 4;
      x = nums[j - 2];
      y = nums[j - 1];
    } else if (op === OPS.closePath || op === 18) {
      commit(true);
      x = startX;
      y = startY;
    }
  }
  commit(false);
  return { rects, lines };
}

function translateText(matrix, dx, dy) {
  const next = matrix.slice();
  next[4] += matrix[0] * dx + matrix[2] * dy;
  next[5] += matrix[1] * dx + matrix[3] * dy;
  return next;
}

function showSpan(state, arg, page, uncaptured) {
  const glyphs = glyphsOf(arg);
  if (!glyphs.length) {
    uncaptured.undecodedText += 1;
    return null;
  }
  let text = '';
  let widthText = 0;
  for (const glyph of glyphs) {
    if (typeof glyph === 'number') {
      widthText -= (glyph / 1000) * state.fontSize * (state.hScale / 100);
      continue;
    }
    const unicode = glyph.unicode == null ? '' : String(glyph.unicode);
    text += unicode;
    widthText += ((Number(glyph.width) || 0) / 1000) * state.fontSize * (state.hScale / 100);
    widthText += state.charSpacing;
    if (unicode === ' ') widthText += state.wordSpacing;
  }
  const start = mapPoint(state.ctm, state.textMatrix[4], state.textMatrix[5]);
  const advanced = translateText(state.textMatrix, widthText, 0);
  const end = mapPoint(state.ctm, advanced[4], advanced[5]);
  state.textMatrix = advanced;
  const combined = multiply(state.ctm, state.textMatrix);
  const textScale = Math.hypot(state.textMatrix[2], state.textMatrix[3]) || 1;
  const size = round1((state.fontSize * Math.hypot(combined[2], combined[3])) / textScale);
  const visible = text.replace(/\s+/g, ' ').trim();
  if (!visible) return { empty: true };
  return {
    text: visible,
    font: fontNameOf(page, state.fontId),
    size: size || round1(state.fontSize),
    color: hex(state.fill),
    colorSource: state.fillSource,
    x: round1(start[0]),
    y: round1(start[1]),
    width: round1(Math.hypot(end[0] - start[0], end[1] - start[1])),
    anchor: 'left',
    alignment: 'left',
    hScale: state.hScale,
  };
}

function keepBox(box, page, dropped) {
  if (intersects(box, page)) return true;
  dropped.count += 1;
  return false;
}

export function readOperators(ops, page, pageBox) {
  const uncaptured = {
    curves: 0,
    nonAxisPaths: 0,
    shading: 0,
    cmyk: 0,
    opacity: 0,
    xobjects: 0,
    lineStyle: 0,
    markedContent: 0,
    undecodedText: 0,
    textRenderMode: 0,
    unknownOps: {},
  };
  const dropped = { count: 0 };
  const rects = [];
  const lines = [];
  const images = [];
  const shadings = [];
  const spans = [];
  let empty = 0;
  const fontNames = new Map();
  const stack = [freshState()];
  const fns = ops.fnArray || [];
  const args = ops.argsArray || [];
  const show = new Set([OPS.showText, OPS.showSpacedText, OPS.nextLineShowText, OPS.nextLineSetSpacingShowText]);
  const known = new Set([
    OPS.save, OPS.restore, OPS.transform, OPS.setLineWidth, OPS.setStrokeRGBColor, OPS.setFillRGBColor,
    OPS.setFillGray, OPS.setStrokeGray, OPS.setFillCMYKColor, OPS.setStrokeCMYKColor, OPS.setDash,
    OPS.constructPath, OPS.rectangle, OPS.fill, OPS.eoFill, OPS.fillStroke, OPS.eoFillStroke,
    OPS.closeFillStroke, OPS.closeEOFillStroke, OPS.stroke, OPS.closeStroke, OPS.endPath, OPS.clip, OPS.eoClip,
    OPS.showText, OPS.showSpacedText, OPS.nextLineShowText, OPS.nextLineSetSpacingShowText,
    OPS.setFont, OPS.setTextMatrix, OPS.moveText, OPS.setLeadingMoveText, OPS.nextLine,
    OPS.setHScale, OPS.setCharSpacing, OPS.setWordSpacing, OPS.setLeading, OPS.beginText, OPS.endText,
    OPS.paintImageXObject, OPS.paintInlineImageXObject, OPS.shadingFill, OPS.setGState, OPS.dependency,
    OPS.setTextRenderingMode, OPS.setTextRise, OPS.setFillColor, OPS.setStrokeColor,
    OPS.setLineCap, OPS.setLineJoin, OPS.setMiterLimit,
    OPS.beginMarkedContent, OPS.beginMarkedContentProps, OPS.endMarkedContent,
    OPS.paintFormXObjectBegin, OPS.paintFormXObjectEnd, OPS.paintXObject,
  ]);

  for (let i = 0; i < fns.length; i += 1) {
    const fn = fns[i];
    const state = stack[stack.length - 1];
    if (!known.has(fn)) {
      const key = String(fn);
      uncaptured.unknownOps[key] = (uncaptured.unknownOps[key] || 0) + 1;
    }
    if (fn === OPS.save) stack.push(cloneState(state));
    else if (fn === OPS.restore) {
      if (stack.length > 1) stack.pop();
    } else if (fn === OPS.transform) {
      const matrix = matrixOf(args[i]);
      if (matrix) state.ctm = multiply(state.ctm, matrix);
    } else if (fn === OPS.setLineWidth) state.lineWidth = numberArg(args[i]) || state.lineWidth;
    else if (fn === OPS.setStrokeRGBColor) {
      state.stroke = colorOf(args[i]).slice(0, 3);
    } else if (fn === OPS.setFillRGBColor) {
      state.fill = colorOf(args[i]).slice(0, 3);
      state.fillSource = 'rgb';
    } else if (fn === OPS.setFillGray || fn === OPS.setFillColor) {
      const gray = numberArg(args[i]);
      state.fill = [gray, gray, gray];
      state.fillSource = 'gray';
    } else if (fn === OPS.setStrokeGray || fn === OPS.setStrokeColor) {
      const gray = numberArg(args[i]);
      state.stroke = [gray, gray, gray];
    } else if (fn === OPS.setFillCMYKColor || fn === OPS.setStrokeCMYKColor) {
      uncaptured.cmyk += 1;
      const rgb = cmykToRgb(colorOf(args[i]));
      if (fn === OPS.setFillCMYKColor) {
        state.fill = rgb;
        state.fillSource = 'cmyk-approximate';
      } else state.stroke = rgb;
    } else if (fn === OPS.setDash) {
      const list = asList(args[i]);
      const pattern = asList(list[0]).map((value) => Number(value) || 0);
      state.dash = pattern;
      state.dashPhase = Number(list[1]) || 0;
    } else if (fn === OPS.setGState) {
      const flat = JSON.stringify(args[i] || '');
      if (/"ca",\s*(?!1\b)/.test(flat) || /"CA",\s*(?!1\b)/.test(flat)) uncaptured.opacity += 1;
    } else if (fn === OPS.setFont) {
      const list = asList(args[i]);
      state.fontId = String(list[0] || '');
      state.fontSize = Number(list[1]) || state.fontSize;
    } else if (fn === OPS.setTextMatrix) {
      const matrix = matrixOf(args[i]) || identity();
      state.textMatrix = matrix;
      state.lineMatrix = matrix.slice();
    } else if (fn === OPS.moveText) {
      const list = asList(args[i]);
      state.textMatrix = translateText(state.textMatrix, Number(list[0]) || 0, Number(list[1]) || 0);
    } else if (fn === OPS.setLeading) state.leading = numberArg(args[i]);
    else if (fn === OPS.setLeadingMoveText) {
      const list = asList(args[i]);
      state.leading = Number(list[1]) || state.leading;
      state.textMatrix = translateText(state.textMatrix, Number(list[0]) || 0, Number(list[1]) || 0);
    } else if (fn === OPS.nextLine) {
      state.textMatrix = translateText(state.textMatrix, 0, -state.leading);
    } else if (fn === OPS.setHScale) state.hScale = numberArg(args[i]) || 100;
    else if (fn === OPS.setCharSpacing) state.charSpacing = numberArg(args[i]);
    else if (fn === OPS.setWordSpacing) state.wordSpacing = numberArg(args[i]);
    else if (fn === OPS.setTextRenderingMode && numberArg(args[i]) !== 0) uncaptured.textRenderMode += 1;
    else if (fn === OPS.constructPath || fn === OPS.rectangle) {
      const raw = args[i];
      const pathOps = fn === OPS.rectangle ? [OPS.rectangle] : raw?.[0];
      const nums = fn === OPS.rectangle ? asList(raw) : raw?.[1];
      if (!pathOps || !nums) continue;
      const painted = paintKind(fns, i);
      if (painted === 'clip' || painted === 'none') continue;
      const shaped = shapesFromPath(pathOps, nums, state, {
        strokeWidth: round1(state.lineWidth),
        stroke: hex(state.stroke),
        fill: hex(state.fill),
        dash: state.dash,
        dashPhase: state.dashPhase,
        paint: painted,
      }, uncaptured);
      for (const rect of shaped.rects) {
        if (keepBox({ minX: rect.x, minY: rect.y, maxX: rect.x + rect.width, maxY: rect.y + rect.height }, pageBox, dropped)) rects.push(rect);
      }
      for (const line of shaped.lines) {
        if (keepBox({
          minX: Math.min(line.x1, line.x2),
          minY: Math.min(line.y1, line.y2),
          maxX: Math.max(line.x1, line.x2),
          maxY: Math.max(line.y1, line.y2),
        }, pageBox, dropped)) lines.push(line);
      }
    } else if (show.has(fn)) {
      const span = showSpan(state, args[i], page, uncaptured);
      if (!span) continue;
      if (span.empty) {
        empty += 1;
        continue;
      }
      const box = { minX: span.x, minY: span.y, maxX: span.x + Math.max(span.width, 1), maxY: span.y + Math.max(span.size, 1) };
      if (!keepBox(box, pageBox, dropped)) continue;
      fontNames.set(span.font, (fontNames.get(span.font) || 0) + 1);
      spans.push(span);
    } else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) {
      const corners = [mapPoint(state.ctm, 0, 0), mapPoint(state.ctm, 1, 0), mapPoint(state.ctm, 0, 1), mapPoint(state.ctm, 1, 1)];
      const xs = corners.map((point) => point[0]);
      const ys = corners.map((point) => point[1]);
      const image = {
        x: round1(Math.min(...xs)),
        y: round1(Math.min(...ys)),
        width: round1(Math.max(...xs) - Math.min(...xs)),
        height: round1(Math.max(...ys) - Math.min(...ys)),
        format: 'unknown',
        slot: '',
      };
      if (keepBox({ minX: image.x, minY: image.y, maxX: image.x + image.width, maxY: image.y + image.height }, pageBox, dropped)) images.push(image);
    } else if (fn === OPS.shadingFill) {
      uncaptured.shading += 1;
      shadings.push({ name: JSON.stringify(args[i]), note: 'Shading operator has no color stops or bbox in the operator list.' });
    }     else if (fn === OPS.setLineCap || fn === OPS.setLineJoin || fn === OPS.setMiterLimit) uncaptured.lineStyle += 1;
    else if (fn === OPS.beginMarkedContent || fn === OPS.beginMarkedContentProps || fn === OPS.endMarkedContent) uncaptured.markedContent += 1;
    else if (fn === OPS.paintXObject || fn === OPS.paintFormXObjectBegin || fn === OPS.paintFormXObjectEnd) {
      uncaptured.xobjects += 1;
    }
  }

  return { spans, rects, lines, images, shadings, fontNames, empty, uncaptured, droppedOutside: dropped.count };
}
