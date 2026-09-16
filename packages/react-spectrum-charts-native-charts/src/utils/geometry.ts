/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/**
 * Polar/trig helpers shared by Donut/Funnel/Venn — ported verbatim from
 * rsc-vega-mobile's `rsc-mobile/shared/geometry.ts`. Pure math, so it needed
 * no change moving from web SVG to react-native-svg. Also holds a couple of
 * plain SVG-path helpers (`topRoundedRectPath`, `smoothLinePath`) used by
 * Bar/Combo and BigNumber to reproduce Vega mark styling react-native-svg's
 * primitive shapes can't express directly.
 */

export interface Point {
  x: number;
  y: number;
}

/** angle in radians, 0 = 12 o'clock, positive = clockwise. */
export function polarToCartesian(cx: number, cy: number, radius: number, angle: number): Point {
  return { x: cx + radius * Math.sin(angle), y: cy - radius * Math.cos(angle) };
}

/** SVG path `d` for one donut/pie wedge (a ring segment when innerRadius > 0, a plain pie slice when it's 0). */
export function describeDonutSegment(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number): string {
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);

  if (innerRadius <= 0) {
    return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y} Z`;
  }

  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

/**
 * SVG path `d` for a rect with only its top-left/top-right corners rounded
 * (bottom stays square) — matches how Vega's bar mark is themed in
 * `spectrumVegaTheme.ts` (`cornerRadiusTopLeft`/`cornerRadiusTopRight` only,
 * no bottom radius), which react-native-svg's plain `<Rect rx>` can't
 * express since `rx` rounds all four corners uniformly. `radius` is clamped
 * to at most half the rect's own width/height so it degrades gracefully for
 * very short or narrow bars/segments instead of self-intersecting.
 */
export function topRoundedRectPath(x: number, y: number, width: number, height: number, radius: number): string {
  const r = Math.max(0, Math.min(radius, width / 2, height));
  if (r <= 0) return `M ${x} ${y} h ${width} v ${height} h ${-width} Z`;
  return [
    `M ${x} ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    `H ${x + width - r}`,
    `A ${r} ${r} 0 0 1 ${x + width} ${y + r}`,
    `V ${y + height}`,
    `H ${x}`,
    'Z',
  ].join(' ');
}

/**
 * Smooth SVG path `d` through `points`, via Catmull-Rom-derived cubic
 * Béziers — a reasonable stand-in for Vega-Lite's `interpolate: 'monotone'`
 * line smoothing (BigNumber's sparkline spec on the web side), without
 * reproducing exact monotone-cubic math for what's a decorative trend line.
 * Falls back to a straight segment for 2 points, an empty path for fewer.
 */
export function smoothLinePath(points: readonly Point[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  const d: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`);
  }
  return d.join(' ');
}

export interface Segment<T> {
  datum: T;
  value: number;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  fraction: number;
}

/** Splits `data` into angular segments summing to a full circle (or `sweep` radians), in data order — matches RSC's data-order stacking convention rather than an alphabetical one. */
export function computeSegments<T>(data: T[], getValue: (d: T) => number, sweep = 2 * Math.PI, startAt = 0): Segment<T>[] {
  const total = data.reduce((sum, d) => sum + getValue(d), 0);
  let cumulative = 0;
  return data.map((datum) => {
    const value = getValue(datum);
    const startAngle = startAt + (cumulative / total) * sweep;
    cumulative += value;
    const endAngle = startAt + (cumulative / total) * sweep;
    return { datum, value, startAngle, endAngle, midAngle: (startAngle + endAngle) / 2, fraction: value / total };
  });
}
