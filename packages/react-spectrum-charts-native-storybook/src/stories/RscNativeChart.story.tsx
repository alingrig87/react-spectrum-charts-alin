import type { Meta, StoryObj } from '@storybook/react';

import { RscNativeChart } from '@spectrum-charts/react-spectrum-charts-native';

const meta: Meta<typeof RscNativeChart> = {
  title: 'RscNativeChart',
  component: RscNativeChart,
  args: {
    width: 320,
    height: 220,
  },
};

export default meta;

type Story = StoryObj<typeof RscNativeChart>;

export const LinearScale: Story = {
  args: {
    chartOptions: {
      data: [
        { index: 0, value: 10 },
        { index: 1, value: 25 },
        { index: 2, value: 8 },
        { index: 3, value: 30 },
        { index: 4, value: 18 },
      ],
      marks: [{ markType: 'line', dimension: 'index', metric: 'value', scaleType: 'linear' }],
      axes: [{ position: 'bottom' }, { position: 'left' }],
    },
  },
};

export const TimeScale: Story = {
  args: {
    chartOptions: {
      data: [
        { datetime: '2024-01-01', value: 10 },
        { datetime: '2024-01-02', value: 20 },
        { datetime: '2024-01-03', value: 5 },
        { datetime: '2024-01-04', value: 30 },
        { datetime: '2024-01-05', value: 18 },
      ],
      marks: [{ markType: 'line', dimension: 'datetime', metric: 'value', scaleType: 'time' }],
      axes: [
        { position: 'bottom', labelFormat: 'time' },
        { position: 'left' },
      ],
    },
  },
};
