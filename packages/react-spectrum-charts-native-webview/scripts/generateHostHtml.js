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
const fs = require('fs');
const path = require('path');

// Inlines the webpack-built host bundle into the HTML template and writes the result out as a
// TS string constant, so `RscWebViewChart` can hand it to react-native-webview's `source={{ html }}`
// without the consuming RN app needing any asset-loader configuration of its own.
const templatePath = path.resolve(__dirname, '../src/host/index.html');
const bundlePath = path.resolve(__dirname, '../dist-host/host.bundle.js');
const outPath = path.resolve(__dirname, '../src/generated/hostHtml.ts');

const template = fs.readFileSync(templatePath, 'utf8');
const bundle = fs.readFileSync(bundlePath, 'utf8');
const html = template.replace('<!--RSC_HOST_BUNDLE-->', `<script>${bundle}</script>`);

const fileContents = `/*
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

// GENERATED FILE - do not edit by hand. Run \`yarn build:host && yarn generate:host-html\` to regenerate.
export const HOST_HTML = ${JSON.stringify(html)};
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, fileContents);
// eslint-disable-next-line no-console
console.log(`Wrote ${outPath} (${(html.length / 1024).toFixed(1)} KB inlined bundle)`);
