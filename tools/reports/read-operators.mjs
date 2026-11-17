/**
 * Walk a pdfjs operator list once.
 * Text spans are one show-text operator each, with the fill color from the
 * graphics state. Elements fully outside the page box are dropped.
 */
import { OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';

function round1(value) {
  return Math.round(Number(value) * 10) / 10;
}

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
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
    lineCap: 0,
    lineJoin: 0,
    miterLimit: 10,
    textRenderMode: 0,
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
    if (item && (item.unicode != null || item.fontChar)) {
      glyphs.push(item.unicode == null ? { ...item, unicode: String(item.fontChar) } : item);
      continue;
    }
    if (item && typeof item.length === 'number') {
      for (const glyph of asList(item)) {
        if (typeof glyph === 'number') glyphs.push(glyph);
        else if (glyph && glyph.unicode != null) glyphs.push(glyph);
        else if (glyph && glyph.fontChar) glyphs.push({ ...glyph, unicode: String(glyph.fontChar) });
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

function strokeStyle(style) {
  return {
    lineCap: style.lineCap || 0,
    lineJoin: style.lineJoin || 0,
    miterLimit: style.miterLimit || 10,
    dash: style.dash,
    dashPhase: style.dashPhase,
  };
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
      ...strokeStyle(style),
    });
  } else if (width > 4 && height >= 0.15 && height <= 2.5) {
    lines.push({
      x1: round1(minX),
      y1: round1(minY + height / 2),
      x2: round1(maxX),
      y2: round1(minY + height / 2),
      width: round1(height),
      color: style.stroke || style.fill || '#000000',
      ...strokeStyle(style),
    });
  } else if (height > 4 && width >= 0.15 && width <= 2.5) {
    lines.push({
      x1: round1(minX + width / 2),
      y1: round1(minY),
      x2: round1(minX + width / 2),
      y2: round1(maxY),
      width: round1(width),
      color: style.stroke || style.fill || '#000000',
      ...strokeStyle(style),
    });
  }
}

function userPoint(state, x, y) {
  const point = mapPoint(state.ctm, x, y);
  return [round1(point[0]), round1(point[1])];
}

function shapesFromPath(pathOps, nums, state, style) {
  const rects = [];
  const lines = [];
  const paths = [];
  let j = 0;
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let commands = [];
  let curved = false;
  let nonAxis = false;
  function commit(closed) {
    if (commands.length < 2) {
      commands = [];
      curved = false;
      nonAxis = false;
      return;
    }
    if (closed) commands.push({ op: 'h' });
    if (curved || nonAxis) {
      paths.push({
        commands,
        strokeWidth: style.strokeWidth,
        stroke: style.paint === 'fill' ? null : style.stroke,
        fill: style.paint === 'stroke' ? null : style.fill,
        paint: style.paint,
        ...strokeStyle(style),
      });
    } else {
      const points = commands.filter((command) => command.op === 'm' || command.op === 'l').map((command) => command.p);
      if (closed) points.push(points[0]);
      const xs = points.map((point) => point[0]);
      const ys = points.map((point) => point[1]);
      if (closed && points.length >= 4 && points.length <= 8) {
        pushBox(rects, lines, Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), style);
      } else {
        for (let index = 1; index < points.length; index += 1) {
          const prev = points[index - 1];
          const point = points[index];
          if (Math.hypot(point[0] - prev[0], point[1] - prev[1]) < 2) continue;
          lines.push({
            x1: prev[0],
            y1: prev[1],
            x2: point[0],
            y2: point[1],
            width: style.strokeWidth,
            color: style.stroke || '#000000',
            ...strokeStyle(style),
          });
        }
      }
    }
    commands = [];
    curved = false;
    nonAxis = false;
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
      commands = [{ op: 'm', p: userPoint(state, x, y) }];
    } else if (op === OPS.lineTo || op === 14) {
      const nextX = nums[j++];
      const nextY = nums[j++];
      const from = userPoint(state, x, y);
      const to = userPoint(state, nextX, nextY);
      if (Math.abs(from[0] - to[0]) >= 0.8 && Math.abs(from[1] - to[1]) >= 0.8) nonAxis = true;
      x = nextX;
      y = nextY;
      commands.push({ op: 'l', p: to });
    } else if (op === OPS.curveTo || op === 15) {
      const c1 = userPoint(state, nums[j++], nums[j++]);
      const c2 = userPoint(state, nums[j++], nums[j++]);
      x = nums[j++];
      y = nums[j++];
      curved = true;
      commands.push({ op: 'c', p: [c1, c2, userPoint(state, x, y)] });
    } else if (op === OPS.curveTo2 || op === 16) {
      const current = userPoint(state, x, y);
      const c2 = userPoint(state, nums[j++], nums[j++]);
      x = nums[j++];
      y = nums[j++];
      curved = true;
      commands.push({ op: 'c', p: [current, c2, userPoint(state, x, y)] });
    } else if (op === OPS.curveTo3 || op === 17) {
      const c1 = userPoint(state, nums[j++], nums[j++]);
      x = nums[j++];
      y = nums[j++];
      const end = userPoint(state, x, y);
      curved = true;
      commands.push({ op: 'c', p: [c1, end, end] });
    } else if (op === OPS.closePath || op === 18) {
      commit(true);
      x = startX;
      y = startY;
    }
  }
  commit(false);
  return { rects, lines, paths };
}

