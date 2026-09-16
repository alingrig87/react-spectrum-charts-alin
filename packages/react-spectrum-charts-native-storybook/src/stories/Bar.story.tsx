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

import { Bar } from '@spectrum-charts/react-spectrum-charts-native-charts';

const meta: Meta<typeof Bar> = {
  title: 'NativeCharts/Bar',
  component: Bar,
};

export default meta;

type Story = StoryObj<typeof Bar>;

export const Simple: Story = {
  args: {
    title: 'Spend by team',
    type: 'simple',
    yLabel: 'Spend ($k)',
    data: [
      { category: 'Marketing', value: 42 },
      { category: 'Engineering', value: 78 },
      { category: 'Sales', value: 35 },
      { category: 'Support', value: 24 },
      { category: 'Design', value: 18 },
    ],
  },
};

export const Dodged: Story = {
  args: {
    title: 'Sales by region and quarter',
    type: 'dodged',
    yLabel: 'Sales ($k)',
    data: [
      { category: 'Q1', series: 'West', value: 42 },
      { category: 'Q2', series: 'West', value: 51 },
      { category: 'Q3', series: 'West', value: 47 },
      { category: 'Q1', series: 'East', value: 33 },
      { category: 'Q2', series: 'East', value: 38 },
      { category: 'Q3', series: 'East', value: 41 },
    ],
  },
};

export const Stacked: Story = {
  args: {
    title: 'Browser share by month',
    type: 'stacked',
    yLabel: 'Share (%)',
    data: [
      { category: '2024-01', series: 'Chrome', value: 63 },
      { category: '2024-01', series: 'Safari', value: 20 },
      { category: '2024-01', series: 'Firefox', value: 8 },
      { category: '2024-01', series: 'Edge', value: 5 },
      { category: '2024-02', series: 'Chrome', value: 64 },
      { category: '2024-02', series: 'Safari', value: 19 },
      { category: '2024-02', series: 'Firefox', value: 8 },
      { category: '2024-02', series: 'Edge', value: 5 },
      { category: '2024-03', series: 'Chrome', value: 65 },
      { category: '2024-03', series: 'Safari', value: 19 },
      { category: '2024-03', series: 'Firefox', value: 7 },
      { category: '2024-03', series: 'Edge', value: 6 },
    ],
  },
};
