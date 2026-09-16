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
import { computeSegments, describeDonutSegment, polarToCartesian } from '../utils/geometry';
import { FONT_FAMILY } from '../theme/tokens';

export interface DonutDatum {
  label: string;
  value: number;
}

interface DonutProps {
  title?: string;
  data: DonutDatum[];
  isDark?: boolean;
  holeRatio?: number;
  aspectRatio?: number;
  colors?: string[];
}

const LEADER_GAP = 6;
const LEADER_LENGTH = 14;
const LABEL_GAP = 6;

/**
 * A donut with percentage labels *outside* the ring on their own leader
 * lines — ported from rsc-vega-mobile's `Donut.tsx`. Same reasoning as the
 * web version for why this is hand-drawn instead of using a chart library's
 * pie mark: a leader line from an arc's midpoint to an external label isn't
 * something an off-the-shelf RN chart component offers either, and the
 * geometry (`utils/geometry.ts`) is the same trig either way.
 */
export function Donut({ title, data, isDark = false, holeRatio = 0.6, aspectRatio = 0.85, colors }: DonutProps) {
  const { width, onLayout } = useElementWidth();
  const { palette } = usePalette();
  const activeColors = colors ?? palette.colors;
  const height = width > 0 ? Math.round(width * aspectRatio) : 220;

  const labelMargin = Math.max(44, Math.round(width * 0.16));
  const plotSize = Math.min(width - labelMargin * 2, height);
  const outerRadius = Math.max(plotSize / 2, 30);
  const innerRadius = outerRadius * holeRatio;
  const cx = width / 2;
  const cy = height / 2;

  const segments = width > 0 ? computeSegments(data, (d) => d.value) : [];
  const legendEntries = data.map((d, i) => ({ label: d.label, color: activeColors[i % activeColors.length] }));

  return (
    <Panel title={title} isDark={isDark}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View onLayout={onLayout} style={{ flex: 1, minWidth: 0 }}>
          {width > 0 && (
            <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
              {segments.map((seg, i) => {
                const color = activeColors[i % activeColors.length];
                const leaderStart = polarToCartesian(cx, cy, outerRadius + LEADER_GAP, seg.midAngle);
                const leaderEnd = polarToCartesian(cx, cy, outerRadius + LEADER_GAP + LEADER_LENGTH, seg.midAngle);
                const onRight = Math.sin(seg.midAngle) >= 0;
                const labelX = leaderEnd.x + (onRight ? LABEL_GAP : -LABEL_GAP);
                const pct = `${Math.round(seg.fraction * 100 * 100) / 100}%`;
                return (
                  <Fragment key={seg.datum.label}>
                    <Path d={describeDonutSegment(cx, cy, innerRadius, outerRadius, seg.startAngle, seg.endAngle)} fill={color} stroke={isDark ? '#1a1d24' : '#fff'} strokeWidth={2} />
                    <SvgLine x1={leaderStart.x} y1={leaderStart.y} x2={leaderEnd.x} y2={leaderEnd.y} stroke={isDark ? '#888' : '#aaa'} strokeWidth={1} />
                    <SvgText x={labelX} y={leaderEnd.y} textAnchor={onRight ? 'start' : 'end'} alignmentBaseline="middle" fontFamily={FONT_FAMILY} fontSize={12} fill={isDark ? '#ddd' : '#333'}>
                      {pct}
                    </SvgText>
                  </Fragment>
                );
              })}
            </Svg>
          )}
        </View>
        <View style={{ maxWidth: '38%', minWidth: 0 }}>
          <Legend entries={legendEntries} isDark={isDark} layout="right" />
        </View>
      </View>
    </Panel>
  );
}
