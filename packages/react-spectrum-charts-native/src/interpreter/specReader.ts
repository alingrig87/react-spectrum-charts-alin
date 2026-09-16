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
import { GroupMark, LineMark, RectMark, Scale, Spec } from 'vega';

import { FILTERED_TABLE } from '@spectrum-charts/constants';

export interface FieldRef {
  scale: string;
  field: string;
}

/** A `{ scale, band }` encoding rule — how Vega sizes a mark to a band scale's bandwidth. */
export interface BandRef {
  scale: string;
  band: number | boolean;
}

/** Shape of the one transform type we special-case: the `stack` step `addBar` adds for a bar's metric. */
export interface StackTransformLike {
  type: 'stack';
  field: string;
  groupby: string[];
  as: [string, string];
}

type RuleLike = (FieldRef | BandRef | { value: unknown } | { signal: string }) & { test?: string };

/** A Vega ProductionRule is either a single rule or an array with the untested default rule last. */
const resolveDefaultRule = (rule: unknown): RuleLike | undefined => {
  if (Array.isArray(rule)) {
    const rules = rule as RuleLike[];
    return rules.find((r) => r.test === undefined) ?? rules[rules.length - 1];
  }
  return rule as RuleLike | undefined;
};

/** Finds the first line mark nested inside a facet group — the shape `addLineMarks` produces. */
export const findLineMark = (spec: Spec): LineMark | undefined => {
  for (const mark of spec.marks ?? []) {
    if (mark.type === 'group') {
      const nested = (mark as GroupMark).marks?.find((m): m is LineMark => m.type === 'line');
      if (nested) return nested;
    }
  }
  return undefined;
};

/** Finds the first top-level bar (`rect`) mark that isn't the "behind the bars" background rect —
 * the shape `addBar` produces for a single, ungrouped bar series (`type: 'stacked'`, the default,
 * with no color/dodge/trellis faceting). Dodged and trellised bars nest their rect marks inside a
 * facet `group` mark instead, which this deliberately does not look inside — see README. */
export const findBarMark = (spec: Spec): RectMark | undefined => {
  const rectMarks = (spec.marks ?? []).filter((m): m is RectMark => m.type === 'rect');
  return rectMarks.find((m) => typeof m.name === 'string' && !m.name.endsWith('_background'));
};

/** Reads a `{ scale, field }` encoding rule, if that's the shape it resolves to. */
export const getFieldRef = (rule: unknown): FieldRef | undefined => {
  const resolved = resolveDefaultRule(rule);
  if (resolved && 'scale' in resolved && 'field' in resolved) return resolved as FieldRef;
  return undefined;
};

/** Reads a `{ scale, band }` encoding rule (how bar marks size themselves to a band scale's bandwidth). */
export const getBandRef = (rule: unknown): BandRef | undefined => {
  const resolved = resolveDefaultRule(rule);
  if (resolved && 'scale' in resolved && 'band' in resolved) return resolved as BandRef;
  return undefined;
};

/** Reads a `{ value }` encoding rule, falling back when the rule is field- or signal-driven. */
export const getStaticValue = <T>(rule: unknown, fallback: T): T => {
  const resolved = resolveDefaultRule(rule);
  if (resolved && 'value' in resolved) return resolved.value as T;
  return fallback;
};

/** Extracts the datum field name out of an `isValid(datum["field"])` defined-signal, if present. */
export const getDefinedField = (rule: unknown): string | undefined => {
  const resolved = resolveDefaultRule(rule);
  const signal = resolved && 'signal' in resolved ? resolved.signal : undefined;
  const match = signal?.match(/datum(?:\[["'](.+?)["']\]|\.(\w+))/);
  return match?.[1] ?? match?.[2];
};

export const findScale = (spec: Spec, name: string): Scale | undefined => spec.scales?.find((s) => s.name === name);

/**
 * Finds the `stack` transform `addBar` pushes onto the `filteredTable` data source for a stacked bar
 * (the default `type`). Its `field` is the *raw* metric field name (before the `metric0`/`metric1`
 * split), and `groupby` is the exact set of fields Vega's stack transform groups by at runtime — used
 * to confirm the interpreter is only being asked to draw one bar per group (see README).
 */
export const findStackTransform = (spec: Spec): StackTransformLike | undefined => {
  const filteredTable = spec.data?.find((d) => d.name === FILTERED_TABLE);
  const transforms = (filteredTable?.transform ?? []) as unknown as { type: string }[];
  return transforms.find((t) => t.type === 'stack') as StackTransformLike | undefined;
};
