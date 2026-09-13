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
import { Spec } from 'vega';

import { TABLE } from '@spectrum-charts/constants';

/** Shape of the one transform type we special-case: the `timeunit` step addTimeTransform adds for time scales. */
interface TimeUnitTransformLike {
  type: 'timeunit';
  field: string;
  as: string[];
}

/**
 * Replicates the `table` data source's `timeunit` transform (if present) so the field it produces
 * (e.g. `datetime0`) exists on every row. Granularity flooring is not applied — see README limitations.
 */
export const getTransformedTableRows = (
  spec: Spec,
  rawRows: Record<string, unknown>[]
): Record<string, unknown>[] => {
  const tableData = spec.data?.find((d) => d.name === TABLE);
  const transforms = (tableData?.transform ?? []) as unknown as { type: string }[];
  const timeunit = transforms.find((t) => t.type === 'timeunit') as TimeUnitTransformLike | undefined;
  if (!timeunit || !timeunit.as?.length) return rawRows;

  const sourceField = timeunit.field;
  const outputField = timeunit.as[0];
  return rawRows.map((row) => {
    const rawValue = row[sourceField];
    const millis = typeof rawValue === 'number' ? rawValue : new Date(rawValue as string).getTime();
    return { ...row, [outputField]: millis };
  });
};
