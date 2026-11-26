import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nonMinimizeTrait, minimizeTrait } from './traits.config.js';

// paths are resolved against the project root, independent of the current working directory
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const browser = {
  mode: 'production',
  context: root,
  entry: ['./src/index.js'],
  target: 'web',
  output: {
    path: path.join(root, 'dist'),
    filename: 'jsonpath.browser.js',
    libraryTarget: 'umd',
    library: 'JSONPath',
    // works in browsers, web workers and CommonJS (where self is not defined)
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.(js)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true,
          },
        },
      },
    ],
  },
  ...nonMinimizeTrait,
};

const browserMin = {
  mode: 'production',
  context: root,
  entry: ['./src/index.js'],
  target: 'web',
  output: {
    path: path.join(root, 'dist'),
    filename: 'jsonpath.browser.min.js',
    libraryTarget: 'umd',
    library: 'JSONPath',
    // works in browsers, web workers and CommonJS (where self is not defined)
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.(js)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true,
          },
        },
      },
    ],
  },
  ...minimizeTrait,
};

export default [browser, browserMin];
