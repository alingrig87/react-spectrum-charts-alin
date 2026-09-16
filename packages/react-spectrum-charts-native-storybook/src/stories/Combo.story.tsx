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

import { Combo } from '@spectrum-charts/react-spectrum-charts-native-charts';

const meta: Meta<typeof Combo> = {
  title: 'NativeCharts/Combo',
  component: Combo,
};

export default meta;

type Story = StoryObj<typeof Combo>;

export const VisitorsAndConversion: Story = {
  args: {
    title: 'Visitors vs. conversion rate',
    barLabel: 'Visitors',
    lineLabel: 'Conversion %',
    data: [
      { x: '2024-01', bar: 1200, line: 2.1 },
      { x: '2024-02', bar: 1450, line: 2.4 },
      { x: '2024-03', bar: 1600, line: 2.6 },
      { x: '2024-04', bar: 1550, line: 2.9 },
      { x: '2024-05', bar: 1800, line: 3.2 },
    ],
  },
};
