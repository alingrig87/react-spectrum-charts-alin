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
  // No addons: both on-device addons (controls, actions) transitively pull
  // in @storybook/addon-actions/@storybook/addon-controls, which collide
  // with the root's unrelated Storybook 8 desktop setup (Metro can't
  // resolve @storybook/addon-actions's "storybook/internal/*" v8-only
  // subpath imports against the 7.x core this app otherwise needs) —
  // not worth fighting for a nice-to-have controls/actions panel when the
  // goal here is just seeing the charts render.
  addons: [],
};

export default main;
