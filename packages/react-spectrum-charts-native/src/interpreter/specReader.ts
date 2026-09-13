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
import { GroupMark, LineMark, Scale, Spec } from 'vega';

export interface FieldRef {
  scale: string;
  field: string;
}

type RuleLike = (FieldRef | { value: unknown } | { signal: string }) & { test?: string };

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

/** Reads a `{ scale, field }` encoding rule, if that's the shape it resolves to. */
export const getFieldRef = (rule: unknown): FieldRef | undefined => {
  const resolved = resolveDefaultRule(rule);
  if (resolved && 'scale' in resolved && 'field' in resolved) return resolved as FieldRef;
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
