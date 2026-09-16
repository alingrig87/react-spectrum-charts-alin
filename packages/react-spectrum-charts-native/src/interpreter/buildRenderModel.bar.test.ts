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
import { ChartOptions } from '@spectrum-charts/vega-spec-builder';

import { buildRenderModel } from './buildRenderModel';

const barData = [
  { category: 'A', value: 10 },
  { category: 'B', value: 20 },
  { category: 'C', value: 5 },
  { category: 'D', value: 30 },
];

const barChartOptions: ChartOptions = {
  data: barData,
  marks: [{ markType: 'bar', dimension: 'category', metric: 'value' }],
  axes: [{ position: 'bottom' }, { position: 'left' }],
};

describe('buildRenderModel (bar)', () => {
  test('produces one rect per row and both axes for a simple bar chart', () => {
    const model = buildRenderModel(barChartOptions, { width: 400, height: 200 });

    expect(model.bars).toHaveLength(barData.length);
    expect(model.line).toBeUndefined();
    expect(model.xAxis.ticks).toHaveLength(barData.length);
    expect(model.yAxis.ticks.length).toBeGreaterThan(0);
    expect(model.plot.width).toBe(400 - 48 - 16);
    expect(model.plot.height).toBe(200 - 16 - 32);
  });

  test('every bar has a positive width and stays within the plot area', () => {
    const model = buildRenderModel(barChartOptions, { width: 400, height: 200 });

    for (const bar of model.bars ?? []) {
      expect(bar.width).toBeGreaterThan(0);
      expect(bar.x).toBeGreaterThanOrEqual(0);
      expect(bar.x + bar.width).toBeLessThanOrEqual(model.plot.width + 0.01);
      expect(bar.fill).toBeTruthy();
    }
  });

  test('a taller value produces a taller bar (zero-baseline scale)', () => {
    const model = buildRenderModel(barChartOptions, { width: 400, height: 200 });
    const bars = model.bars ?? [];

    // category order matches barData order: value 30 (index 3) should render taller than value 5 (index 2)
    expect(bars[3].height).toBeGreaterThan(bars[2].height);
  });

  test('bars sit above the x-axis baseline (SVG y grows downward)', () => {
    const model = buildRenderModel(barChartOptions, { width: 400, height: 200 });
    for (const bar of model.bars ?? []) {
      expect(bar.y + bar.height).toBeLessThanOrEqual(model.plot.height + 0.01);
    }
  });

  test('renders no bars rather than throwing when there is no data', () => {
    const emptyOptions: ChartOptions = {
      data: [],
      marks: [{ markType: 'bar', dimension: 'category', metric: 'value' }],
      axes: [{ position: 'bottom' }, { position: 'left' }],
    };
    const model = buildRenderModel(emptyOptions, { width: 200, height: 100 });
    expect(model.bars).toEqual([]);
  });

  test('throws when a category has more than one row (stacked/grouped bars)', () => {
    const stackedOptions: ChartOptions = {
      data: [
        { category: 'A', value: 10 },
        { category: 'A', value: 5 },
      ],
      marks: [{ markType: 'bar', dimension: 'category', metric: 'value' }],
      axes: [{ position: 'bottom' }, { position: 'left' }],
    };
    expect(() => buildRenderModel(stackedOptions, { width: 200, height: 100 })).toThrow(
      /single-series bar chart/
    );
  });

  test('throws for a dodged bar mark, which nests its rects inside a facet group', () => {
    const dodgedOptions: ChartOptions = {
      data: barData,
      marks: [{ markType: 'bar', dimension: 'category', metric: 'value', type: 'dodged' }],
      axes: [{ position: 'bottom' }, { position: 'left' }],
    };
    expect(() => buildRenderModel(dodgedOptions, { width: 200, height: 100 })).toThrow(
      /no supported line or bar mark/
    );
  });
});
