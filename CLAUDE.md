# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@swaggerexpert/jsonpath` is a **parser** and **validator** for [RFC 9535](https://www.rfc-editor.org/rfc/rfc9535) JSONPath Query Expressions. It does NOT evaluate JSONPath against JSON data - it only parses and validates the query syntax.

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
- **`src/test/index.js`** - Simple validation (returns boolean)
- **`src/compile.js`** - Compile selectors to normalized path strings
- **`src/escape.js`** - Escape special characters in name selectors

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
