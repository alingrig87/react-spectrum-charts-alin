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
import { curveLinear, line as d3Line } from 'd3-shape';
import { LineMark, RectMark, Spec } from 'vega';

import { ChartOptions, buildSpec } from '@spectrum-charts/vega-spec-builder';

import { RenderModel } from '../types';
import { getTransformedTableRows } from './dataUtils';
import { buildBandScale, buildContinuousScale, isSupportedBandScaleType, isSupportedScaleType } from './scaleUtils';
import {
  findBarMark,
  findLineMark,
  findScale,
  findStackTransform,
  getBandRef,
  getDefinedField,
  getFieldRef,
  getStaticValue,
} from './specReader';

export interface RenderDimensions {
  width: number;
  height: number;
  /** Pixels reserved for axis ticks/labels around the plot area. */
  margin?: { top: number; right: number; bottom: number; left: number };
}

const DEFAULT_MARGIN = { top: 16, right: 16, bottom: 32, left: 48 };
const DEFAULT_STROKE = '#2680EB';
const DEFAULT_BAR_FILL = '#2680EB';

const isValidNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value);

/**
 * Runs the real vega-spec-builder pipeline, then interprets the resulting spec for either a single
 * line mark or a single, ungrouped bar mark (linear/time scales for the continuous axis, a band scale
 * for a bar's dimension axis). See the package README for exactly which spec features are read and
 * which are ignored.
 */
export const buildRenderModel = (chartOptions: ChartOptions, dimensions: RenderDimensions): RenderModel => {
  const spec = buildSpec(chartOptions) as Spec;
  const margin = { ...DEFAULT_MARGIN, ...dimensions.margin };
  const plot = {
    x: margin.left,
    y: margin.top,
    width: Math.max(dimensions.width - margin.left - margin.right, 0),
    height: Math.max(dimensions.height - margin.top - margin.bottom, 0),
  };

  const rawRows = (chartOptions.data ?? []) as Record<string, unknown>[];
  const rows = getTransformedTableRows(spec, rawRows);

  const lineMark = findLineMark(spec);
  if (lineMark) return buildLineRenderModel(spec, lineMark, rows, dimensions, plot);

  const barMark = findBarMark(spec);
  if (barMark) return buildBarRenderModel(spec, barMark, rows, dimensions, plot);

  throw new Error('RscNativeChart: no supported line or bar mark found in the generated spec.');
};

const buildLineRenderModel = (
  spec: Spec,
  lineMark: LineMark,
  rows: Record<string, unknown>[],
  dimensions: RenderDimensions,
  plot: RenderModel['plot']
): RenderModel => {
  const xRule = getFieldRef(lineMark.encode?.update?.x ?? lineMark.encode?.enter?.x);
  const yRule = getFieldRef(lineMark.encode?.enter?.y);
  if (!xRule || !yRule) {
    throw new Error('RscNativeChart: line mark x/y encodings are not field-based; unsupported spec shape.');
  }

  const xScaleDef = findScale(spec, xRule.scale);
  const yScaleDef = findScale(spec, yRule.scale);
  if (!xScaleDef || !isSupportedScaleType(xScaleDef.type) || !yScaleDef || !isSupportedScaleType(yScaleDef.type)) {
    throw new Error('RscNativeChart: only linear and time scales are supported.');
  }

  const definedField = getDefinedField(lineMark.encode?.enter?.defined);
  const validRows = rows.filter((row) => {
    if (definedField && !isValidNumber(row[definedField])) return false;
    return isValidNumber(row[xRule.field]) && isValidNumber(row[yRule.field]);
  });

  const xValues = validRows.map((row) => row[xRule.field] as number);
  const yValues = validRows.map((row) => row[yRule.field] as number);

  const xScale = buildContinuousScale(xScaleDef, xValues, plot.width);
  const yScale = buildContinuousScale(yScaleDef, yValues, plot.height);
  // Vega's y-range grows upward from 0; SVG grows downward, so flip once here and reuse for ticks.
  const flipY = (pixel: number) => plot.height - pixel;

  const lineGenerator = d3Line<Record<string, unknown>>()
    .curve(curveLinear)
    .x((row) => xScale.toPixel(row[xRule.field] as number))
    .y((row) => flipY(yScale.toPixel(row[yRule.field] as number)));

  return {
    width: dimensions.width,
    height: dimensions.height,
    plot,
    line: {
      path: lineGenerator(validRows) ?? '',
      stroke: getStaticValue(lineMark.encode?.enter?.stroke, DEFAULT_STROKE),
      strokeWidth: getStaticValue(lineMark.encode?.enter?.strokeWidth, 2),
      strokeDasharray: getStaticValue<number[]>(lineMark.encode?.enter?.strokeDash, []),
    },
    xAxis: {
      orient: 'bottom',
      axisLinePosition: plot.height,
      grid: false,
      ticks: xScale.ticks.map((t) => ({ position: t.pixel, label: t.label })),
    },
    yAxis: {
      orient: 'left',
      axisLinePosition: 0,
      grid: false,
      ticks: yScale.ticks.map((t) => ({ position: flipY(t.pixel), label: t.label })),
    },
  };
};

