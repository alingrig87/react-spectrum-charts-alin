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

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const { getDefaultConfig } = require('expo/metro-config');

// This package lives in a yarn workspace, so Metro needs to look past its own
// node_modules into the monorepo root to resolve @spectrum-charts/* workspace packages.
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// Deliberately left at its default (false): npm nests some of this
// package's own transitive deps (e.g. @storybook/react-native's pinned
// storybook-core packages, via this repo's package.json "overrides")
// inside node_modules/@storybook/react-native/node_modules/ instead of
// hoisting them — a path neither entry above covers. Hierarchical
// lookup is what lets Metro find those nested copies; disabling it
// (as a prior version of this file did) breaks that resolution while
// only mattering for a workspace-hoisting edge case the two explicit
// nodeModulesPaths entries above already handle.

// This app pins react@18.2.0/react-dom@18.2.0 (what Expo 51/RN 0.74
// need), but the monorepo root's own devDependencies pin react@^19 (for
// the unrelated desktop packages) — with hierarchical lookup on, Metro
// resolves two different `react` installs for different requirers in
// the same bundle (workspace packages like @spectrum-charts/* walk up to
// the root-hoisted react@19; this app's own files find its own nested
// react@18.2.0 first), which React itself refuses to render ("Minified
// React error #525: A React Element from an older version of React was
// rendered... Multiple copies of the react package is used" — confirmed
// via a live screenshot + console error). `resolver.extraNodeModules`
// alone did NOT fix this — it's only a fallback for modules Metro can't
// otherwise resolve, and `react`/`react-dom`/`react-native` always ARE
// otherwise resolvable, so it was silently never applied. A custom
// resolveRequest is the one hook that unconditionally overrides
// resolution regardless of Metro's own default walk.
const forcedModuleRoots = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  for (const [name, root] of Object.entries(forcedModuleRoots)) {
    if (moduleName === name || moduleName.startsWith(`${name}/`)) {
      const rewritten = moduleName === name ? root : path.join(root, moduleName.slice(name.length));
      return context.resolveRequest(context, rewritten, platform);
    }
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
