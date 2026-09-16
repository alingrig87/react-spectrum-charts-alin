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

// Charts
export { Bar } from './charts/Bar';
export type { BarDatum } from './charts/Bar';

export { BigNumber } from './charts/BigNumber';

export { Bullet } from './charts/Bullet';
export type { BulletDatum } from './charts/Bullet';

export { Combo } from './charts/Combo';
export type { ComboDatum } from './charts/Combo';

export { Donut } from './charts/Donut';
export type { DonutDatum } from './charts/Donut';

export { Funnel } from './charts/Funnel';
export type { FunnelStage } from './charts/Funnel';

export { Line } from './charts/Line';
export type { SeriesDatum } from './charts/Line';

export { Scatter } from './charts/Scatter';
export type { ScatterPoint } from './charts/Scatter';

export { Venn } from './charts/Venn';
export type { VennSet } from './charts/Venn';

// Shared, chart-agnostic components
export { BarList } from './components/BarList';
export type { BarListEntry } from './components/BarList';

export { Legend } from './components/Legend';
export type { LegendEntry } from './components/Legend';

export { Panel } from './components/Panel';

// Theme / palette system
export { PaletteProvider, usePalette, PaletteSwitcher, PALETTES } from './theme/palette';
export type { Palette } from './theme/palette';
export { FONT_FAMILY, grayScale, categorical16, CORNER_RADIUS, DEFAULT_DONUT_HOLE_RATIO, PADDING_RATIO, DISCRETE_PADDING } from './theme/tokens';

// Hooks
export { useElementWidth } from './hooks/useElementWidth';
export { useOrientation } from './hooks/useOrientation';

// Geometry / scale utilities
export { polarToCartesian, describeDonutSegment, topRoundedRectPath, smoothLinePath, computeSegments } from './utils/geometry';
export type { Point, Segment } from './utils/geometry';
export { scaleLinear, niceMax, scaleBand, ticksFor } from './utils/scale';
export type { BandScale } from './utils/scale';
