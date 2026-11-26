/**
 * Smoke test of the built artifacts, as consumers load them: CommonJS, ES module, UMD (require and browser global).
 * Resolves the package by its name, so it runs both inside this repository (self-reference)
 * and in a project the packed tarball is installed into.
 * Written in syntax supported by the oldest supported Node.js version (see engines in package.json).
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');

const name = '@swaggerexpert/jsonpath';
const root = path.dirname(require.resolve(`${name}/package.json`));

// values created in a different realm (vm context) have different prototypes, so compare their JSON
const assertJSONEqual = (actual, expected) =>
  assert.strictEqual(JSON.stringify(actual), JSON.stringify(expected));

const errorNames = [
  'JSONPathError',
  'JSONPathParseError',
  'JSONNormalizedPathError',
  'JSONPathEvaluateError',
];

/**
 * @param {string} label
 * @param {object} JSONPath the package exports
 * @param {function} [run] runs code in the realm of the exports, so the realm recognizes its values
 */
const check = (label, JSONPath, run = (fn) => fn(JSONPath)) => {
  assert.strictEqual(JSONPath.test('$.store.book[*].title'), true);
  assert.strictEqual(JSONPath.test('$.'), false);
  assert.strictEqual(JSONPath.parse('$.a').result.success, true);
  assert.strictEqual(JSONPath.NormalizedPath.from(['a', 1]), "$['a'][1]");
  assertJSONEqual(
    run((J) => J.evaluate({ a: [1, 2] }, '$.a[*]')),
    [1, 2],
  );

  errorNames.forEach((errorName) => {
    assert.strictEqual(JSONPath[errorName].name, errorName);
    assert.strictEqual(new JSONPath[errorName]('message').name, errorName);
  });

  assert.throws(
    () => JSONPath.evaluate({}, '$.'),
    (error) => error.name === 'JSONPathParseError' && /expected .*"A-Z"/.test(error.message),
  );

  assert.strictEqual(typeof new JSONPath.Grammar().toString(), 'string');

  // apg-lite >= 1.0.7 escapes XML special characters, also in the bundled copies
  const xml = JSONPath.parse("$['a<b&c']", { translator: new JSONPath.XMLTranslator() }).tree;
  assert.ok(xml.includes('a&lt;b&amp;c'), 'XML special characters are escaped');

  console.log(`ok ${label}`);
};

const main = async () => {
  check('CommonJS', require(name));
  check('ES module', await import(name));

  // dist/ is not exported, so the bundles are required as consumers vendoring them do:
  // copied into a CommonJS context (the package itself is "type": "module")
  const vendorDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonpath-'));

  ['jsonpath.browser.js', 'jsonpath.browser.min.js'].forEach((file) => {
    const bundlePath = path.join(root, 'dist', file);
    const vendoredPath = path.join(vendorDir, file.replace(/\.js$/, '.cjs'));

    fs.copyFileSync(bundlePath, vendoredPath);
    check(`UMD require ${file}`, require(vendoredPath));

    const context = {};
    context.self = context;
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(bundlePath, 'utf8'), context);
    context.run = (fn) => vm.runInContext(`(${fn})(JSONPath)`, context);
    check(`UMD browser global ${file}`, context.JSONPath, context.run);
  });
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
