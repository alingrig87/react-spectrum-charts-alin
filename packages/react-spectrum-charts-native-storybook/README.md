# @spectrum-charts/react-spectrum-charts-native-storybook

On-device Storybook ([`@storybook/react-native`](https://github.com/storybookjs/react-native)) for
[`@spectrum-charts/react-spectrum-charts-native`](../react-spectrum-charts-native) — a small Expo app whose
only screen is the Storybook UI, so you can browse and interact with `RscNativeChart` stories on an
iOS/Android simulator or a physical device via Expo Go.

This is a proof-of-concept scaffold, matching the proof-of-concept status of the package it previews.

## Prerequisites

The Storybook app depends on `@spectrum-charts/react-spectrum-charts-native`, which is consumed as a
built package (via its `dist/` output), not raw TypeScript. Build the dependency chain first:

```bash
# from the repo root
yarn install
yarn workspace @spectrum-charts/constants build
yarn workspace @spectrum-charts/vega-spec-builder build
yarn workspace @spectrum-charts/react-spectrum-charts-native build
```

## Running

```bash
# from the repo root
yarn workspace @spectrum-charts/react-spectrum-charts-native-storybook start
```

This runs `storybook-generate` (see below) and then `expo start`. From the Expo CLI output you can:

- press `i` / `a` to open an iOS/Android simulator (requires Xcode / Android Studio installed locally),
- or scan the QR code with the Expo Go app on a physical device,
- or press `w` to try the web target (Storybook's on-device UI does render in a browser via
  `react-native-web`, though it isn't the primary target here).

Package-specific shortcuts: `yarn ios`, `yarn android`, `yarn web` (each runs `storybook-generate` first).

## Adding a story

Metro doesn't support Webpack-style dynamic `require`, so `@storybook/react-native` ships a CLI,
`sb-rn-get-stories`, that scans the glob in [`.storybook/main.ts`](.storybook/main.ts) and writes a static
`.storybook/storybook.requires.ts` importing every match. That generated file is checked in with a
placeholder (see the comment at its top) so the package type-checks before the generator has ever run.

1. Add a new `*.story.tsx` file under `src/stories/` (CSF3 format — see
   [`RscNativeChart.story.tsx`](src/stories/RscNativeChart.story.tsx) for the pattern).
2. Run `yarn storybook-generate` (or just `yarn start`, which runs it for you) to refresh
   `storybook.requires.ts`.
3. Reload the app.

## What this does and doesn't prove

- Confirms `RscNativeChart` mounts and renders inside an actual React Native runtime (Metro + Hermes +
  `react-native-svg`), not just under Jest's `buildRenderModel` unit tests.
- Gives interactive controls (`@storybook/addon-ondevice-controls`) for poking at story args on-device.
- Does **not** add device-farm or CI coverage — there's no automated screenshot/snapshot test wired up for
  the rendered native output, only the existing `buildRenderModel` unit tests
  (see [`react-spectrum-charts-native`'s README](../react-spectrum-charts-native/README.md#how-to-test)).
