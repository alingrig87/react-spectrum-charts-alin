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
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Panel } from '../components/Panel';
import { useElementWidth } from '../hooks/useElementWidth';
import { usePalette } from '../theme/palette';
import { smoothLinePath } from '../utils/geometry';
import { scaleLinear } from '../utils/scale';

interface BigNumberProps {
  label: string;
  value: string;
  isDark?: boolean;
  color?: string;
  trend?: { x: string; y: number }[];
}

/** RSC's `<BigNumber>` isn't a chart mark either — a styled number/label with an optional sparkline. Matches that split: plain RN Text for the number, a small hand-drawn sparkline for the trend (no axis — it's decoration, not something meant to be read precisely). */
export function BigNumber({ label, value, isDark = false, color, trend }: BigNumberProps) {
  const { palette } = usePalette();
  const resolvedColor = color ?? palette.colors[0];
  const { width, onLayout } = useElementWidth();
  const height = 46;

  // No area fill, no per-point markers — matches rsc-mobile's
  // buildSparklineSpec (`mark: { type: 'line', point: false }`, no `area`),
  // which is a plain smoothed line, not a filled sparkline. `interpolate:
  // 'monotone'` there is why this uses `smoothLinePath` instead of a
  // straight-segment Polyline.
  let lineD = '';
  if (trend && trend.length > 0 && width > 0) {
    const min = Math.min(...trend.map((d) => d.y));
    const max = Math.max(...trend.map((d) => d.y), min + 1);
    const yScale = scaleLinear([min, max], [height - 4, 4]);
    const pts = trend.map((d, i) => ({ x: trend.length > 1 ? (i / (trend.length - 1)) * width : width / 2, y: yScale(d.y) }));
    lineD = smoothLinePath(pts);
  }

  return (
    <Panel isDark={isDark}>
      <Text style={[styles.label, { color: isDark ? '#999' : '#666' }]}>{label}</Text>
      <Text style={[styles.value, { color: isDark ? '#eee' : '#1a1a2e' }]}>{value}</Text>
      {trend && (
        <View onLayout={onLayout} style={{ marginTop: 8, width: '100%' }}>
          {width > 0 && (
            <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
              <Path d={lineD} fill="none" stroke={resolvedColor} strokeWidth={2.5} />
            </Svg>
          )}
        </View>
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, marginBottom: 4 },
  value: { fontSize: 30, fontWeight: '700' },
});
