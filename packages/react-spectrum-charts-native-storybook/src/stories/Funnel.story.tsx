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

import { Funnel } from '@spectrum-charts/react-spectrum-charts-native-charts';

const meta: Meta<typeof Funnel> = {
  title: 'NativeCharts/Funnel',
  component: Funnel,
};

export default meta;

type Story = StoryObj<typeof Funnel>;

export const SignupFunnel: Story = {
  args: {
    title: 'Signup funnel',
    data: [
      { label: 'Visitors', value: 5000 },
      { label: 'Signups', value: 3200 },
      { label: 'Trials', value: 1800 },
      { label: 'Purchases', value: 950 },
      { label: 'Renewals', value: 620 },
    ],
  },
};
