const path = require("node:path");

/**
 * apg-lite is an ES module, so the CommonJS build (kept for backward compatibility)
 * bundles its own copy at cjs/apg-lite.cjs. Imports of apg-lite are rewritten to a relative path
 * to that copy, mirroring src/ layout in the output directory, independent of the current working
 * directory and platform path separators.
 */
const resolveApgLite = (extension) => [
  "module-resolver",
  {
    resolvePath(sourcePath, currentFile) {
      if (sourcePath !== "apg-lite") return sourcePath;

      const apgLite = path.join(__dirname, "src", `apg-lite.${extension}`);
      const relativePath = path
        .relative(path.dirname(currentFile), apgLite)
        .split(path.sep)
        .join("/");

      return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
    },
  },
];

module.exports = {
  env: {
    cjs: {
      browserslistEnv: "isomorphic-production",
      presets: [
        [
          "@babel/preset-env",
          {
            debug: false,
            modules: "commonjs",
            useBuiltIns: false,
            forceAllTransforms: false,
            ignoreBrowserslistConfig: false,
          },
        ],
      ],
      plugins: [
        [
          path.join(
            __dirname,
            "./scripts/babel-plugin-add-import-extension.cjs",
          ),
          { extension: "cjs" },
        ],
        resolveApgLite("cjs"),
      ],
    },
    es: {
      browserslistEnv: "isomorphic-production",
      presets: [
        [
          "@babel/preset-env",
          {
            debug: false,
            modules: false,
            useBuiltIns: false,
            forceAllTransforms: false,
            ignoreBrowserslistConfig: false,
          },
        ],
      ],
      plugins: [
        [
          path.join(
            __dirname,
            "./scripts/babel-plugin-add-import-extension.cjs",
          ),
          { extension: "mjs" },
        ],
      ],
    },
    browser: {
      browserslistEnv: "browser-production",
      presets: [
        [
          "@babel/preset-env",
          {
            debug: false,
            modules: "auto",
            useBuiltIns: false,
            forceAllTransforms: false,
            ignoreBrowserslistConfig: false,
          },
        ],
      ],
    },
  },
};
