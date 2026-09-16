# @spectrum-charts/react-spectrum-charts-native

Proof-of-concept native renderer for a single Spectrum line or bar chart on React Native, using
[react-native-svg](https://github.com/software-mansion/react-native-svg) instead of a WebView or a
full Vega runtime.

This package is a first pass, not a parity port of `@adobe/react-spectrum-charts`. It exists to prove
the pipeline end-to-end: reuse the platform-agnostic `@spectrum-charts/vega-spec-builder` package to
produce a real Vega spec, then interpret just enough of that spec to draw one line mark, or one simple
(single-series) bar mark, plus two axes.

## Rendering pipeline

```
ChartOptions (same shape buildSpec() takes on web)
  -> buildSpec()                          @spectrum-charts/vega-spec-builder (unmodified, reused as-is)
  -> buildRenderModel()                   src/interpreter — reads the produced Vega spec + raw data
  -> RenderModel (plain geometry: an SVG path string, tick positions, tick labels)
  -> <RscNativeChart>                     src/RscNativeChart.tsx — draws the RenderModel with react-native-svg
```

`buildSpec` is plain TypeScript with no DOM dependency, so it runs unmodified under Metro/Hermes. No
code in `vega-spec-builder` was changed for this package.

`buildRenderModel` (`src/interpreter/buildRenderModel.ts`) does the actual interpreting. It is **not** a
general-purpose Vega interpreter — it special-cases the exact shapes `addLine`/`addBar`/`addAxis` in
`vega-spec-builder` are known to produce today, and throws a descriptive error if the spec doesn't match
(e.g. a mark type it doesn't handle, or a facet-driven color instead of a static one). This trade-off is
deliberate: a general interpreter would mean re-implementing a large slice of Vega's runtime (scale
resolution, expression evaluation, reactive signals) for a proof of concept that only needs to answer
"does the pipeline work end to end".

## What's supported vs ignored

**Data**

- A flat array of records (`ChartOptions.data`), matching the "simple data" path `VegaChart.tsx` uses on
  web (`tableData.values = chartData.table`). The "full Vega multi-dataset array" input shape
  (`isVegaData()` on web) is **not** supported.
- The `table` data source's `timeunit` transform (added by `addTimeTransform` for time-scale dimensions)
  is replicated field-for-field: the source field is parsed with `new Date(...).getTime()` and written to
  the transform's `as[0]` output field (`datetime0` by default). **Granularity flooring is not applied**
  — every row keeps its exact timestamp instead of being floored to day/week/month/etc. Good enough to
  place points correctly; not good enough for granularity-bucketed aggregation.
- `identifier` transforms (`rscMarkId`), `filteredTable`'s `hiddenSeries` filter, series-id formulas for
  faceting, tooltip/popover/selection data sources, trendlines, and metric ranges are all **ignored**.
  Controlled highlighting, hidden series, and multi-series color/lineType/opacity faceting are therefore
  not supported — this package only draws one line per chart.

**Marks**

`buildRenderModel` looks for a line mark first, then a bar mark; a spec containing neither throws.

- **Line**: exactly one `line` mark, read out of the nested facet `group` mark `addLineMarks` produces
  (`marks[i].marks[0]` where the group's `marks[0].type === 'line'`). Any other/additional mark type
  (`area`, `scatter`, static points, voronoi hover overlays, trendlines, metric ranges, popovers) is
  **ignored**.
  - Only the `x`/`y`/`stroke`/`strokeWidth`/`strokeDash`/`defined` encoding channels are read, and only
    when they resolve to a static `{ value }` or a field reference `{ scale, field }`. A facet-driven
    `{ scale, field }` on `stroke` (per-datum color) falls back to a single default color — there is no
    per-segment recoloring. Signal-driven encodings (hover/selection opacity rules, dual-metric-axis
    `test` rules) are **not** evaluated; the interpreter always takes the untested/default rule.
- **Bar**: exactly one, single-series, **vertical**, `type: 'stacked'` bar mark (the default `type` when
  a `{ markType: 'bar' }` entry doesn't set `color`/`lineType`/`opacity` to a two-element (dodged +
  stacked) facet array) — the shape `addBar` produces as two top-level `rect` marks pushed straight onto
  `spec.marks` (a `${name}_background` rect plus the real one), found by `findBarMark` skipping the
  background rect. **Dodged bars, trellised bars, dual-metric-axis bars, and horizontal orientation are
  all unsupported and throw** — each of those nests its rect mark(s) inside a facet `group` mark instead
  (or, for horizontal, swaps which axis is the band scale), which `findBarMark`'s top-level-only scan
  deliberately does not look inside.
  - The dimension (`x`) position and size come from `encode.update.x` (`{ scale, field }`) and
    `encode.update.width` (`{ scale, band: 1 }`) — both plain field/band references, no signal
    evaluation needed.
  - The metric (`y`/`y2`) top edge comes from `encode.enter.y2`, also a plain `{ scale, field }`. The
    *baseline* (`encode.enter.y`) is a conditional array of `signal` expressions (gap-adjustment logic
    for adjacent stacked segments) that this interpreter does **not** evaluate — instead it recomputes
    the baseline itself as `yScale.toPixel(0)`, which is only correct because bar support is restricted
    to one row per category (see below), so there's never more than one segment to gap-adjust.
  - The real metric data field is read from the `stack` transform vega-spec-builder always adds to the
    `filteredTable` data source for a `type: 'stacked'` bar (its `.field`, not the derived `${metric}1`
    field `y2`'s encoding references, which doesn't exist on the raw input rows). That transform's
    `.groupby` must resolve to exactly the dimension field, and **each category may only have one row**
    — multiple rows per category (real stacking/grouping) throws rather than silently drawing the wrong
    bar heights, since replicating Vega's actual `stack` transform accumulation is out of scope for this
    pass.
  - Fill color is read the same way line's stroke is: a static `{ value }` on `encode.enter.fill` only: a
    facet-driven `{ scale, field }` color falls back to a single default color. Per-corner
    `cornerRadius*` rounding is **ignored** — bars always render as plain rectangles.
- No interactivity: no hover, tooltip, popover, selection, or legend highlighting. No animation.

**Scales**

- `linear` and `time` scales only, for both line axes and a bar's metric axis. `point`/`ordinal` scales
  are **not** supported for either.
- A bar's dimension axis requires a `band` scale (what `addBar` always produces); `paddingInner` and
  `paddingOuter` are honored via `d3-scale`'s `scaleBand`. Category order/domain is derived from the data
  rows' first-seen order, not from re-deriving Vega's own domain-sorting logic.
- `nice`, `zero`, and pixel `padding` are honored for continuous scales (via `d3-scale`'s `.nice()` and a
  manual zero-extend). Ticks and tick labels are generated by `d3-scale`'s own `.ticks()`/`.tickFormat()`
  (or, for a bar's band scale, one tick per category centered in its band), not by re-deriving Vega's
  real axis tick logic (which lives in Vega's runtime, not in the static spec).

**Axes**

- One `bottom` axis and one `left` axis: a baseline, tick marks' pixel positions, and default-formatted
  tick labels. `top`/`right` axes, gridlines, custom `labelFormat`, axis titles, reference lines, and axis
  annotations are all **ignored** in this pass.

## Architectural decisions

- **react-native-svg over Skia**: simpler primitives (`Svg`, `Path`, `Rect`, `Line`, `Text`, `G`) are
  sufficient for a first pass at line/bar + axes; Skia (`@shopify/react-native-skia`) would be the natural
  next step if fill/gradient/blend-heavy marks (area, donut, bullet) or per-corner bar rounding are added
  later.
- **Special-cased spec reading, not a general interpreter**: `src/interpreter/specReader.ts` knows how to
  pull a field ref or static value out of a Vega `ProductionRule`, and `buildRenderModel.ts` knows exactly
  which mark/scale shapes it's willing to accept — it throws rather than guessing when the spec doesn't
  match. This keeps the interpreter small and honest about its limits instead of silently mis-rendering
  unsupported specs.
- **`d3-scale` / `d3-shape` as new dependencies**: both are pure JS with no DOM dependency, run fine under
  Metro/Hermes, and are the same approach most React Native charting libraries use internally. This avoids
  hand-rolling scale math (`nice()`, tick generation, date formatting) and SVG path generation.
- **No `vega-spec-builder` source changes**: this package only *consumes* `buildSpec` and the `Spec`
  shape it returns; nothing was added to `vega-spec-builder`'s public exports.

## Usage

```tsx
import { RscNativeChart } from '@spectrum-charts/react-spectrum-charts-native';

<RscNativeChart
  width={350}
  height={250}
  chartOptions={{
    data: [
      { datetime: '2023-01-01', value: 10 },
      { datetime: '2023-01-02', value: 20 },
      { datetime: '2023-01-03', value: 5 },
    ],
    marks: [{ markType: 'line', dimension: 'datetime', metric: 'value', scaleType: 'time' }],
    axes: [{ position: 'bottom', labelFormat: 'time' }, { position: 'left' }],
  }}
/>;
```

A simple, single-series bar chart works the same way, swapping `markType` for `'bar'`:

```tsx
<RscNativeChart
  width={350}
  height={250}
  chartOptions={{
    data: [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 },
      { category: 'C', value: 5 },
    ],
    marks: [{ markType: 'bar', dimension: 'category', metric: 'value' }],
    axes: [{ position: 'bottom' }, { position: 'left' }],
  }}
/>;
```

## How to test

**Unit tests (no RN runtime needed)** — the interpreter (`buildRenderModel` and its helpers) is plain
TypeScript with no `react-native`/`react-native-svg` import, so it runs under this repo's normal Jest
setup:

```bash
yarn test:quiet --testPathPattern=react-spectrum-charts-native
```

`RscNativeChart.tsx` itself is not covered by an automated test in this pass — rendering it requires a
React Native test renderer/preset (e.g. `react-native`'s Jest preset or `jest-expo`) that isn't configured
in this web-focused monorepo yet. See "Next steps" below.

**Manual/visual check in a real RN app** — since this package isn't published, pack it and install the
tarball into a throwaway Expo app:

```bash
# from the repo root, with @spectrum-charts/constants and @spectrum-charts/vega-spec-builder already built
yarn workspace @spectrum-charts/react-spectrum-charts-native build

# from a separate Expo project
npx create-expo-app rsc-native-demo
cd rsc-native-demo
yarn add react-native-svg
yarn add /path/to/rsc-alin-native/packages/react-spectrum-charts-native
yarn add /path/to/rsc-alin-native/packages/constants /path/to/rsc-alin-native/packages/vega-spec-builder
```

Then render `<RscNativeChart>` (usage example above) from `App.tsx` and run `npx expo start`.

## Next steps for broader coverage

- Add an RN Jest preset (or a Storybook-for-RN / `jest-expo` setup) so `RscNativeChart.tsx` itself has
  snapshot coverage, not just the interpreter.
- Honor `axis.grid`, `axis.labelFormat`, and axis titles.
- Support `point`/ordinal scales (band scales are now supported, for a bar's dimension axis).
- Support facet-driven color/lineType so multi-series line charts render correctly, plus `hiddenSeries`.
- Apply real granularity flooring to the time transform instead of using raw timestamps.
- Support dodged/trellised/dual-metric-axis/horizontal bars — each nests its rect mark(s) inside a facet
  `group` (or swaps axes), which would need the same kind of group-descending `buildRenderModel` already
  does for line, plus (for real multi-row-per-category stacking) replicating Vega's `stack` transform
  accumulation instead of assuming a zero baseline.
- Add more mark types (area, scatter) behind the same "special-case and throw on the unsupported" pattern,
  rather than generalizing the interpreter prematurely.
- Consider Skia if/when fill-/blend-heavy marks or per-corner bar rounding are added.
