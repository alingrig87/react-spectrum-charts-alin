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
import Svg, { Line as SvgLine, Path, Polyline, Text as SvgText } from 'react-native-svg';
import { Panel } from '../components/Panel';
import { Legend } from '../components/Legend';
import { useElementWidth } from '../hooks/useElementWidth';
import { usePalette } from '../theme/palette';
import { FONT_FAMILY, grayScale } from '../theme/tokens';
import { niceMax, scaleLinear, ticksFor } from '../utils/scale';

export interface SeriesDatum {
  x: string;
  y: number;
  series: string;
}

interface LineProps {
  title?: string;
  data: SeriesDatum[];
  yLabel?: string;
  isDark?: boolean;
  colors?: string[];
  /** Stacks a filled area under each series (`stack: 'zero'`, same convention as the web project's filled variant) instead of drawing independent lines. */
  filled?: boolean;
  aspectRatio?: number;
}

const LEFT_MARGIN = 40;
const RIGHT_MARGIN = 10;
const TOP_MARGIN = 10;
const BOTTOM_MARGIN = 46;

function pointX(index: number, count: number, plotWidth: number): number {
  if (count <= 1) return plotWidth / 2;
  return (index / (count - 1)) * plotWidth;
}

/** Hand-drawn line/stacked-area chart, same margin/axis conventions as `Bar.tsx` so the two read as one family. */
export function Line({ title, data, yLabel, isDark = false, colors, filled = false, aspectRatio = 0.62 }: LineProps) {
  const { width, onLayout } = useElementWidth();
  const { palette } = usePalette();
  const activeColors = colors ?? palette.colors;

  const categories = [...new Set(data.map((d) => d.x))];
  const seriesList = [...new Set(data.map((d) => d.series))];

  const maxValue = filled
    ? Math.max(...categories.map((x) => data.filter((d) => d.x === x).reduce((sum, d) => sum + d.y, 0)), 1)
    : Math.max(...data.map((d) => d.y), 1);
  const yMax = niceMax(maxValue);
  const ticks = ticksFor(yMax, 4);

  const height = width > 0 ? Math.round(width * aspectRatio) : 200;
  const plotWidth = Math.max(width - LEFT_MARGIN - RIGHT_MARGIN, 1);
  const plotHeight = Math.max(height - TOP_MARGIN - BOTTOM_MARGIN, 1);
  const yScale = scaleLinear([0, yMax], [plotHeight, 0]);

  // Same reasoning as Bar.tsx: derive from the shared gray scale instead of
  // independently-eyeballed hex, so this matches what the web sibling's
  // Vega axis config actually renders.
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

            {filled
              ? seriesList.map((series, si) => {
                  const color = activeColors[si % activeColors.length];
                  const topPts: string[] = [];
                  const bottomPts: string[] = [];
                  categories.forEach((cat, ci) => {
                    let bottom = 0;
                    for (let j = 0; j < si; j++) {
                      bottom += data.find((d) => d.x === cat && d.series === seriesList[j])?.y ?? 0;
                    }
                    const value = data.find((d) => d.x === cat && d.series === series)?.y ?? 0;
                    const top = bottom + value;
                    const x = LEFT_MARGIN + pointX(ci, categories.length, plotWidth);
                    topPts.push(`${x},${TOP_MARGIN + yScale(top)}`);
                    bottomPts.unshift(`${x},${TOP_MARGIN + yScale(bottom)}`);
                  });
                  const d = `M ${topPts.join(' L ')} L ${bottomPts.join(' L ')} Z`;
                  // The area fill plus a top-edge stroke line — matches
                  // rsc-mobile's `mark: { type: 'area', line: true }` (the
                  // shared spectrumVegaTheme.ts `line.strokeWidth`, 2, since
                  // the spec doesn't override it), not just a plain fill.
                  return (
                    <Fragment key={series}>
                      <Path d={d} fill={color} opacity={0.8} />
                      <Polyline points={topPts.join(' ')} fill="none" stroke={color} strokeWidth={2} />
                    </Fragment>
                  );
                })
              : seriesList.map((series, si) => {
                  const color = activeColors[si % activeColors.length];
                  const pts = categories.map((cat, ci) => {
                    const value = data.find((d) => d.x === cat && d.series === series)?.y ?? 0;
                    const x = LEFT_MARGIN + pointX(ci, categories.length, plotWidth);
                    const y = TOP_MARGIN + yScale(value);
                    return { x, y };
                  });
                  // No per-point markers, strokeWidth 2 (not 2.5) — matches
                  // rsc-mobile's plain `mark: 'line'` (no `point: true`),
                  // which renders with the shared config's `line.strokeWidth`
                  // default. Combo.tsx's line layer explicitly sets
                  // `point: true` + `strokeWidth: 2.5` on the web side, so
                  // its markers/thicker stroke stay — this is Line-only.
                  return <Polyline key={series} points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={color} strokeWidth={2} />;
                })}

            {categories.map((cat, i) => {
              const x = LEFT_MARGIN + pointX(i, categories.length, plotWidth);
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
      <View style={{ marginTop: 10 }}>
        <Legend entries={legendEntries} layout="bottom" isDark={isDark} />
      </View>
    </Panel>
  );
}
