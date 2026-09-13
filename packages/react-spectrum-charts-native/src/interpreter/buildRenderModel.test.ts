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

const timeData = [
  { datetime: '2023-01-01', value: 10 },
  { datetime: '2023-01-02', value: 20 },
  { datetime: '2023-01-03', value: 5 },
  { datetime: '2023-01-04', value: 30 },
];

const timeChartOptions: ChartOptions = {
  data: timeData,
  marks: [{ markType: 'line', dimension: 'datetime', metric: 'value', scaleType: 'time' }],
  axes: [
    { position: 'bottom', labelFormat: 'time' },
    { position: 'left' },
  ],
};

describe('buildRenderModel', () => {
  test('produces a line path and both axes for a time-scale line chart', () => {
    const model = buildRenderModel(timeChartOptions, { width: 400, height: 200 });

    expect(model.line.path.startsWith('M')).toBe(true);
    expect(model.line.strokeWidth).toBeGreaterThan(0);
    expect(model.xAxis.ticks.length).toBeGreaterThan(0);
    expect(model.yAxis.ticks.length).toBeGreaterThan(0);
    expect(model.plot.width).toBe(400 - 48 - 16);
    expect(model.plot.height).toBe(200 - 16 - 32);
  });

  test('supports a linear x scale', () => {
    const linearOptions: ChartOptions = {
      data: [
        { index: 0, value: 1 },
        { index: 1, value: 4 },
        { index: 2, value: 2 },
      ],
      marks: [{ markType: 'line', dimension: 'index', metric: 'value', scaleType: 'linear' }],
      axes: [{ position: 'bottom' }, { position: 'left' }],
    };

    const model = buildRenderModel(linearOptions, { width: 300, height: 150 });
    expect(model.line.path.startsWith('M')).toBe(true);
  });

  test('y pixel positions decrease as the metric value increases (SVG y grows downward)', () => {
    const model = buildRenderModel(timeChartOptions, { width: 400, height: 200 });
    const sortedTicks = [...model.yAxis.ticks].sort((a, b) => a.position - b.position);
    // the tick nearest the top of the plot should label a larger value than the one nearest the bottom
    const topLabel = Number(sortedTicks[0].label.replace(/[^\d.-]/g, ''));
    const bottomLabel = Number(sortedTicks[sortedTicks.length - 1].label.replace(/[^\d.-]/g, ''));
    expect(topLabel).toBeGreaterThan(bottomLabel);
  });

  test('renders an empty path rather than throwing when there is no data', () => {
    const emptyOptions: ChartOptions = {
      data: [],
      marks: [{ markType: 'line', dimension: 'datetime', metric: 'value', scaleType: 'time' }],
      axes: [{ position: 'bottom' }, { position: 'left' }],
    };
    const model = buildRenderModel(emptyOptions, { width: 200, height: 100 });
    expect(model.line.path).toBe('');
  });
});
