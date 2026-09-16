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
// Design tokens lifted from @adobe/react-spectrum-charts (packages/themes/src)
// — same source the rsc-vega-mobile (web) project pulled from, so both repos
// stay visually consistent with RSC's own palette even though this one draws
// everything with react-native-svg instead of Vega-Lite.

export const FONT_FAMILY = 'System';

const gray = {
  light: { 200: 'rgb(230, 230, 230)', 300: 'rgb(213, 213, 213)', 500: 'rgb(144, 144, 144)', 700: 'rgb(70, 70, 70)', 800: 'rgb(34, 34, 34)', 900: 'rgb(0, 0, 0)' },
  dark: { 200: 'rgb(48, 48, 48)', 300: 'rgb(75, 75, 75)', 500: 'rgb(141, 141, 141)', 700: 'rgb(208, 208, 208)', 800: 'rgb(235, 235, 235)', 900: 'rgb(255, 255, 255)' },
} as const;

export function grayScale(scheme: 'light' | 'dark') {
  return gray[scheme];
}

const categorical = {
  100: 'rgb(15, 181, 174)',
  200: 'rgb(64, 70, 202)',
  300: 'rgb(246, 133, 17)',
  400: 'rgb(222, 61, 130)',
  500: 'rgb(126, 132, 250)',
  600: 'rgb(114, 224, 106)',
  700: 'rgb(20, 122, 243)',
  800: 'rgb(115, 38, 211)',
  900: 'rgb(232, 198, 0)',
  1000: 'rgb(203, 93, 0)',
  1100: 'rgb(0, 143, 93)',
  1200: 'rgb(188, 233, 49)',
  1300: 'rgb(90, 169, 250)',
  1400: 'rgb(192, 56, 204)',
  1500: 'rgb(245, 107, 183)',
  1600: 'rgb(255, 226, 46)',
} as const;

export const categorical16: string[] = Object.values(categorical);

export const CORNER_RADIUS = 6;
export const DEFAULT_DONUT_HOLE_RATIO = 0.85;

// Band-scale padding — matches spectrumVegaTheme.ts's `scale.bandPaddingInner`
// / `bandPaddingOuter` (Vega-Lite's own `getBandPadding(PADDING_RATIO)`), so
// `utils/scale.ts`'s hand-rolled `scaleBand` produces the same bar width /
// gap proportions as the Vega-Lite band scale on the web sibling.
export const PADDING_RATIO = 0.4;
export const DISCRETE_PADDING = 0.5;
