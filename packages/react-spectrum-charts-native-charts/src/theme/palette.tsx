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
import { createContext, useContext, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { categorical16 } from './tokens';

export interface Palette {
  id: string;
  name: string;
  colors: string[];
}

// "Spectrum" is this project's own default (same categorical16 every chart
// uses without an explicit `colors` prop) — the rest are alternates a user
// can switch to, the same idea as RSC's own `<Chart colors={[...]}>` prop,
// just exposed as an in-app picker. Kept identical to rsc-vega-mobile's
// palette set on purpose, so the two repos read as the same design system.
export const PALETTES: Palette[] = [
  { id: 'spectrum', name: 'Spectrum', colors: categorical16 },
  {
    id: 'warm',
    name: 'Warm',
    colors: ['rgb(180, 95, 6)', 'rgb(24, 100, 171)', 'rgb(232, 93, 47)', 'rgb(155, 143, 9)', 'rgb(74, 144, 226)', 'rgb(201, 64, 64)', 'rgb(214, 158, 46)', 'rgb(56, 161, 105)'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['rgb(11, 94, 140)', 'rgb(32, 156, 158)', 'rgb(90, 120, 200)', 'rgb(14, 165, 165)', 'rgb(56, 108, 176)', 'rgb(103, 178, 184)', 'rgb(26, 60, 110)', 'rgb(130, 195, 200)'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['rgb(219, 84, 68)', 'rgb(240, 147, 43)', 'rgb(190, 50, 110)', 'rgb(245, 178, 71)', 'rgb(150, 40, 90)', 'rgb(230, 110, 60)', 'rgb(120, 30, 70)', 'rgb(250, 200, 110)'],
  },
];

interface PaletteContextValue {
  palette: Palette;
  setPaletteId: (id: string) => void;
}

const PaletteContext = createContext<PaletteContextValue>({ palette: PALETTES[0], setPaletteId: () => {} });

/** Wrap a screen's charts in this once; every chart inside reads the active palette via `usePalette()` instead of taking its own `colors` prop, so one switcher controls all of them together. */
export function PaletteProvider({ children, defaultPaletteId = 'spectrum' }: { children: ReactNode; defaultPaletteId?: string }) {
  const [id, setId] = useState(defaultPaletteId);
  const palette = PALETTES.find((p) => p.id === id) ?? PALETTES[0];
  return <PaletteContext.Provider value={{ palette, setPaletteId: setId }}>{children}</PaletteContext.Provider>;
}

export function usePalette(): PaletteContextValue {
  return useContext(PaletteContext);
}

/** A row of tappable palette pills — switches every chart under the same `PaletteProvider`. */
export function PaletteSwitcher({ isDark = false }: { isDark?: boolean }) {
  const { palette, setPaletteId } = usePalette();
  return (
    <View style={styles.row}>
      {PALETTES.map((p) => {
        const selected = p.id === palette.id;
        return (
          <Pressable
            key={p.id}
            onPress={() => setPaletteId(p.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${p.name} palette`}
            style={[
              styles.pill,
              {
                borderColor: selected ? (isDark ? '#eee' : '#1a1a2e') : isDark ? '#3a3a3a' : '#ddd',
                borderWidth: selected ? 1.5 : 1,
                backgroundColor: isDark ? '#1c2029' : '#fff',
              },
            ]}
          >
            <View style={styles.dots}>
              {p.colors.slice(0, 4).map((c, i) => (
                <View key={i} style={[styles.dot, { backgroundColor: c, marginLeft: i === 0 ? 0 : -3, borderColor: isDark ? '#1c2029' : '#fff' }]} />
              ))}
            </View>
            <Text style={[styles.label, { color: isDark ? '#ddd' : '#333' }]}>{p.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 16 },
  dots: { flexDirection: 'row' },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1 },
  label: { fontSize: 11 },
});
