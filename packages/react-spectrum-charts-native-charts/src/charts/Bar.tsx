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
import Svg, { Line as SvgLine, Path, Text as SvgText } from 'react-native-svg';
import { Panel } from '../components/Panel';
import { Legend } from '../components/Legend';
import { useElementWidth } from '../hooks/useElementWidth';
import { usePalette } from '../theme/palette';
import { CORNER_RADIUS, FONT_FAMILY, grayScale } from '../theme/tokens';
import { topRoundedRectPath } from '../utils/geometry';
import { niceMax, scaleBand, scaleLinear, ticksFor } from '../utils/scale';

export interface BarDatum {
  category: string;
  value: number;
  series?: string;
}

interface BarProps {
  title?: string;
  data: BarDatum[];
  /** `'simple'` — one bar per category. `'dodged'` — grouped bars, needs `series`. `'stacked'` — stacked bars, needs `series`. */
  type?: 'simple' | 'dodged' | 'stacked';
  yLabel?: string;
  isDark?: boolean;
  colors?: string[];
  aspectRatio?: number;
}

const LEFT_MARGIN = 40;
const RIGHT_MARGIN = 10;
const TOP_MARGIN = 10;
const BOTTOM_MARGIN = 46;

/**
 * Hand-drawn bar/dodged-bar/stacked-bar chart — react-native-svg has no
 * "band scale + axis" chart mark to reach for the way Vega-Lite did on the
 * web side, so `utils/scale.ts`'s band/linear scales stand in for that, and
 * axis gridlines/ticks/labels are drawn directly instead of coming from a
 * chart-engine config.
 */
