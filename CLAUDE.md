# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@swaggerexpert/jsonpath` is a complete [RFC 9535](https://www.rfc-editor.org/rfc/rfc9535) JSONPath implementation providing **parsing**, **validation**, and **evaluation** of JSONPath Query Expressions. The library passes 100% of the JSONPath Compliance Test Suite.

## Getting Started

```bash
# Clone with submodules (recommended)
git clone --recurse-submodules <repo-url>

# Or initialize submodules after cloning
git submodule update --init

# Install dependencies
npm i
```

The project uses the [JSONPath Compliance Test Suite](https://github.com/jsonpath-standard/jsonpath-compliance-test-suite) as a git submodule at `test/jsonpath-compliance-test-suite/`.

## Commands

```bash
npm test                    # Run all tests with mocha
npm test -- --grep "pattern" # Run specific tests matching pattern
npm run build               # Build ES modules and CommonJS (compiles grammar first)
npm run grammar:compile     # Compile ABNF grammar to JavaScript
npm run test:watch          # Watch mode for tests
```

## Architecture

### Parser Pipeline

```
JSONPath string → Grammar (ABNF) → apg-lite parser → Translator → Tree (CST/AST/XML)
```

1. **Grammar** (`src/grammar.bnf` → `src/grammar.js`): RFC 9535 ABNF grammar compiled via apg-js
2. **Parser** (`src/parse/index.js`): Uses apg-lite to parse against grammar rules
3. **Translators** (`src/parse/translators/`): Convert parse results to different tree formats
   - `CSTTranslator` - Concrete Syntax Tree (full parse tree)
   - `CSTOptimizedTranslator` - Optimized CST with collapsed nodes
   - `ASTTranslator` - Abstract Syntax Tree (default, for evaluation engines)
   - `XMLTranslator` - XML representation

### Key Modules

- **`src/parse/`** - Core parsing logic with translators and tracing
- **`src/parse/translators/ASTTranslator/`** - AST generation with `decoders.js` for string escape handling and `transformers.js` for node transformation
- **`src/evaluate/`** - JSONPath evaluation engine
- **`src/test/index.js`** - Simple validation (returns boolean)
- **`src/compile.js`** - Compile selectors to normalized path strings
- **`src/escape.js`** - Escape special characters in name selectors

### Evaluation Engine (`src/evaluate/`)

```
AST → Iterative Stack-based Evaluation → Callback Results
```

**Architecture:**
- **Iterative evaluation with explicit stack** - Avoids call stack overflow on deeply nested documents
- **Callback-based streaming API** - Results streamed via callback, memory efficient
- **Visitor pattern** - Each selector type has dedicated visitor function
- **Realm abstraction** - Pluggable data model support (not just plain JS objects)

**Directory structure:**
- `visitors/` - Selector implementations (name, index, wildcard, slice, filter)
- `evaluators/` - Filter expression evaluation (logical, comparison, function)
- `functions/` - RFC 9535 functions (length, count, match, search, value)
- `realms/` - Data model abstractions (JSON realm is default)
- `utils/` - Guards, I-Regexp utilities

**Nothing type:** Uses `undefined` to represent "no value" in comparisons. Safe because JSON has no undefined value, so no collision possible.

**NodeList detection:** Arrays from filter queries are marked with a non-enumerable `_isNodelist` property to distinguish them from regular JSON arrays for correct comparison semantics.

### Dual Module Support

The library supports both ESM and CommonJS:
- Source in `src/` (ES modules)
- Built to `es/` (.mjs) and `cjs/` (.cjs) via Babel

## Design Decisions

### String Decoding (`src/parse/translators/ASTTranslator/decoders.js`)

**Character-by-character parsing instead of regex chains:**
- CodeQL flagged chained `.replace()` calls as potentially unsafe
- Explicit handling avoids regex ordering issues (e.g., `\\'` being mishandled)
- Control flow is clear and auditable

**Grammar validates, decoder decodes:**
- The ABNF grammar validates escape sequences (e.g., `\uXXXX` requires exactly 4 hex digits)
- Invalid sequences are rejected at parse time with `result.success === false`
- The decoder trusts grammar-validated input and only performs conversion (no validation)
- This avoids unreachable/untestable error handling code in the decoder

**Why decoder logic is still needed:**
- JSON.parse can't be used directly because JSON only supports double-quoted strings
- Single-quoted JSONPath strings have different escaping rules (e.g., `\'` is valid)
- The decoder converts escape sequences to actual characters, then uses JSON.stringify/parse

**Supported escape sequences (RFC 9535 Section 2.3.1.2):**
`\'`, `\"`, `\\`, `\/`, `\b`, `\f`, `\n`, `\r`, `\t`, `\uXXXX`

### Grammar Modifications

The grammar includes modifications from standard RFC 9535 ABNF for parser compatibility (marked with "MODIFICATION" comments). Also incorporates fixes for RFC errata: 8343, 8352, 8353, 8354.

### Custom Evaluation Realms (`src/evaluate/realms/`)

The evaluation engine supports custom "realms" - pluggable data model abstractions that allow JSONPath to work with different data representations beyond plain JavaScript objects/arrays.

**Base class:** `EvaluationRealm` defines the interface:
- `isObject(value)`, `isArray(value)`, `isString(value)`, `isNumber(value)`, `isBoolean(value)`, `isNull(value)` - Type predicates
- `getString(value)` - Extract string for regex operations
- `getProperty(value, key)`, `hasProperty(value, key)` - Object member access
- `getElement(value, index)` - Array element access
- `getKeys(value)` - Get object keys
- `getLength(value)` - Get length (string: Unicode scalar values, array: elements, object: members)
- `entries(value)` - Iterate as `[key/index, value]` pairs
- `compare(left, operator, right)` - Comparison with proper type semantics

**Default realm:** `JSONEvaluationRealm` works with plain JavaScript objects and arrays.

**Creating custom realms:** Extend `EvaluationRealm` and implement all methods. Key considerations:
- `compare()` must handle `-0` normalization (JSON treats `-0` and `0` as equal per RFC 9535)
- `getLength()` for strings must count Unicode scalar values, not UTF-16 code units
- Use your data model's native equality for `==`/`!=` comparisons
- Handle "Nothing" (undefined) comparisons: `Nothing == Nothing` is true, `Nothing == value` is false

**Usage:**
```javascript
import { evaluate } from '@swaggerexpert/jsonpath';
const realm = new MyCustomRealm();
const results = evaluate(data, '$.store.book[*].title', { realm });
```

### I-Regexp Implementation (`src/evaluate/utils/i-regexp.js`)

RFC 9535 uses I-Regexp (RFC 9485) for `match()` and `search()` functions. The implementation uses a hybrid approach:

**Validation** - Rejects non-I-Regexp features:
- Backreferences (`\1`, `\2`, etc.)
- Lookahead/lookbehind assertions (`(?=`, `(?!`, `(?<=`, `(?<!`)
- Named capture groups (`(?<name>`)
- Word boundaries outside character classes (`\b`, `\B`)

**Transformation** - Converts I-Regexp to ECMAScript:
- `.` outside character classes becomes `[^\n\r]` (I-Regexp dot doesn't match newlines)

**Caching** - Compiled regexes are cached for performance.

**Unicode mode** - All regexes use the `'u'` flag for proper Unicode handling.

### Numeric Comparison Semantics

JSON doesn't distinguish `-0` from `0`. JavaScript's `===` operator treats them as equal (`-0 === 0` is `true`), so the default JSON realm works correctly. However, custom realms using `Object.is()` or similar strict equality must normalize `-0` to `0` before comparisons to comply with RFC 9535.