/**
 * Interprets a single, ungrouped `stacked`-type bar mark (the default `type` when a `bar` mark is
 * added without dodge/trellis/dual-axis options) — the shape `addBar` produces as two top-level `rect`
 * marks (a background rect + the real one), rather than nested inside a facet `group` the way dodged
 * or trellised bars are. See README for exactly what this does and doesn't handle.
 */
const buildBarRenderModel = (
  spec: Spec,
  barMark: RectMark,
  rows: Record<string, unknown>[],
  dimensions: RenderDimensions,
  plot: RenderModel['plot']
): RenderModel => {
  const xRule = getFieldRef(barMark.encode?.update?.x);
  const widthRule = getBandRef(barMark.encode?.update?.width);
  if (!xRule || !widthRule || xRule.scale !== widthRule.scale) {
    throw new Error('RscNativeChart: bar mark x/width encodings are not a supported band-scale shape.');
  }

  const xScaleDef = findScale(spec, xRule.scale);
  if (!xScaleDef || !isSupportedBandScaleType(xScaleDef.type)) {
    throw new Error('RscNativeChart: only a band dimension scale is supported for bar charts.');
  }

  // y2 (the top of the bar) resolves to a plain field ref even for stacked bars; y (the baseline) is a
  // conditional signal expression that this interpreter deliberately doesn't evaluate — see below.
  const y2Rule = getFieldRef(barMark.encode?.enter?.y2);
  if (!y2Rule) {
    throw new Error('RscNativeChart: bar mark y2 encoding is not field-based; unsupported spec shape.');
  }

  const yScaleDef = findScale(spec, y2Rule.scale);
  if (!yScaleDef || !isSupportedScaleType(yScaleDef.type)) {
    throw new Error('RscNativeChart: only linear and time scales are supported.');
  }

  // The stack transform's own `field` is the *raw* metric field name (`y2Rule.field` is the derived
  // `${metric}1` field the stack transform writes, which doesn't exist on the raw input rows). Its
  // `groupby` tells us exactly what Vega's stack transform groups by at runtime; this interpreter only
  // supports one bar per group (a "simple bar" chart), so a value/color-faceted groupby is rejected here
  // rather than silently drawing a mis-stacked bar.
  const stackTransform = findStackTransform(spec);
  const metricField = stackTransform?.field ?? y2Rule.field;
  if (stackTransform && (stackTransform.groupby.length !== 1 || stackTransform.groupby[0] !== xRule.field)) {
    throw new Error('RscNativeChart: only a single-series bar chart (one bar per category) is supported.');
  }

  const validRows = rows.filter(
    (row) => isValidNumber(row[metricField]) && row[xRule.field] !== undefined && row[xRule.field] !== null
  );

  const categories: string[] = [];
  const seenCategories = new Set<string>();
  for (const row of validRows) {
    const category = String(row[xRule.field]);
    if (seenCategories.has(category)) {
      throw new Error('RscNativeChart: multiple bars per category (stacked/grouped bars) are not supported.');
    }
    seenCategories.add(category);
    categories.push(category);
  }

  const metricValues = validRows.map((row) => row[metricField] as number);

  const xScale = buildBandScale(xScaleDef, categories, plot.width);
  const yScale = buildContinuousScale(yScaleDef, metricValues, plot.height);
  // Vega's y-range grows upward from 0; SVG grows downward, so flip once here and reuse for ticks.
  const flipY = (pixel: number) => plot.height - pixel;
  const baselinePixel = flipY(yScale.toPixel(0));
  const barFill = getStaticValue(barMark.encode?.enter?.fill, DEFAULT_BAR_FILL);

  const bars = validRows.map((row, i) => {
    const valuePixel = flipY(yScale.toPixel(row[metricField] as number));
    return {
      x: xScale.toPixel(categories[i]),
      y: Math.min(baselinePixel, valuePixel),
      width: xScale.bandwidth,
      height: Math.abs(valuePixel - baselinePixel),
      fill: barFill,
    };
  });

  return {
    width: dimensions.width,
    height: dimensions.height,
    plot,
    bars,
    xAxis: {
      orient: 'bottom',
      axisLinePosition: plot.height,
      grid: false,
      ticks: xScale.ticks.map((t) => ({ position: t.pixel, label: t.label })),
    },
    yAxis: {
      orient: 'left',
      axisLinePosition: 0,
      grid: false,
      ticks: yScale.ticks.map((t) => ({ position: flipY(t.pixel), label: t.label })),
    },
  };
};
