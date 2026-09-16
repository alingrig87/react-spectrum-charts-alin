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
import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

/**
 * Live measured width via `onLayout` — React Native's equivalent of the web
 * project's `useContainerWidth` (which used a `ResizeObserver`; RN has no
 * DOM, so `onLayout` firing on mount and on every layout change, including
 * a device rotation, is the native substitute). Spread `onLayout` onto the
 * `View` you want measured; `width` starts at 0 until the first layout pass.
 */
export function useElementWidth() {
  const [width, setWidth] = useState(0);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const w = Math.round(event.nativeEvent.layout.width);
    setWidth((prev) => (Math.abs(prev - w) > 1 ? w : prev));
  }, []);
  return { width, onLayout };
}
