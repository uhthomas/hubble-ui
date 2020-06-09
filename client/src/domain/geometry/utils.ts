import { XY } from './general';
import { XYWH, Sides } from './xywh';
import { Vec2 } from './vec2';

// Calculate points where arc should start from and to where should it go
// to form a rounded corner, assuming that points follows as:
//          points[1]
//              *
//             | \
//      side1 |   \ side2
//           |     \
// points[0] *      * points[2]

export const roundCorner = (
  r: number,
  points: [XY, XY, XY],
): [Vec2, Vec2, number] => {
  const p0 = Vec2.fromXY(points[0]);
  const p1 = Vec2.fromXY(points[1]);
  const p2 = Vec2.fromXY(points[2]);

  const [side1, side2] = [p0.sub(p1), p2.sub(p1)];
  const angle = side1.angle(side2);

  const offset = r / Math.tan(angle / 2);
  const roundStart = p1.linterp(p0, offset / p0.distance(p1));
  const roundEnd = p1.linterp(p2, offset / p2.distance(p1));

  return [roundStart, roundEnd, angle];
};

export const distance = (from: XY, to: XY): number => {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);

  return Math.sqrt(dx ** 2 + dy ** 2);
};

export const linterp2 = (from: XY, to: XY, t: number): XY => {
  return {
    x: from.x * (1 - t) + to.x * t,
    y: from.y * (1 - t) + to.y * t,
  };
};