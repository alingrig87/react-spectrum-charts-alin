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
 * Small d3-band/linear-scale equivalents, hand-rolled because there's no
 * Vega-Lite here to compute them — every axis-bearing chart (Bar, Line,
 * Scatter, Combo, Bullet) shares these instead of each re-deriving the same
 * position math.
 */

export function scaleLinear(domain: readonly [number, number], range: readonly [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
}

/** Rounds a value up to a "nice" axis max (1/2/5/10 × a power of ten) — the same rule most charting libraries use so gridlines land on round numbers. */
export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const residual = value / magnitude;
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  return niceResidual * magnitude;
}

export interface BandScale {
  step: number;
  bandwidth: number;
  start: (index: number) => number;
  center: (index: number) => number;
}

/** Same denominator d3's band scale uses (`round: false`): evenly spaces `count` bands across `range`, each `bandwidth` wide with `paddingInner`-fraction gaps between them and `paddingOuter`-fraction margins at the ends. Defaults match `theme/tokens.ts`'s `PADDING_RATIO`/`DISCRETE_PADDING` — the same band padding rsc-vega-mobile's Vega-Lite band scale uses — so bars come out the same width/spacing as the web sibling. */
export function scaleBand(count: number, range: readonly [number, number], paddingInner = 0.4, paddingOuter = 0.35): BandScale {
  const [r0, r1] = range;
  const n = Math.max(count, 1);
  const step = (r1 - r0) / Math.max(n - paddingInner + paddingOuter * 2, 1);
  const bandwidth = Math.max(step * (1 - paddingInner), 1);
  const start = (i: number) => r0 + paddingOuter * step + i * step;
  return { step, bandwidth, start, center: (i: number) => start(i) + bandwidth / 2 };
}

/** Evenly spaced tick values from 0 to `max` (inclusive), `count` of them. */
export function ticksFor(max: number, count = 4): number[] {
  return Array.from({ length: count + 1 }, (_, i) => Math.round(((max / count) * i + Number.EPSILON) * 100) / 100);
}
