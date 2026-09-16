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
import type { StorybookConfig } from '@storybook/react-native';

// Consumed by `sb-rn-get-stories` (the `storybook-generate` script) to produce
// `.storybook/storybook.requires.ts` — Metro can't do Webpack-style dynamic requires,
// so that generated file holds static imports for every story matched by this glob.
const main: StorybookConfig = {
  stories: ['../src/stories/**/*.story.?(ts|tsx|js|jsx)'],
  addons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};

export default main;
