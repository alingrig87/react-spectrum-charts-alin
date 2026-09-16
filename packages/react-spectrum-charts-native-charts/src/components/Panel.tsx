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
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PanelProps {
  title?: string;
  isDark?: boolean;
  children: ReactNode;
}

/** The plain-bordered widget panel style ported from rsc-vega-mobile's `Panel.tsx` — a thin 1px border, sharp-ish corners, no shadow, meant to read like RSC's own desktop chart panels rather than a soft app-dashboard card. */
export function Panel({ title, isDark = false, children }: PanelProps) {
  return (
    <View style={[styles.panel, { borderColor: isDark ? '#3a3a3a' : '#d9d9d9', backgroundColor: isDark ? '#1a1d24' : '#fff' }]}>
      {title && <Text style={[styles.title, { color: isDark ? '#eee' : '#3a2f1c' }]}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: 4, padding: 16 },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
});
