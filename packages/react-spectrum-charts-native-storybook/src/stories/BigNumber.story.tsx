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

import { BigNumber } from '@spectrum-charts/react-spectrum-charts-native-charts';

const meta: Meta<typeof BigNumber> = {
  title: 'NativeCharts/BigNumber',
  component: BigNumber,
};

export default meta;

type Story = StoryObj<typeof BigNumber>;

export const VisitorsWithTrend: Story = {
  args: {
    label: 'Visitors (30d)',
    value: '1,480',
    trend: [
      { x: '1', y: 980 },
      { x: '2', y: 1120 },
      { x: '3', y: 1050 },
      { x: '4', y: 1300 },
      { x: '5', y: 1250 },
      { x: '6', y: 1480 },
    ],
  },
};
