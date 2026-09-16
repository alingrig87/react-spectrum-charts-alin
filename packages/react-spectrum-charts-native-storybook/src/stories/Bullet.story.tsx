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

import { Bullet } from '@spectrum-charts/react-spectrum-charts-native-charts';

const meta: Meta<typeof Bullet> = {
  title: 'NativeCharts/Bullet',
  component: Bullet,
};

export default meta;

type Story = StoryObj<typeof Bullet>;

export const UsageVsTarget: Story = {
  args: {
    title: 'Usage vs. target',
    data: [
      { category: 'Storage used', current: 750, target: 1000 },
      { category: 'API requests', current: 850, target: 1000 },
      { category: 'Bandwidth', current: 420, target: 600 },
    ],
  },
};
