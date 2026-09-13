# @spectrum-charts/react-spectrum-charts-native-webview

Proof-of-concept React Native wrapper around `@adobe/react-spectrum-charts`. Vega needs a
DOM/Canvas, which React Native doesn't have, so this package doesn't reimplement chart rendering
natively — it loads the *real* web chart bundle inside a `react-native-webview` and drives it
from React Native over `postMessage`. Because it's the same `Chart` / vega-embed code that runs
on the web, rendering is pixel-identical to the web version.

## How it works

There are two halves that build independently:

1. **The host bundle** (`src/host/index.tsx`) — a small standalone React app that renders
   `<Chart><Axis/><Axis/><Line/></Chart>` (mirrors the basic story in
   `packages/react-spectrum-charts/src/stories/components/Line/Line.story.tsx`) and listens for
   `postMessage` events carrying chart data + config, re-rendering whenever a message arrives. On
   mount it posts an `RSC_HOST_READY` message back out so the RN side knows it's safe to send data.
   `webpack.host.config.js` bundles this into a single self-contained `dist-host/host.bundle.js`
   (react, react-dom, `@adobe/react-spectrum-charts`, `@adobe/react-spectrum`, vega, vega-lite —
   everything — inlined, nothing externalized, since there's no page around it to resolve
   dependencies from).
2. **The React Native component** (`src/RscWebViewChart.tsx`) — renders a `WebView` whose
   `source={{ html }}` is the host bundle inlined into an HTML shell, and bridges prop changes
   into `RSC_CHART_UPDATE` postMessages.

### Architectural decision: local HTML string, not a dev server URL

`scripts/generateHostHtml.js` inlines the built `host.bundle.js` directly into the HTML template
(`src/host/index.html`) and writes the result out as a plain TS string export,
`src/generated/hostHtml.ts`. `RscWebViewChart` imports that constant and passes it to
`WebView`'s `source={{ html: HOST_HTML }}`.

This was chosen over pointing the WebView at a dev server URL because:
- it needs no network/dev-server reachable from the device or simulator (no IP/port wrangling,
  works offline, works in release builds),
- it needs no RN asset-loader configuration in the consuming app (no metro config changes to
  load `.html`/`.js` as assets) — it's just a JS string, bundled by Metro like anything else,
- a single committed placeholder (see below) means the package type-checks and installs cleanly
  even before the host bundle has ever been built.

The tradeoff: `RscWebViewChart` currently ships whatever HTML was baked in at the last
`yarn build`, so a Metro fast-refresh loop against `src/host/*` doesn't pick up host-side changes
by itself — rerun `yarn build:host && yarn generate:host-html` to refresh it. Swapping to a dev
server URL later (`source={{ uri: 'http://<host>:<port>' }}`) would be a small, isolated change
to `RscWebViewChart.tsx` if faster host-side iteration is needed.

`src/generated/hostHtml.ts` is a build artifact and is checked in with a placeholder page (it
just tells you to run the build) so a fresh clone type-checks without requiring the full
dependency chain to be built first. Running the real build overwrites it with the actual chart
bundle.

## Building

The host bundle imports `@adobe/react-spectrum-charts`, which resolves through the workspace to
that package's own `dist/`. Build the dependency chain first, then this package:

```bash
# from the repo root
yarn install
yarn build:parallel        # builds constants/themes/utils/locales, vega-spec-builder, react-spectrum-charts
yarn workspace @spectrum-charts/react-spectrum-charts-native-webview build
```

The package's own `build` script runs three steps in order:

```bash
yarn build:host          # webpack bundles src/host/index.tsx -> dist-host/host.bundle.js
yarn generate:host-html  # inlines dist-host/host.bundle.js into src/generated/hostHtml.ts
tsc                      # compiles the RN-facing src/*.ts(x) (excluding src/host) -> dist/
```

## Using it in a React Native app

```tsx
import { RscWebViewChart } from '@spectrum-charts/react-spectrum-charts-native-webview';

<RscWebViewChart
  chartType="line"
  data={[
    { datetime: 1667890800000, users: 147 },
    { datetime: 1667977200000, users: 148 },
  ]}
  dimension="datetime"
  metric="users"
  height={300}
/>;
```

Requires `react-native-webview` as a peer dependency in the consuming app
(`yarn add react-native-webview`, plus the usual iOS `pod install`).

## Trying it standalone (without a real RN app)

There's no RN app scaffolded in this repo to run it in yet. The quickest way to see the host
bundle render is to build it and open it directly in a browser, which is exactly what the
WebView will show:

```bash
yarn workspace @spectrum-charts/react-spectrum-charts-native-webview build:host
```

Then open `dist-host/host.bundle.js`'s containing page — easiest is to temporarily add a
`<script src="dist-host/host.bundle.js"></script>` to a copy of `src/host/index.html` and open it
in a browser; without a `postMessage` sender the chart mounts with empty data, but it confirms
the bundle boots. To see it with real data end-to-end, drop the `RscWebViewChart` component into
an actual RN app (`npx react-native init` / Expo) that depends on this package.

## Current limitations

- **Only `Line` + two `Axis` are wired up.** No other marks, no `Legend`, `ChartTooltip`,
  `ChartPopover`, trendlines, etc. This is intentionally a proof of concept for the
  WebView-bridging pattern, not a ported feature set.
- **No native gestures.** Vega's own pointer/touch handling runs inside the WebView; there's no
  RN gesture-responder integration, so anything like drag-to-zoom competing with a parent
  `ScrollView` hasn't been addressed.
- **WebView startup cost.** Each `RscWebViewChart` instance boots a full WebView + loads the
  entire inlined bundle (React, react-dom, `@adobe/react-spectrum`, vega, vega-lite). Expect a
  visible mount delay and don't expect to render dozens of these on one screen.
- **No resize handling after mount.** The chart's `height` is fixed via the `height` prop; window
  resizes on the web side (e.g. device rotation) aren't currently re-propagated into a new
  `RSC_CHART_UPDATE`.
- **No error/loading state surfaced to RN.** If the bundle fails to mount or `buildSpec` throws,
  RN currently has no signal — only `RSC_HOST_READY` is bridged back out.
- **Message payloads are unvalidated JSON.** Both sides `JSON.parse` and trust the shape; a
  malformed payload is silently dropped rather than surfaced as an error.
