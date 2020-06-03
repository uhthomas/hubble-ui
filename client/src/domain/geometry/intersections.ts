import { XY } from '~/domain/geometry/general';
import { XYWH, Sides } from '~/domain/geometry/xywh';
import { tooSmall } from '~/domain/misc';

const outOfSegments = (
  x: number,
  y: number,
  p1: XY,
  p2: XY,
  p3: XY,
  p4: XY,
): boolean => {
  const [seg1xlm, seg1xrm] = p1.x < p2.x ? [p1.x, p2.x] : [p2.x, p1.x];
  const [seg1ylm, seg1yrm] = p1.y < p2.y ? [p1.y, p2.y] : [p2.y, p1.y];
  const [seg2xlm, seg2xrm] = p3.x < p4.x ? [p3.x, p4.x] : [p4.x, p3.x];
  const [seg2ylm, seg2yrm] = p3.y < p4.y ? [p3.y, p4.y] : [p4.y, p3.y];

  const ok1 = x >= seg1xlm && x <= seg1xrm && y >= seg1ylm && y <= seg1yrm;

  const ok2 = x >= seg2xlm && x <= seg2xrm && y >= seg2ylm && y <= seg2yrm;

  return !(ok1 && ok2);
};

export const segmentsIntersection = (
  p1: XY,
  p2: XY,
  p3: XY,
  p4: XY,
  lineMode = false,
): XY | null => {
  const dx1 = p2.x - p1.x;
  const dy1 = p2.y - p1.y;

  const dx2 = p4.x - p3.x;
  const dy2 = p4.y - p3.y;

  // Lines are parallel or collinear cases
  if (!tooSmall(dx1) && !tooSmall(dy1)) {
    // General case
    const one = Math.abs(dx2 / dx1);
    const two = Math.abs(dy2 / dy1);

    if (tooSmall(one - two)) return null;
  } else if (tooSmall(dx1)) {
    // Vertical case
    if (tooSmall(dx2)) return null;
  } else if (tooSmall(dy1)) {
    // Horizontal case
    if (tooSmall(dy2)) return null;
  }

  const s1 = dy1 / dx1;
  const s2 = dy2 / dx2;

  // One of the lines is vertical
  if (!tooSmall(dx1) && tooSmall(dx2)) {
    const x = p3.x;
    const y = s1 * (x - p1.x) + p1.y;

    if (outOfSegments(x, y, p1, p2, p3, p4)) return null;

    return { x, y };
  }

  if (!tooSmall(dx2) && tooSmall(dx1)) {
    const x = p1.x;
    const y = s2 * (x - p3.x) + p3.y;

    if (outOfSegments(x, y, p1, p2, p3, p4)) return null;

    return { x, y };
  }

  // Normal case
  const x = (s1 * p1.x - p1.y - s2 * p3.x + p3.y) / (s1 - s2);
  const y = s1 * (x - p1.x) + p1.y;

  // This functions finds intersecton on segments, i e on limited part of
  // lines. If you want to find an intersecton on infinite lines,
  // use `true` for `lineMode` param
  if (!lineMode) {
    if (outOfSegments(x, y, p1, p2, p3, p4)) return null;
  }

  // No intersecton
  if (Math.abs(x) === Infinity || Math.abs(y) === Infinity) {
    return null;
  }

  return { x, y };
};