export function Bar({ title, data, type = 'simple', yLabel, isDark = false, colors, aspectRatio = 0.62 }: BarProps) {
  const { width, onLayout } = useElementWidth();
  const { palette } = usePalette();
  const activeColors = colors ?? palette.colors;

  const categories = [...new Set(data.map((d) => d.category))];
  const seriesList = type === 'simple' ? [] : [...new Set(data.map((d) => d.series))].filter((s): s is string => !!s);

  const maxValue =
    type === 'stacked'
      ? Math.max(...categories.map((c) => data.filter((d) => d.category === c).reduce((sum, d) => sum + d.value, 0)), 1)
      : Math.max(...data.map((d) => d.value), 1);
  const yMax = niceMax(maxValue);
  const ticks = ticksFor(yMax, 4);

  const height = width > 0 ? Math.round(width * aspectRatio) : 200;
  const plotWidth = Math.max(width - LEFT_MARGIN - RIGHT_MARGIN, 1);
  const plotHeight = Math.max(height - TOP_MARGIN - BOTTOM_MARGIN, 1);
  const yScale = scaleLinear([0, yMax], [plotHeight, 0]);
  const xBand = scaleBand(categories.length, [0, plotWidth]);

  // Matches spectrumVegaTheme.ts's axis config (gridColor: gray-200,
  // domainColor: gray-900, labelColor: gray-800) — same gray scale the web
  // sibling's Vega axis actually renders with, not independently eyeballed.
  const gray = grayScale(isDark ? 'dark' : 'light');
  const gridColor = gray[200];
  const domainColor = gray[900];
  const labelColor = gray[800];

  const legendEntries = seriesList.map((s, i) => ({ label: s, color: activeColors[i % activeColors.length] }));

  return (
    <Panel title={title} isDark={isDark}>
      <View onLayout={onLayout} style={{ width: '100%' }}>
        {width > 0 && (
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            {ticks.map((t) => {
              const y = TOP_MARGIN + yScale(t);
              return (
                <Fragment key={t}>
                  <SvgLine x1={LEFT_MARGIN} y1={y} x2={LEFT_MARGIN + plotWidth} y2={y} stroke={gridColor} strokeWidth={1} />
                  <SvgText x={LEFT_MARGIN - 8} y={y} textAnchor="end" alignmentBaseline="middle" fontFamily={FONT_FAMILY} fontSize={11} fill={labelColor}>
                    {t}
                  </SvgText>
                </Fragment>
              );
            })}
            <SvgLine x1={LEFT_MARGIN} y1={TOP_MARGIN + plotHeight} x2={LEFT_MARGIN + plotWidth} y2={TOP_MARGIN + plotHeight} stroke={domainColor} strokeWidth={1.5} />

            {type === 'simple' &&
              categories.map((cat, i) => {
                const d = data.find((d) => d.category === cat);
                const value = d?.value ?? 0;
                const barX = LEFT_MARGIN + xBand.start(i);
                const barY = TOP_MARGIN + yScale(value);
                const barH = plotHeight - yScale(value);
                return <Path key={cat} d={topRoundedRectPath(barX, barY, xBand.bandwidth, Math.max(barH, 0), CORNER_RADIUS)} fill={activeColors[0]} />;
              })}

            {type === 'dodged' &&
              categories.map((cat, ci) => {
                const subBand = scaleBand(seriesList.length, [0, xBand.bandwidth], 0.15, 0);
                return seriesList.map((series, si) => {
                  const d = data.find((d) => d.category === cat && d.series === series);
                  const value = d?.value ?? 0;
                  const barX = LEFT_MARGIN + xBand.start(ci) + subBand.start(si);
                  const barY = TOP_MARGIN + yScale(value);
                  const barH = plotHeight - yScale(value);
                  return <Path key={`${cat}-${series}`} d={topRoundedRectPath(barX, barY, subBand.bandwidth, Math.max(barH, 0), CORNER_RADIUS)} fill={activeColors[si % activeColors.length]} />;
                });
              })}

            {type === 'stacked' &&
              categories.map((cat, ci) => {
                let cumulative = 0;
                return seriesList.map((series, si) => {
                  const d = data.find((d) => d.category === cat && d.series === series);
                  const value = d?.value ?? 0;
                  const segTop = cumulative + value;
                  const barX = LEFT_MARGIN + xBand.start(ci);
                  const barY = TOP_MARGIN + yScale(segTop);
                  const barH = yScale(cumulative) - yScale(segTop);
                  cumulative = segTop;
                  // Only the topmost segment of each stack is rounded — matches
                  // real RSC's per-segment `getStackedCornerRadiusEncodings`
                  // conditional, not spectrumVegaTheme.ts's blanket
                  // `bar.cornerRadiusTopLeft/TopRight` (which rounds every
                  // segment on the web sibling too; that's a known deviation
                  // from canonical RSC there, left untouched in this repo).
                  const isTopSegment = si === seriesList.length - 1;
                  return (
                    <Path
                      key={`${cat}-${series}`}
                      d={topRoundedRectPath(barX, barY, xBand.bandwidth, Math.max(barH, 0), isTopSegment ? CORNER_RADIUS : 0)}
                      fill={activeColors[si % activeColors.length]}
                    />
                  );
                });
              })}

            {categories.map((cat, i) => {
              const x = LEFT_MARGIN + xBand.center(i);
              const y = TOP_MARGIN + plotHeight + 14;
              return (
                <SvgText key={cat} x={x} y={y} textAnchor="end" fontFamily={FONT_FAMILY} fontSize={11} fill={labelColor} rotation={-40} origin={[x, y]}>
                  {cat}
                </SvgText>
              );
            })}

            {yLabel && (
              <SvgText x={12} y={TOP_MARGIN + plotHeight / 2} textAnchor="middle" fontFamily={FONT_FAMILY} fontSize={11} fontWeight="bold" fill={labelColor} rotation={-90} origin={[12, TOP_MARGIN + plotHeight / 2]}>
                {yLabel}
              </SvgText>
            )}
          </Svg>
        )}
      </View>
      {seriesList.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Legend entries={legendEntries} layout="bottom" isDark={isDark} />
        </View>
      )}
    </Panel>
  );
}
