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

/** Chart types the WebView host currently knows how to render. Extend as more marks are ported. */
export type RscWebViewChartType = 'line';

/** Vega scale type for the dimension axis, mirrors the subset of `ScaleType` this POC supports. */
export type RscWebViewScaleType = 'time' | 'linear' | 'point';

export interface RscWebViewChartConfig {
  chartType: RscWebViewChartType;
  dimension?: string;
  metric?: string;
  color?: string;
  scaleType?: RscWebViewScaleType;
  height: number;
}

/** Message sent from the React Native side into the WebView host with chart data + config. */
export interface RscChartUpdateMessage {
  type: 'RSC_CHART_UPDATE';
  payload: {
    data: Record<string, unknown>[];
    config: RscWebViewChartConfig;
  };
}

export type RscWebViewInboundMessage = RscChartUpdateMessage;

/** Message sent from the WebView host back to React Native once the bundle has mounted. */
export interface RscHostReadyMessage {
  type: 'RSC_HOST_READY';
}

export type RscWebViewOutboundMessage = RscHostReadyMessage;
