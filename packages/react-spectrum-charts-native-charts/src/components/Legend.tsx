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

export interface LegendEntry {
  label: string;
  color: string;
}

interface LegendProps {
  entries: LegendEntry[];
  isDark?: boolean;
  /** `'right'` — a vertical stacked list, meant to sit beside a ring. `'bottom'` — a wrapped row of chips, meant to sit under a chart. */
  layout?: 'right' | 'bottom';
}

/** Plain RN View/Text legend — ported from rsc-vega-mobile's `Legend.tsx`, which was itself deliberately plain HTML/CSS instead of a chart-engine-drawn legend for the same reason this whole repo hand-rolls chart geometry: a caller-reserved width is respected reliably by a real layout, not by an engine guessing how much room its own labels need. */
export function Legend({ entries, isDark = false, layout = 'right' }: LegendProps) {
  const textColor = isDark ? '#ccc' : '#333';
  if (layout === 'right') {
    return (
      <View style={styles.columnList}>
        {entries.map((entry) => (
          <View key={entry.label} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: entry.color }]} />
            <Text style={[styles.label, { color: textColor }]} numberOfLines={1} ellipsizeMode="tail">
              {entry.label}
            </Text>
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={styles.wrapRow}>
      {entries.map((entry) => (
        <View key={entry.label} style={styles.chip}>
          <View style={[styles.dot, { backgroundColor: entry.color }]} />
          <Text style={[styles.label, { color: textColor }]}>{entry.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  columnList: { flexDirection: 'column', gap: 8 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 14, rowGap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  label: { fontSize: 12, flexShrink: 1 },
});