function translateText(matrix, dx, dy) {
  const next = matrix.slice();
  next[4] += matrix[0] * dx + matrix[2] * dy;
  next[5] += matrix[1] * dx + matrix[3] * dy;
  return next;
}

function textPoint(state, distance) {
  const local = translateText(state.textMatrix, distance, 0);
  return mapPoint(state.ctm, local[4], local[5]);
}

function argumentHasGlyphs(arg) {
  return asList(arg).some((item) => {
    if (typeof item === 'number') return false;
    if (item && (item.unicode != null || item.fontChar)) return true;
    if (item && typeof item.length === 'number') {
      return asList(item).some((glyph) => (glyph && (glyph.unicode != null || glyph.fontChar)) || typeof glyph === 'number');
    }
    return item != null && item !== '';
  });
}

function showSpan(state, arg, page, uncaptured) {
  const glyphs = glyphsOf(arg);
  if (!glyphs.length) {
    if (argumentHasGlyphs(arg)) uncaptured.undecodedText += 1;
    return null;
  }
  const scale = (state.hScale || 100) / 100;
  const baseTextScale = Math.hypot(state.textMatrix[2], state.textMatrix[3]) || 1;
  const baseCombined = multiply(state.ctm, state.textMatrix);
  const userSize = (state.fontSize * Math.hypot(baseCombined[2], baseCombined[3])) / baseTextScale;
  let cursor = 0;
  let glyphWidth = 0;
  let segmentStart = 0;
  let segmentText = '';
  const segments = [];
  function closeSegment() {
    if (!segmentText) {
      segmentStart = cursor;
      return;
    }
    const origin = textPoint(state, segmentStart);
    const end = textPoint(state, cursor);
    segments.push({
      text: segmentText,
      x: round1(origin[0]),
      y: round1(origin[1]),
      width: round2(Math.hypot(end[0] - origin[0], end[1] - origin[1])),
    });
    segmentText = '';
    segmentStart = cursor;
  }
  for (const glyph of glyphs) {
    if (typeof glyph === 'number') {
      closeSegment();
      cursor -= (glyph / 1000) * state.fontSize * scale;
      segmentStart = cursor;
      continue;
    }
    const unicode = glyph.unicode == null ? '' : String(glyph.unicode);
    const advance = ((Number(glyph.width) || 0) / 1000) * state.fontSize;
    glyphWidth += ((Number(glyph.width) || 0) / 1000) * userSize;
    if (!segmentText) segmentStart = cursor;
    segmentText += unicode;
    cursor += (advance + state.charSpacing + (unicode === ' ' ? state.wordSpacing : 0)) * scale;
  }
  closeSegment();
  const start = textPoint(state, 0);
  const end = textPoint(state, cursor);
  state.textMatrix = translateText(state.textMatrix, cursor, 0);
  const combined = multiply(state.ctm, state.textMatrix);
  const textScale = Math.hypot(state.textMatrix[2], state.textMatrix[3]) || 1;
  const size = round1((state.fontSize * Math.hypot(combined[2], combined[3])) / textScale);
  const text = segments.map((segment) => segment.text).join('');
  if (!text.replace(/\s+/g, '').length) return { empty: true };
  return {
    text: text.replace(/\s+/g, ' ').trim(),
    glyphText: text,
    segments,
    font: fontNameOf(page, state.fontId),
    size: size || round1(state.fontSize),
    color: hex(state.fill),
    colorSource: state.fillSource,
    x: round1(start[0]),
    y: round1(start[1]),
    width: round2(Math.hypot(end[0] - start[0], end[1] - start[1])),
    anchor: 'left',
    alignment: 'left',
    hScale: state.hScale,
    charSpacing: state.charSpacing,
    wordSpacing: state.wordSpacing,
    glyphWidth: round2(glyphWidth),
    renderMode: state.textRenderMode || 0,
    stroke: hex(state.stroke),
    strokeWidth: round2(state.lineWidth),
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
  const paths = [];
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
    else if (fn === OPS.setTextRenderingMode) {
      state.textRenderMode = numberArg(args[i]);
      if (state.textRenderMode > 3) uncaptured.textRenderMode += 1;
    }
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
        dash: state.dash.slice(),
        dashPhase: state.dashPhase,
        paint: painted,
        lineCap: state.lineCap,
        lineJoin: state.lineJoin,
        miterLimit: state.miterLimit,
      });
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
      for (const path of shaped.paths) {
        const xs = path.commands.flatMap((command) => (command.op === 'c' ? command.p.flat() : command.p || [])).filter((_, index) => index % 2 === 0);
        const ys = path.commands.flatMap((command) => (command.op === 'c' ? command.p.flat() : command.p || [])).filter((_, index) => index % 2 === 1);
        if (!xs.length) continue;
        if (keepBox({ minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) }, pageBox, dropped)) paths.push(path);
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
        name: String(asList(args[i])[0] || ''),
      };
      if (keepBox({ minX: image.x, minY: image.y, maxX: image.x + image.width, maxY: image.y + image.height }, pageBox, dropped)) images.push(image);
    } else if (fn === OPS.shadingFill) {
      uncaptured.shading += 1;
      shadings.push({ name: JSON.stringify(args[i]), note: 'Shading operator has no color stops or bbox in the operator list.' });
    }     else if (fn === OPS.setLineCap) state.lineCap = numberArg(args[i]);
    else if (fn === OPS.setLineJoin) state.lineJoin = numberArg(args[i]);
    else if (fn === OPS.setMiterLimit) state.miterLimit = numberArg(args[i]) || state.miterLimit;
    else if (fn === OPS.beginMarkedContent || fn === OPS.beginMarkedContentProps || fn === OPS.endMarkedContent) uncaptured.markedContent += 1;
    else if (fn === OPS.paintFormXObjectBegin || fn === OPS.paintFormXObjectEnd) {
      // pdfjs already inlines the form's operators between these markers.
    } else if (fn === OPS.paintXObject) uncaptured.xobjects += 1;
  }

  return { spans, rects, lines, paths, images, shadings, fontNames, empty, uncaptured, droppedOutside: dropped.count };
}

