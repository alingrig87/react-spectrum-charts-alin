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

// Bundles the standalone web app that gets embedded (inline, as a single <script>) into the
// WebView's HTML. Unlike the other packages' webpack configs, nothing is externalized here:
// react, react-dom, @adobe/react-spectrum-charts and its own peer deps (vega, vega-lite,
// @adobe/react-spectrum) all need to ship inside this bundle since there is no host page to
// resolve them from inside the WebView.
module.exports = {
  entry: './src/host/index.tsx',
  mode: 'production',

  output: {
    filename: 'host.bundle.js',
    path: path.resolve(__dirname, 'dist-host'),
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.host.json'),
          },
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader'],
        sideEffects: true,
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
  },

  devtool: false,
};
