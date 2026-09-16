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
import { ReactElement, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Axis, Chart, Line } from '@adobe/react-spectrum-charts';

import { RscWebViewChartConfig, RscWebViewInboundMessage, RscWebViewOutboundMessage } from '../messages.types';

const DEFAULT_CONFIG: RscWebViewChartConfig = { chartType: 'line', height: 300 };

const postToReactNative = (message: RscWebViewOutboundMessage): void => {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
};

const App = (): ReactElement => {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [config, setConfig] = useState<RscWebViewChartConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<string>): void => {
      let message: RscWebViewInboundMessage;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      if (message?.type === 'RSC_CHART_UPDATE') {
        setData(message.payload.data);
        setConfig(message.payload.config);
      }
    };

    // react-native-webview fires RN -> WebView messages on `window` (iOS) or `document` (Android).
    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage as unknown as EventListener);
    postToReactNative({ type: 'RSC_HOST_READY' });

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage as unknown as EventListener);
    };
  }, []);

  const labelFormat = config.scaleType === 'time' ? 'time' : 'linear';

  return (
    <Chart data={data} height={config.height}>
      <Axis position="left" grid />
      <Axis position="bottom" labelFormat={labelFormat} baseline />
      <Line dimension={config.dimension} metric={config.metric} color={config.color} scaleType={config.scaleType} />
    </Chart>
  );
};

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<App />);
}
