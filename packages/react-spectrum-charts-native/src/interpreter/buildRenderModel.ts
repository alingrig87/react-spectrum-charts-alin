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
import { Spec } from 'vega';

import { ChartOptions, buildSpec } from '@spectrum-charts/vega-spec-builder';

import { RenderModel } from '../types';
import { getTransformedTableRows } from './dataUtils';
import { buildContinuousScale, isSupportedScaleType } from './scaleUtils';
import { findLineMark, findScale, getDefinedField, getFieldRef, getStaticValue } from './specReader';

export interface RenderDimensions {
  width: number;
  height: number;
  /** Pixels reserved for axis ticks/labels around the plot area. */
  margin?: { top: number; right: number; bottom: number; left: number };
}

const DEFAULT_MARGIN = { top: 16, right: 16, bottom: 32, left: 48 };
const DEFAULT_STROKE = '#2680EB';

const isValidNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value);

/**
 * Runs the real vega-spec-builder pipeline, then interprets the resulting spec for a single line
 * mark on a linear/time x scale and a linear y scale. See the package README for exactly which
 * spec features are read and which are ignored.
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
  if (!lineMark) throw new Error('RscNativeChart: no supported line mark found in the generated spec.');

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
