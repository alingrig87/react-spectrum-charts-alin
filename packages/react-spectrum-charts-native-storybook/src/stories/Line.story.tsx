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

import { Line } from '@spectrum-charts/react-spectrum-charts-native-charts';

const meta: Meta<typeof Line> = {
  title: 'NativeCharts/Line',
  component: Line,
  args: {
    title: 'Browser share over time',
    yLabel: 'Share (%)',
    data: [
      { x: '2024-01', y: 63, series: 'Chrome' },
      { x: '2024-02', y: 64, series: 'Chrome' },
      { x: '2024-03', y: 65, series: 'Chrome' },
      { x: '2024-04', y: 66, series: 'Chrome' },
      { x: '2024-05', y: 67, series: 'Chrome' },
      { x: '2024-01', y: 20, series: 'Safari' },
      { x: '2024-02', y: 19, series: 'Safari' },
      { x: '2024-03', y: 19, series: 'Safari' },
      { x: '2024-04', y: 18, series: 'Safari' },
      { x: '2024-05', y: 17, series: 'Safari' },
      { x: '2024-01', y: 8, series: 'Firefox' },
      { x: '2024-02', y: 8, series: 'Firefox' },
      { x: '2024-03', y: 7, series: 'Firefox' },
      { x: '2024-04', y: 7, series: 'Firefox' },
      { x: '2024-05', y: 7, series: 'Firefox' },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof Line>;

export const Lines: Story = {};

export const FilledArea: Story = {
  args: {
    title: 'Browser share over time (stacked area)',
    filled: true,
  },
};
