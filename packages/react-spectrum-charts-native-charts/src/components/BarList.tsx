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

export interface BarListEntry {
  label: string;
  value: number;
  /** A second value drawn as a fainter paired bar behind/above the first — "current vs. previous", not a ranking. */
  previousValue?: number;
  color?: string;
}

interface BarListProps {
  entries: BarListEntry[];
  isDark?: boolean;
  previousColor?: string;
  /** `'end'` — value printed just past the bar's tip, colored to match it. `'none'` — no value text, bar length is the only cue. */
  valueStyle?: 'end' | 'none';
  format?: (value: number) => string;
  barHeight?: number;
}

const DEFAULT_PREVIOUS_COLOR = 'rgb(200, 200, 200)';

/** A horizontal bar list in plain RN Views — percentage-width bars need no chart engine at all, ported from rsc-vega-mobile's CSS version of the same widget. */
export function BarList({ entries, isDark = false, previousColor = DEFAULT_PREVIOUS_COLOR, valueStyle = 'end', format = (v) => v.toLocaleString(), barHeight = 20 }: BarListProps) {
  const max = Math.max(...entries.map((e) => Math.max(e.value, e.previousValue ?? 0)), 1);
  const hasComparison = entries.some((e) => e.previousValue !== undefined);

  return (
    <View style={{ gap: hasComparison ? 10 : 8 }}>
      {entries.map((entry) => {
        const color = entry.color ?? 'rgb(15, 181, 174)';
        const widthPct = (entry.value / max) * 100;
        const prevWidthPct = entry.previousValue !== undefined ? (entry.previousValue / max) * 100 : null;
        return (
          <View key={entry.label} style={styles.row}>
            <Text style={[styles.label, { color: isDark ? '#ccc' : '#333' }]} numberOfLines={1} ellipsizeMode="tail">
              {entry.label}
            </Text>
            <View style={styles.bars}>
              <Bar widthPct={widthPct} color={color} height={barHeight} valueText={valueStyle === 'end' ? format(entry.value) : undefined} valueColor={color} />
              {prevWidthPct !== null && <Bar widthPct={prevWidthPct} color={previousColor} height={Math.round(barHeight * 0.6)} />}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Bar({ widthPct, color, height, valueText, valueColor }: { widthPct: number; color: string; height: number; valueText?: string; valueColor?: string }) {
  return (
    <View style={styles.barRow}>
      <View style={{ width: `${Math.max(widthPct, 2)}%`, height, minWidth: 4, backgroundColor: color, borderRadius: height / 2 }} />
      {valueText && <Text style={[styles.value, { color: valueColor }]}>{valueText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { width: 76, fontSize: 11, textAlign: 'right' },
  bars: { flex: 1, gap: 3, minWidth: 0 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  value: { fontSize: 11, fontWeight: '700' },
});
