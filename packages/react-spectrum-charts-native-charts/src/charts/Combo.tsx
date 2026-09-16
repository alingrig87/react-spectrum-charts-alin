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
import { Fragment } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line as SvgLine, Path, Polyline, Text as SvgText } from 'react-native-svg';
import { Panel } from '../components/Panel';
import { useElementWidth } from '../hooks/useElementWidth';
import { usePalette } from '../theme/palette';
import { CORNER_RADIUS, FONT_FAMILY, grayScale } from '../theme/tokens';
import { topRoundedRectPath } from '../utils/geometry';
import { niceMax, scaleBand, scaleLinear, ticksFor } from '../utils/scale';

export interface ComboDatum {
  x: string;
  bar: number;
  line: number;
}

interface ComboProps {
  title?: string;
  data: ComboDatum[];
  barLabel?: string;
  lineLabel?: string;
  isDark?: boolean;
  barColor?: string;
  lineColor?: string;
  aspectRatio?: number;
}

const LEFT_MARGIN = 40;
const RIGHT_MARGIN = 40;
const TOP_MARGIN = 10;
const BOTTOM_MARGIN = 46;

/** Bar + line sharing one x-axis with independent left/right y-scales — RSC's alpha `<Combo>`, hand-drawn the same way as `Bar.tsx`/`Line.tsx`. */
export function Combo({ title, data, barLabel, lineLabel, isDark = false, barColor, lineColor, aspectRatio = 0.62 }: ComboProps) {
  const { width, onLayout } = useElementWidth();
  const { palette } = usePalette();
  const resolvedBarColor = barColor ?? palette.colors[0];
  const resolvedLineColor = lineColor ?? palette.colors[1];

  const barMax = niceMax(Math.max(...data.map((d) => d.bar), 1));
  const lineMax = niceMax(Math.max(...data.map((d) => d.line), 1));
  const barTicks = ticksFor(barMax, 4);
  const lineTicks = ticksFor(lineMax, 4);

  const height = width > 0 ? Math.round(width * aspectRatio) : 200;
  const plotWidth = Math.max(width - LEFT_MARGIN - RIGHT_MARGIN, 1);
  const plotHeight = Math.max(height - TOP_MARGIN - BOTTOM_MARGIN, 1);
  const barYScale = scaleLinear([0, barMax], [plotHeight, 0]);
  const lineYScale = scaleLinear([0, lineMax], [plotHeight, 0]);
  const xBand = scaleBand(data.length, [0, plotWidth]);

  // Same reasoning as Bar.tsx: derive from the shared gray scale instead of
  // independently-eyeballed hex, so this matches what the web sibling's
  // Vega axis config actually renders.
  const gray = grayScale(isDark ? 'dark' : 'light');
  const gridColor = gray[200];
  const domainColor = gray[900];
  const labelColor = gray[800];

  const linePoints = data.map((d, i) => ({ x: LEFT_MARGIN + xBand.center(i), y: TOP_MARGIN + lineYScale(d.line) }));

  return (
    <Panel title={title} isDark={isDark}>
      <View onLayout={onLayout} style={{ width: '100%' }}>
        {width > 0 && (
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            {barTicks.map((t) => (
              <SvgLine key={`grid-${t}`} x1={LEFT_MARGIN} y1={TOP_MARGIN + barYScale(t)} x2={LEFT_MARGIN + plotWidth} y2={TOP_MARGIN + barYScale(t)} stroke={gridColor} strokeWidth={1} />
            ))}
            <SvgLine x1={LEFT_MARGIN} y1={TOP_MARGIN + plotHeight} x2={LEFT_MARGIN + plotWidth} y2={TOP_MARGIN + plotHeight} stroke={domainColor} strokeWidth={1.5} />

            {data.map((d, i) => {
              const barX = LEFT_MARGIN + xBand.start(i);
              const barY = TOP_MARGIN + barYScale(d.bar);
              const barH = plotHeight - barYScale(d.bar);
              return <Path key={d.x} d={topRoundedRectPath(barX, barY, xBand.bandwidth, Math.max(barH, 0), CORNER_RADIUS)} fill={resolvedBarColor} />;
            })}

            <Polyline points={linePoints.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={resolvedLineColor} strokeWidth={2.5} />
            {linePoints.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={resolvedLineColor} />
            ))}

            {barTicks.map((t) => (
              <SvgText key={`left-${t}`} x={LEFT_MARGIN - 8} y={TOP_MARGIN + barYScale(t)} textAnchor="end" alignmentBaseline="middle" fontFamily={FONT_FAMILY} fontSize={11} fill={labelColor}>
                {t}
              </SvgText>
            ))}
            {lineTicks.map((t) => (
              <SvgText
                key={`right-${t}`}
                x={LEFT_MARGIN + plotWidth + 8}
                y={TOP_MARGIN + lineYScale(t)}
                textAnchor="start"
                alignmentBaseline="middle"
                fontFamily={FONT_FAMILY}
                fontSize={11}
                fill={resolvedLineColor}
              >
                {t}
              </SvgText>
            ))}

            {data.map((d, i) => {
              const x = LEFT_MARGIN + xBand.center(i);
              const y = TOP_MARGIN + plotHeight + 14;
              return (
                <SvgText key={d.x} x={x} y={y} textAnchor="end" fontFamily={FONT_FAMILY} fontSize={11} fill={labelColor} rotation={-40} origin={[x, y]}>
                  {d.x}
                </SvgText>
              );
            })}

            {barLabel && (
              <SvgText x={12} y={TOP_MARGIN + plotHeight / 2} textAnchor="middle" fontFamily={FONT_FAMILY} fontSize={11} fontWeight="bold" fill={labelColor} rotation={-90} origin={[12, TOP_MARGIN + plotHeight / 2]}>
                {barLabel}
              </SvgText>
            )}
            {lineLabel && (
              <SvgText
                x={width - 10}
                y={TOP_MARGIN + plotHeight / 2}
                textAnchor="middle"
                fontFamily={FONT_FAMILY}
                fontSize={11}
                fontWeight="bold"
                fill={resolvedLineColor}
                rotation={90}
                origin={[width - 10, TOP_MARGIN + plotHeight / 2]}
              >
                {lineLabel}
              </SvgText>
            )}
          </Svg>
        )}
      </View>
    </Panel>
  );
}
