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
import type { Meta, StoryObj } from '@storybook/react';

import { Scatter } from '@spectrum-charts/react-spectrum-charts-native-charts';

const meta: Meta<typeof Scatter> = {
  title: 'NativeCharts/Scatter',
  component: Scatter,
};

export default meta;

type Story = StoryObj<typeof Scatter>;

export const SpeedVsHandling: Story = {
  args: {
    title: 'Speed vs. handling',
    xLabel: 'Speed',
    yLabel: 'Handling',
    data: [
      { x: 42, y: 65, series: 'Light' },
      { x: 55, y: 58, series: 'Light' },
      { x: 38, y: 72, series: 'Light' },
      { x: 48, y: 68, series: 'Light' },
      { x: 60, y: 45, series: 'Medium' },
      { x: 65, y: 50, series: 'Medium' },
      { x: 58, y: 55, series: 'Medium' },
      { x: 63, y: 47, series: 'Medium' },
      { x: 75, y: 30, series: 'Heavy' },
      { x: 80, y: 25, series: 'Heavy' },
      { x: 70, y: 35, series: 'Heavy' },
      { x: 78, y: 28, series: 'Heavy' },
    ],
  },
};
