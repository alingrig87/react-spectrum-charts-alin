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
import { ReactElement, useEffect, useRef } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

import { HOST_HTML } from './generated/hostHtml';
import {
  RscChartUpdateMessage,
  RscWebViewChartType,
  RscWebViewOutboundMessage,
  RscWebViewScaleType,
} from './messages.types';

export interface RscWebViewChartProps {
  /** Rows to plot, same shape as the `data` prop on the web `<Chart>`. */
  data: Record<string, unknown>[];
  /** Which mark to render. Only `'line'` is implemented in this proof of concept. */
  chartType: RscWebViewChartType;
  dimension?: string;
  metric?: string;
  color?: string;
  scaleType?: RscWebViewScaleType;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_HEIGHT = 300;

/** Renders a react-spectrum-charts chart inside a WebView by bridging props to the embedded web bundle. */
export const RscWebViewChart = ({
  data,
  chartType,
  dimension,
  metric,
  color,
  scaleType,
  height = DEFAULT_HEIGHT,
  style,
}: RscWebViewChartProps): ReactElement => {
  const webViewRef = useRef<WebView>(null);
  const isHostReady = useRef(false);

  const sendUpdate = (): void => {
    const message: RscChartUpdateMessage = {
      type: 'RSC_CHART_UPDATE',
      payload: { data, config: { chartType, dimension, metric, color, scaleType, height } },
    };
    webViewRef.current?.postMessage(JSON.stringify(message));
  };

  useEffect(() => {
    if (isHostReady.current) {
      sendUpdate();
    }
    // sendUpdate is intentionally excluded: it closes over the same props already listed here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, chartType, dimension, metric, color, scaleType, height]);

  const handleMessage = (event: WebViewMessageEvent): void => {
    let message: RscWebViewOutboundMessage;
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (message?.type === 'RSC_HOST_READY') {
      isHostReady.current = true;
      sendUpdate();
    }
  };

  return (
    <View style={[{ width: '100%', height }, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: HOST_HTML }}
        onMessage={handleMessage}
        javaScriptEnabled
        style={{ backgroundColor: 'transparent' }}
      />
    </View>
  );
};