export function countFeatures(ops) {
  const fns = ops.fnArray || [];
  const args = ops.argsArray || [];
  const features = {
    curves: 0, shading: 0, images: 0, cmyk: 0, opacity: 0, dash: 0,
    textRenderModes: 0, tj: 0, tc: 0, tw: 0, tz: 0, fonts: new Set(),
  };
  for (let i = 0; i < fns.length; i += 1) {
    const fn = fns[i];
    if (fn === OPS.constructPath) {
      const pathOps = args[i]?.[0] || [];
      for (const op of pathOps) {
        if (op === OPS.curveTo || op === OPS.curveTo2 || op === OPS.curveTo3 || op === 15 || op === 16 || op === 17) features.curves += 1;
      }
    }
    if (fn === OPS.shadingFill) features.shading += 1;
    if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) features.images += 1;
    if (fn === OPS.setFillCMYKColor || fn === OPS.setStrokeCMYKColor) features.cmyk += 1;
    if (fn === OPS.setGState) {
      const flat = JSON.stringify(args[i] || '');
      if (/"ca",\s*(?!1\b)/.test(flat) || /"CA",\s*(?!1\b)/.test(flat)) features.opacity += 1;
    }
    if (fn === OPS.setDash && asList(asList(args[i])[0]).some((value) => Number(value) > 0)) features.dash += 1;
    if (fn === OPS.setTextRenderingMode && numberArg(args[i]) !== 0) features.textRenderModes += 1;
    if (fn === OPS.setCharSpacing && numberArg(args[i]) !== 0) features.tc += 1;
    if (fn === OPS.setWordSpacing && numberArg(args[i]) !== 0) features.tw += 1;
    if (fn === OPS.setHScale && numberArg(args[i]) !== 100) features.tz += 1;
    if (fn === OPS.showSpacedText || fn === OPS.showText) {
      if (glyphsOf(args[i]).some((glyph) => typeof glyph === 'number' && glyph !== 0)) features.tj += 1;
    }
    if (fn === OPS.setFont) features.fonts.add(String(asList(args[i])[0] || ''));
  }
  return features;
}
