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
import { ReactElement, useMemo } from 'react';
import { G, Line as SvgLine, Path, Rect, Svg, Text as SvgText } from 'react-native-svg';

import { ChartOptions } from '@spectrum-charts/vega-spec-builder';

import { RenderDimensions, buildRenderModel } from './interpreter/buildRenderModel';
import { RenderAxis } from './types';

export interface RscNativeChartProps {
  /** The same ChartOptions shape `buildSpec` from `@spectrum-charts/vega-spec-builder` takes. */
  chartOptions: ChartOptions;
  width: number;
  height: number;
  margin?: RenderDimensions['margin'];
}

/**
 * Renders a single line or bar mark + two axes natively via react-native-svg. See README for spec
 * coverage.
 */
export const RscNativeChart = ({ chartOptions, width, height, margin }: RscNativeChartProps): ReactElement => {
  const model = useMemo(
    () => buildRenderModel(chartOptions, { width, height, margin }),
    [chartOptions, width, height, margin]
  );

  return (
    <Svg width={model.width} height={model.height}>
      <G x={model.plot.x} y={model.plot.y}>
        <AxisGroup axis={model.xAxis} plotWidth={model.plot.width} plotHeight={model.plot.height} />
        <AxisGroup axis={model.yAxis} plotWidth={model.plot.width} plotHeight={model.plot.height} />
        {model.line && (
          <Path
            d={model.line.path}
            stroke={model.line.stroke}
            strokeWidth={model.line.strokeWidth}
            strokeDasharray={model.line.strokeDasharray}
            fill="none"
          />
        )}
        {model.bars?.map((bar) => (
          <Rect key={bar.x} x={bar.x} y={bar.y} width={bar.width} height={bar.height} fill={bar.fill} />
        ))}
      </G>
    </Svg>
  );
};

interface AxisGroupProps {
  axis: RenderAxis;
  plotWidth: number;
  plotHeight: number;
}

/** Draws one axis's baseline, ticks, and labels from already-computed pixel positions. */
const AxisGroup = ({ axis, plotWidth, plotHeight }: AxisGroupProps): ReactElement => {
  const isBottom = axis.orient === 'bottom';
  return (
    <G>
      <SvgLine
        x1={isBottom ? 0 : axis.axisLinePosition}
        y1={isBottom ? axis.axisLinePosition : 0}
        x2={isBottom ? plotWidth : axis.axisLinePosition}
        y2={isBottom ? axis.axisLinePosition : plotHeight}
        stroke="#B3B3B3"
        strokeWidth={1}
      />
      {axis.ticks.map((tick) => (
        <SvgText
          key={`${axis.orient}-${tick.position}-${tick.label}`}
          x={isBottom ? tick.position : axis.axisLinePosition - 8}
          y={isBottom ? axis.axisLinePosition + 16 : tick.position}
          fontSize={11}
          fill="#4B4B4B"
          textAnchor={isBottom ? 'middle' : 'end'}
        >
          {tick.label}
        </SvgText>
      ))}
    </G>
  );
};
