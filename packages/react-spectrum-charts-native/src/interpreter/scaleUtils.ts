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
import { scaleBand, scaleLinear, scaleTime } from 'd3-scale';
import { Scale as VegaScale } from 'vega';

export interface ScaleTick {
  pixel: number;
  label: string;
}

export interface ScaleBuildResult {
  toPixel: (value: number) => number;
  ticks: ScaleTick[];
}

export interface BandScaleBuildResult {
  toPixel: (value: string) => number;
  bandwidth: number;
  ticks: ScaleTick[];
}

/** Only linear and time scales are interpreted — see README for what's unsupported. */
export const isSupportedScaleType = (type: string | undefined): boolean => type === 'linear' || type === 'time';

/** Only a `band` dimension scale is interpreted for bar marks — see README for what's unsupported. */
export const isSupportedBandScaleType = (type: string | undefined): boolean => type === 'band';

/**
 * Builds a d3 continuous scale from a resolved Vega scale definition and the mark's own data values,
 * honoring `nice`/`zero`/`padding` the way Vega's runtime scale resolution would.
 */
export const buildContinuousScale = (vegaScale: VegaScale, values: number[], rangeSize: number): ScaleBuildResult => {
  const isTime = vegaScale.type === 'time';
  const tickCount = Math.max(Math.round(rangeSize / (isTime ? 80 : 50)), 2);

  let min = values.length ? Math.min(...values) : 0;
  let max = values.length ? Math.max(...values) : 1;
  if (min === max) {
    // guard against a degenerate single-value domain, which would otherwise collapse the scale
    min -= 1;
    max += 1;
  }
  if ('zero' in vegaScale && vegaScale.zero) {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }
  const padding = 'padding' in vegaScale && typeof vegaScale.padding === 'number' ? vegaScale.padding : 0;
  const range: [number, number] = [padding, Math.max(rangeSize - padding, padding)];
  const nice = 'nice' in vegaScale && Boolean(vegaScale.nice);

  if (isTime) {
    const scale = scaleTime().domain([new Date(min), new Date(max)]).range(range);
    if (nice) scale.nice();
    const format = scale.tickFormat(tickCount);
    return {
      toPixel: (value) => scale(new Date(value)),
      ticks: scale.ticks(tickCount).map((t) => ({ pixel: scale(t), label: format(t) })),
    };
  }

  const scale = scaleLinear().domain([min, max]).range(range);
  if (nice) scale.nice();
  const format = scale.tickFormat(tickCount);
  return {
    toPixel: (value) => scale(value),
    ticks: scale.ticks(tickCount).map((t) => ({ pixel: scale(t), label: format(t) })),
  };
};

/**
 * Builds a d3 band scale from a resolved Vega band scale definition and the mark's own (already
 * de-duplicated, in first-seen order) category values, honoring `paddingInner`/`paddingOuter` the way
 * Vega's runtime scale resolution would. Tick generation and ordering are a d3 approximation, not a
 * replica of Vega's own domain-sorting logic — see README.
 */
export const buildBandScale = (
  vegaScale: VegaScale,
  categories: string[],
  rangeSize: number
): BandScaleBuildResult => {
  const paddingInner = 'paddingInner' in vegaScale && typeof vegaScale.paddingInner === 'number'
    ? vegaScale.paddingInner
    : 0;
  const paddingOuter = 'paddingOuter' in vegaScale && typeof vegaScale.paddingOuter === 'number'
    ? vegaScale.paddingOuter
    : 0;

  const scale = scaleBand<string>()
    .domain(categories)
    .range([0, rangeSize])
    .paddingInner(paddingInner)
    .paddingOuter(paddingOuter);

  return {
    toPixel: (value) => scale(value) ?? 0,
    bandwidth: categories.length ? scale.bandwidth() : 0,
    ticks: categories.map((c) => ({ pixel: (scale(c) ?? 0) + scale.bandwidth() / 2, label: c })),
  };
};
