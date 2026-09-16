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
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line as SvgLine, Text as SvgText } from 'react-native-svg';
import { Panel } from '../components/Panel';
import { Legend } from '../components/Legend';
import { useElementWidth } from '../hooks/useElementWidth';
import { useOrientation } from '../hooks/useOrientation';
import { usePalette } from '../theme/palette';
import { FONT_FAMILY, grayScale } from '../theme/tokens';
import { niceMax, scaleLinear, ticksFor } from '../utils/scale';

// matches rsc-mobile's Scatter buildScatterSpec `mark: { size: 130 }` — Vega
// point-mark `size` is the marker's area in px², so the on-screen radius is
// derived the same way Vega itself renders a circular point mark.
const POINT_MARK_SIZE = 130;
const POINT_RADIUS = Math.sqrt(POINT_MARK_SIZE / Math.PI);

export interface ScatterPoint {
  x: number;
  y: number;
  series: string;
}

interface ScatterProps {
  title?: string;
  data: ScatterPoint[];
  xLabel?: string;
  yLabel?: string;
  isDark?: boolean;
  colors?: string[];
}

const LEFT_MARGIN = 40;
const RIGHT_MARGIN = 14;
const TOP_MARGIN = 10;
const BOTTOM_MARGIN = 34;

/**
 * Hand-drawn scatter plot. Widens noticeably in landscape via
 * `useOrientation()` — a spread/correlation plot genuinely reads better
 * wide, the same reasoning the web project's Scatter used, just driven by
 * RN's own live `useWindowDimensions` instead of a `matchMedia` listener.
 */
export function Scatter({ title, data, xLabel, yLabel, isDark = false, colors }: ScatterProps) {
  const { width, onLayout } = useElementWidth();
  const { palette } = usePalette();
  const activeColors = colors ?? palette.colors;
  const orientation = useOrientation();
  const aspectRatio = orientation === 'landscape' ? 0.45 : 0.85;

  const seriesList = [...new Set(data.map((d) => d.series))];
  const xMax = niceMax(Math.max(...data.map((d) => d.x), 1));
  const yMax = niceMax(Math.max(...data.map((d) => d.y), 1));
  const xTicks = ticksFor(xMax, 4);
  const yTicks = ticksFor(yMax, 4);

  const height = width > 0 ? Math.round(width * aspectRatio) : 200;
  const plotWidth = Math.max(width - LEFT_MARGIN - RIGHT_MARGIN, 1);
  const plotHeight = Math.max(height - TOP_MARGIN - BOTTOM_MARGIN, 1);
  const xScale = scaleLinear([0, xMax], [0, plotWidth]);
  const yScale = scaleLinear([0, yMax], [plotHeight, 0]);

  const gray = grayScale(isDark ? 'dark' : 'light');
  const gridColor = gray[200];
  const domainColor = gray[900];
  const labelColor = gray[800];
  const legendEntries = seriesList.map((s, i) => ({ label: s, color: activeColors[i % activeColors.length] }));

  return (
    <Panel isDark={isDark}>
      <View style={styles.header}>
        {title && <Text style={[styles.title, { color: isDark ? '#eee' : '#3a2f1c' }]}>{title}</Text>}
        {orientation === 'portrait' && <Text style={[styles.hint, { color: isDark ? '#8ab4f8' : '#1864ab' }]}>↻ Rotate for a wider view</Text>}
      </View>
      <View onLayout={onLayout} style={{ width: '100%' }}>
        {width > 0 && (
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            {yTicks.map((t) => {
              const y = TOP_MARGIN + yScale(t);
              return (
                <Fragment key={`y-${t}`}>
                  <SvgLine x1={LEFT_MARGIN} y1={y} x2={LEFT_MARGIN + plotWidth} y2={y} stroke={gridColor} strokeWidth={1} />
                  <SvgText x={LEFT_MARGIN - 8} y={y} textAnchor="end" alignmentBaseline="middle" fontFamily={FONT_FAMILY} fontSize={11} fill={labelColor}>
                    {t}
                  </SvgText>
                </Fragment>
              );
            })}
            <SvgLine x1={LEFT_MARGIN} y1={TOP_MARGIN} x2={LEFT_MARGIN} y2={TOP_MARGIN + plotHeight} stroke={domainColor} strokeWidth={1.5} />
            <SvgLine x1={LEFT_MARGIN} y1={TOP_MARGIN + plotHeight} x2={LEFT_MARGIN + plotWidth} y2={TOP_MARGIN + plotHeight} stroke={domainColor} strokeWidth={1.5} />
            {xTicks.map((t) => {
              const x = LEFT_MARGIN + xScale(t);
              return (
                <SvgText key={`x-${t}`} x={x} y={TOP_MARGIN + plotHeight + 16} textAnchor="middle" fontFamily={FONT_FAMILY} fontSize={11} fill={labelColor}>
                  {t}
                </SvgText>
              );
            })}

            {data.map((d, i) => {
              const si = seriesList.indexOf(d.series);
              return <Circle key={i} cx={LEFT_MARGIN + xScale(d.x)} cy={TOP_MARGIN + yScale(d.y)} r={POINT_RADIUS} fill={activeColors[si % activeColors.length]} />;
            })}

            {xLabel && (
              <SvgText x={LEFT_MARGIN + plotWidth / 2} y={height - 4} textAnchor="middle" fontFamily={FONT_FAMILY} fontSize={11} fontWeight="bold" fill={labelColor}>
                {xLabel}
              </SvgText>
            )}
            {yLabel && (
              <SvgText x={12} y={TOP_MARGIN + plotHeight / 2} textAnchor="middle" fontFamily={FONT_FAMILY} fontSize={11} fontWeight="bold" fill={labelColor} rotation={-90} origin={[12, TOP_MARGIN + plotHeight / 2]}>
                {yLabel}
              </SvgText>
            )}
          </Svg>
        )}
      </View>
      <View style={{ marginTop: 10 }}>
        <Legend entries={legendEntries} layout="bottom" isDark={isDark} />
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 6 },
  title: { fontSize: 15, fontWeight: '600' },
  hint: { fontSize: 12, fontWeight: '600' },
});
