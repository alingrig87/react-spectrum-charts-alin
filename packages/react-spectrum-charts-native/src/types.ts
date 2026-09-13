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

/** A single rendered axis tick: pixel position along the axis plus its label. */
export interface RenderTick {
  position: number;
  label: string;
}

/** Geometry for one rendered axis. */
export interface RenderAxis {
  orient: 'bottom' | 'left';
  /** Pixel position of the axis line itself (y for bottom, x for left). */
  axisLinePosition: number;
  ticks: RenderTick[];
  grid: boolean;
}

/** Geometry for the single supported line mark. */
export interface RenderLine {
  /** SVG path `d` attribute, as produced by d3-shape's line generator. */
  path: string;
  stroke: string;
  strokeWidth: number;
  strokeDasharray: number[];
}

/** The fully-interpreted, renderer-agnostic geometry for one chart. Consumed by RscNativeChart. */
export interface RenderModel {
  width: number;
  height: number;
  plot: { x: number; y: number; width: number; height: number };
  line: RenderLine;
  xAxis: RenderAxis;
  yAxis: RenderAxis;
}
