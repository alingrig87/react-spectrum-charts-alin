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
import { View } from 'react-native';

import type { Preview } from '@storybook/react';

import { PaletteProvider } from '@spectrum-charts/react-spectrum-charts-native-charts';

// The inner fixed-width View gives `@spectrum-charts/react-spectrum-charts-native-charts` stories a
// real parent width to measure via their `useElementWidth`/`onLayout` (they size themselves to 100% of
// their container, same as they did inside rsc-native-charts's own ScrollView-based App.tsx layout) —
// the outer View's `alignItems: 'center'` alone would otherwise size a percentage-width child to 0.
// `RscNativeChart` stories are unaffected: that component renders a fixed-pixel `<Svg width height>`
// straight from its own `width`/`height` args, not a percentage-width wrapper.
//
// `PaletteProvider` wraps every story the same way rsc-native-charts's own `App.tsx` wrapped its demo
// screens: chart stories under `@spectrum-charts/react-spectrum-charts-native-charts` read their active
// color palette via `usePalette()`, so they need a `PaletteProvider` ancestor. `RscNativeChart` stories
// don't use the palette context and are unaffected by it.
const preview: Preview = {
  decorators: [
    (Story) => (
      <PaletteProvider>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ width: 340 }}>
            <Story />
          </View>
        </View>
      </PaletteProvider>
    ),
  ],
};

export default preview;
