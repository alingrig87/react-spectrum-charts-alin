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
import { useWindowDimensions } from 'react-native';

/**
 * Live device orientation. `useWindowDimensions` already re-renders on an
 * actual device rotation (or, on web, a window resize), so unlike the web
 * project's `matchMedia('(orientation: landscape)')` listener, no manual
 * event wiring is needed here — RN's own hook already is the live listener.
 * Scatter uses this to widen its aspect ratio in landscape, where a
 * spread/correlation plot genuinely reads better.
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const { width, height } = useWindowDimensions();
  return width > height ? 'landscape' : 'portrait';
}
