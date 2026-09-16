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
import { Panel } from '../components/Panel';
import { usePalette } from '../theme/palette';

export interface BulletDatum {
  category: string;
  current: number;
  target: number;
}

interface BulletProps {
  title?: string;
  data: BulletDatum[];
  isDark?: boolean;
  color?: string;
}

/**
 * A rect + tick replica of RSC's alpha `<Bullet>`, ported from
 * rsc-vega-mobile's version — but here it's plain RN `View`s instead of an
 * SVG bar+tick layer pair. Both marks are just rectangles positioned by
 * percentage, and every row shares one x domain (the max across *all* rows'
 * current/target, not each row's own), so there's nothing an SVG scale
 * buys over plain flexbox math the way there is for Bar/Line/Scatter.
 */
export function Bullet({ title, data, isDark = false, color }: BulletProps) {
  const { palette } = usePalette();
  const resolvedColor = color ?? palette.colors[0];
  const max = Math.max(...data.map((d) => Math.max(d.current, d.target)), 1);

  return (
    <Panel title={title} isDark={isDark}>
      <View style={{ gap: 18 }}>
        {data.map((d) => {
          const currentPct = Math.min((d.current / max) * 100, 100);
          const targetPct = Math.min((d.target / max) * 100, 100);
          return (
            <View key={d.category} style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#ccc' : '#333' }]} numberOfLines={1} ellipsizeMode="tail">
                {d.category}
              </Text>
              <View style={styles.track}>
                <View style={[styles.bar, { width: `${Math.max(currentPct, 2)}%`, backgroundColor: resolvedColor }]} />
                <View style={[styles.tick, { left: `${targetPct}%`, backgroundColor: isDark ? '#eee' : '#111' }]} />
              </View>
            </View>
          );
        })}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { width: 90, fontSize: 12 },
  track: { flex: 1, height: 22, justifyContent: 'center' },
  bar: { height: 14, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  tick: { position: 'absolute', top: 1, width: 2, height: 20, marginLeft: -1 },
});
