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

import { BarList } from '@spectrum-charts/react-spectrum-charts-native-charts';

const meta: Meta<typeof BarList> = {
  title: 'NativeCharts/BarList',
  component: BarList,
};

export default meta;

type Story = StoryObj<typeof BarList>;

export const TrafficBySource: Story = {
  args: {
    entries: [
      { label: 'Organic Search', value: 4200, previousValue: 3800 },
      { label: 'Paid Search', value: 3100, previousValue: 3400 },
      { label: 'Referral', value: 1800, previousValue: 1500 },
      { label: 'Social', value: 950, previousValue: 700 },
      { label: 'Direct', value: 620, previousValue: 640 },
    ],
  },
};
