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
import Svg, { Circle, Line as SvgLine, Path, Text as SvgText } from 'react-native-svg';
import { Panel } from '../components/Panel';
import { useElementWidth } from '../hooks/useElementWidth';
import { usePalette } from '../theme/palette';
import { FONT_FAMILY } from '../theme/tokens';

export interface FunnelStage {
  label: string;
  value: number;
}

interface FunnelProps {
  title?: string;
  data: FunnelStage[];
  isDark?: boolean;
  colors?: string[];
  format?: (value: number) => string;
  aspectRatio?: number;
}

/**
 * A smooth continuous taper — trapezoid bands stitched stage-to-stage — with
 * the value inside each band and a conversion-rate badge on a leader line
 * outside it. Ported from rsc-vega-mobile's `Funnel.tsx`; no RN chart
 * library ships a funnel mark either, so this is the same hand-drawn SVG.
 */
export function Funnel({ title, data, isDark = false, colors, format = (v) => v.toLocaleString(), aspectRatio = 0.95 }: FunnelProps) {
  const { width, onLayout } = useElementWidth();
  const { palette } = usePalette();
  const activeColors = colors ?? palette.colors;

  const labelColumn = Math.max(70, Math.round(width * 0.22));
  const plotWidth = Math.max(width - labelColumn, 40);
  const height = width > 0 ? Math.round(width * aspectRatio) : 260;
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const stageHeight = height / data.length;
  const maxBandWidth = plotWidth * 0.94;

  // The floor keeps the narrowest bands wide enough to actually contain
  // their own label text. At the old 0.12 floor, the last stage or two
  // could taper narrower than "Purchases"/"Renewals" needs — since the
  // label is plain white text with no independent background, whatever
  // part of it fell outside the band's slanted edge landed directly on the
  // page background instead and, being white-on-light, was effectively
  // invisible (not actually clipped, just unreadable) — easy to miss in a
  // quick look but confirmed by inspecting the rendered glyph position.
  const widthFor = (value: number) => Math.max((value / maxValue) * maxBandWidth, maxBandWidth * 0.42);

  return (
    <Panel title={title} isDark={isDark}>
      <View onLayout={onLayout} style={{ width: '100%' }}>
        {width > 0 && (
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            {data.map((stage, i) => {
              const color = activeColors[i % activeColors.length];
              const topWidth = widthFor(stage.value);
              const nextValue = i < data.length - 1 ? data[i + 1].value : stage.value * 0.72;
              const bottomWidth = widthFor(nextValue);
              const yTop = i * stageHeight;
              const yBottom = yTop + stageHeight;
              const cx = plotWidth / 2;
              const path = [
                `M ${cx - topWidth / 2} ${yTop}`,
                `L ${cx + topWidth / 2} ${yTop}`,
                `L ${cx + bottomWidth / 2} ${yBottom}`,
                `L ${cx - bottomWidth / 2} ${yBottom}`,
                'Z',
              ].join(' ');
              const midY = yTop + stageHeight / 2;
              const pct = i === 0 ? 100 : Math.round((stage.value / data[0].value) * 1000) / 10;
              const leaderStart = { x: cx + Math.max(topWidth, bottomWidth) / 2, y: midY };
              const leaderBend = { x: plotWidth + 10, y: midY };
              return (
                <Fragment key={stage.label}>
                  <Path d={path} fill={color} />
                  <SvgText x={cx} y={midY - 6} textAnchor="middle" fontFamily={FONT_FAMILY} fontSize={12} fontWeight="bold" fill="#fff">
                    {format(stage.value)}
                  </SvgText>
                  <SvgText x={cx} y={midY + 10} textAnchor="middle" fontFamily={FONT_FAMILY} fontSize={10} fill="rgba(255,255,255,0.85)">
                    {stage.label}
                  </SvgText>
                  <SvgLine x1={leaderStart.x} y1={leaderStart.y} x2={leaderBend.x} y2={leaderBend.y} stroke={isDark ? '#888' : '#aaa'} strokeWidth={1} />
                  <Circle cx={leaderBend.x} cy={leaderBend.y} r={2.5} fill={isDark ? '#888' : '#aaa'} />
                  <SvgText x={leaderBend.x + 8} y={leaderBend.y} textAnchor="start" alignmentBaseline="middle" fontFamily={FONT_FAMILY} fontSize={12} fill={isDark ? '#ddd' : '#333'}>
                    {pct}%
                  </SvgText>
                </Fragment>
              );
            })}
          </Svg>
        )}
      </View>
    </Panel>
  );
}
