/**
 * The package is "type": "module", so TypeScript treats types/**\/*.d.ts as ES module declarations.
 * CommonJS consumers (moduleResolution node16/nodenext) need CommonJS declarations,
 * otherwise they fail with TS1479. This script generates a .d.cts copy of every .d.ts file,
 * rewriting relative references of .js declarations to .cjs declarations.
 */
const fs = require('node:fs');
const path = require('node:path');

const typesDir = path.join(__dirname, '..', 'types');

const collect = (dir, suffix) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collect(entryPath, suffix);
    return entry.name.endsWith(suffix) ? [entryPath] : [];
  });

// relative specifier ending with .js in quotes, e.g. '../../index.js'
const relativeJSSpecifier = /(['"])(\.{1,2}\/[^'"]*)\.js\1/g;

// stale declarations of removed .d.ts files must not be published
collect(typesDir, '.d.cts').forEach((file) => fs.rmSync(file));

collect(typesDir, '.d.ts').forEach((file) => {
  const source = fs.readFileSync(file, 'utf8');
  // covers import/export ... from, import(), require(), side-effect imports and declare module
  const output = source.replace(relativeJSSpecifier, '$1$2.cjs$1');
  const unresolved = output.match(/(['"])\.{1,2}\/[^'"]*\1/g)?.filter((s) => !/\.cjs['"]$/.test(s));

  if (unresolved?.length) {
    throw new Error(
      `${path.relative(typesDir, file)}: relative specifiers must end with .js: ${unresolved}`,
    );
  }

  fs.writeFileSync(file.replace(/\.d\.ts$/, '.d.cts'), output);
});
