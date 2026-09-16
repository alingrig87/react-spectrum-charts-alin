# @spectrum-charts/react-spectrum-charts-native-charts

Hand-drawn React Native chart components matching
[`@adobe/react-spectrum-charts`](https://github.com/adobe/react-spectrum-charts)'s visual language —
Bar, Line/Area, Scatter, Donut, Funnel, Combo, Bullet, BigNumber, Venn, and a Bar List widget — drawn with
[`react-native-svg`](https://github.com/software-mansion/react-native-svg) instead of a WebView or a Vega
runtime.

## Where this came from

This package is a straight port of
[`rsc-native-charts`](https://github.com/alingrig87/rsc-native-charts), a standalone Expo app that built
the same chart set with no charting library and no Vega runtime — just plain SVG primitives and hand-rolled
scale/axis math (`src/utils/scale.ts`, `src/utils/geometry.ts`). That repo had just been through a full
visual-parity pass matching Adobe's real Spectrum design tokens (colors, corner radius, band-scale padding,
font sizes) before this port, so the porting goal here was to carry that work over unchanged — this is a
library packaging of existing, working code, not a rewrite. Only the standalone app's own shell (`App.tsx`,
`app.json`, its Expo entry point, the demo screens) was left behind; everything under `src/charts`,
`src/components`, `src/theme`, `src/hooks`, and `src/utils` moved over with the same file layout, so its
internal relative imports needed no changes.

## How this differs from `react-spectrum-charts-native`

[`@spectrum-charts/react-spectrum-charts-native`](../react-spectrum-charts-native), the other native
package in this monorepo, is a from-scratch **interpreter**: it takes the same `ChartOptions` shape
`@spectrum-charts/vega-spec-builder` consumes on web, runs it through `buildSpec()` to produce a real Vega
spec, and then interprets a deliberately narrow slice of that spec (currently just a `line` or `bar` mark
plus two axes) to draw it with `react-native-svg`. It is spec-driven and currently supports two mark types.

This package is the opposite shape: each chart is a **plain React component** that takes chart-specific,
already-shaped data directly as props (e.g. `<Bar data={[{ category, value }]} />`), with no Vega spec, no
spec builder, and no interpretation step in between. It supports every chart type in the set today (nine
chart components plus a Bar List widget) because there's no general-spec-interpretation problem to solve —
each component just draws its own inputs. The trade-off is the inverse of the interpreter's: it does not
consume the same `ChartOptions`/Vega-spec pipeline the web `@adobe/react-spectrum-charts` package uses, so
it isn't a drop-in renderer for specs built elsewhere in this monorepo — it's a standalone, hand-drawn chart
library with its own prop shapes per chart.

## What's here

- **`src/charts/`** — one component per chart type (`Bar`, `Line`, `Scatter`, `Donut`, `Funnel`, `Combo`,
  `Bullet`, `BigNumber`, `Venn`), each reading its width live via `onLayout` so it's fluid inside any
  container.
- **`src/components/`** — shared, chart-agnostic pieces: `Panel` (bordered card), `Legend` (plain RN
  Views/Text, not chart-drawn), `BarList` (a percentage-width bar list, no SVG needed).
- **`src/theme/`** — `palette.tsx`'s switchable color-palette system (`PaletteProvider` / `usePalette` /
  `PaletteSwitcher`) and `tokens.ts`'s Spectrum design tokens (gray scale, the categorical-16 palette,
  corner radius, band-scale padding).
- **`src/hooks/`** — `useElementWidth` (an `onLayout`-based live width, RN's equivalent of a
  `ResizeObserver`) and `useOrientation` (live device orientation via `useWindowDimensions`; `Scatter`
  widens in landscape).
- **`src/utils/`** — `scale.ts` and `geometry.ts`, the hand-rolled band/linear-scale and polar/path-geometry
  math every chart depends on in place of a charting library or Vega.

## Usage

Every chart reads its active color palette from a `PaletteProvider` ancestor (falling back to each chart's
own default `colors` prop when there isn't one), so wrap whatever tree renders these charts in one:

```tsx
import { PaletteProvider, Bar } from '@spectrum-charts/react-spectrum-charts-native-charts';

function Example() {
  return (
    <PaletteProvider>
      <Bar
        title="Spend by team"
        data={[
          { category: 'Marketing', value: 42 },
          { category: 'Engineering', value: 78 },
        ]}
      />
    </PaletteProvider>
  );
}
```

See [`packages/react-spectrum-charts-native-storybook`](../react-spectrum-charts-native-storybook)'s
`src/stories/` for a runnable example of every chart in this package.

## Building

```bash
# from the repo root
yarn workspace @spectrum-charts/react-spectrum-charts-native-charts build
```
