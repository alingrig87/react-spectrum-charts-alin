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
import { View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { Panel } from '../components/Panel';
import { useElementWidth } from '../hooks/useElementWidth';
import { usePalette } from '../theme/palette';
import { FONT_FAMILY } from '../theme/tokens';

export interface VennSet {
  label: string;
  size: number;
}

interface VennProps {
  title?: string;
  setA: VennSet;
  setB: VennSet;
  intersection: number;
  isDark?: boolean;
  colors?: string[];
  aspectRatio?: number;
}

/**
 * A hand-placed two-circle approximation, ported from rsc-vega-mobile's
 * `Venn.tsx` — illustrative sizing only, not a proportional-overlap solver
 * (RSC's own alpha `<Venn>` computes that; nothing here or on the web side
 * reproduces its exact math, both are a reasonable visual stand-in).
 */
export function Venn({ title, setA, setB, intersection, isDark = false, colors, aspectRatio = 0.6 }: VennProps) {
  const { width, onLayout } = useElementWidth();
  const { palette } = usePalette();
  const activeColors = colors ?? palette.colors;
  const height = width > 0 ? Math.round(width * aspectRatio) : 180;

  const pxPerUnitRadius = Math.max(width, 1) * 0.09;
  const r1 = Math.sqrt(setA.size / Math.PI) * pxPerUnitRadius;
  const r2 = Math.sqrt(setB.size / Math.PI) * pxPerUnitRadius;
  const overlapFraction = Math.min(0.85, intersection / Math.min(setA.size, setB.size));
  const distance = (r1 + r2) * (1 - overlapFraction * 0.9);
  const cx = width / 2;
  const cy = height / 2;

  return (
    <Panel title={title} isDark={isDark}>
      <View onLayout={onLayout} style={{ width: '100%' }}>
        {width > 0 && (
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            <Circle cx={cx - distance / 2} cy={cy} r={r1} fill={activeColors[0]} opacity={0.6} />
            <Circle cx={cx + distance / 2} cy={cy} r={r2} fill={activeColors[1]} opacity={0.6} />
            <SvgText x={cx - distance / 2 - r1 * 0.3} y={cy - r1 - 8} textAnchor="middle" fontFamily={FONT_FAMILY} fontSize={13} fontWeight="bold" fill={isDark ? '#eee' : '#222'}>
              {setA.label}
            </SvgText>
            <SvgText x={cx + distance / 2 + r2 * 0.3} y={cy - r2 - 8} textAnchor="middle" fontFamily={FONT_FAMILY} fontSize={13} fontWeight="bold" fill={isDark ? '#eee' : '#222'}>
              {setB.label}
            </SvgText>
            <SvgText x={cx} y={cy} textAnchor="middle" alignmentBaseline="middle" fontFamily={FONT_FAMILY} fontSize={13} fontWeight="bold" fill="#fff">
              {intersection}
            </SvgText>
          </Svg>
        )}
      </View>
    </Panel>
  );
}
