# @swaggerexpert/jsonpath

[![npmversion](https://img.shields.io/npm/v/%40swaggerexpert%2Fjsonpath?style=flat-square&label=npm%20package&color=%234DC81F&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40swaggerexpert%2Fjsonpath)](https://www.npmjs.com/package/@swaggerexpert/jsonpath)
[![npm](https://img.shields.io/npm/dm/@swaggerexpert/jsonpath)](https://www.npmjs.com/package/@swaggerexpert/jsonpath)
[![Test workflow](https://github.com/swaggerexpert/jsonpath/actions/workflows/test.yml/badge.svg)](https://github.com/swaggerexpert/jsonpath/actions)
[![Dependabot enabled](https://img.shields.io/badge/Dependabot-enabled-blue.svg)](https://dependabot.com/)
[![try on RunKit](https://img.shields.io/badge/try%20on-RunKit-brightgreen.svg?style=flat)](https://npm.runkit.com/@swaggerexpert/jsonpath)
[![Tidelift](https://tidelift.com/badges/package/npm/@swaggerexpert%2Fjsonpath)](https://tidelift.com/subscription/pkg/npm-.swaggerexpert-jsonpath?utm_source=npm-swaggerexpert-jsonpath&utm_medium=referral&utm_campaign=readme)

`@swaggerexpert/jsonpath` is a **parser**, **validator**, **compiler**, and **evaluator** for [RFC 9535](https://www.rfc-editor.org/rfc/rfc9535) Query Expressions for JSON - **JSONPath**.

The development of this library contributed to the identification and formal submission of following **erratas** against the RFC 9535:
- [Errata ID: 8343](https://www.rfc-editor.org/errata/eid8343)
- [Errata ID: 8352](https://www.rfc-editor.org/errata/eid8352)
- [Errata ID: 8353](https://www.rfc-editor.org/errata/eid8353)
- [Errata ID: 8354](https://www.rfc-editor.org/errata/eid8354)

This library is **100% compliant** with the [JSONPath Compliance Test Suite](https://github.com/jsonpath-standard/jsonpath-compliance-test-suite).

<table>
  <tr>
    <td align="right" valign="middle">
        <img src="https://cdn2.hubspot.net/hubfs/4008838/website/logos/logos_for_download/Tidelift_primary-shorthand-logo.png" alt="Tidelift" width="60" />
      </td>
      <td valign="middle">
        <a href="https://tidelift.com/subscription/pkg/npm-.swaggerexpert-jsonpath?utm_source=npm-swaggerexpert-jsonpath&utm_medium=referral&utm_campaign=readme">
            Get professionally supported @swaggerexpert/jsonpath with Tidelift Subscription.
        </a>
      </td>
  </tr>
</table>

## Table of Contents

- [Getting started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Parsing](#parsing)
      - [Normalized paths](#normalized-paths)
      - [Translators](#translators)
        - [CST](#cst-translator)
        - [CST Optimized](#cst-optimized-translator)
        - [AST](#ast-translator)
        - [XML](#xml-translator)
      - [Statistics](#statistics)
      - [Tracing](#tracing)
    - [Validation](#validation)
    - [Normalized paths](#normalized-paths-1)
    - [Evaluation](#evaluation)
      - [Collecting normalized paths](#collecting-normalized-paths)
      - [Built-in functions](#built-in-functions)
      - [Custom functions](#custom-functions)
      - [Evaluation realms](#evaluation-realms)
    - [Errors](#errors)
    - [Grammar](#grammar)
- [More about JSONPath](#more-about-jsonpath)
- [Setting up for development](#setting-up-for-development)
- [License](#license)

## Getting started

### Installation

You can install `@swaggerexpert/jsonpath` using `npm`:

```sh
 $ npm install @swaggerexpert/jsonpath
```

### Usage

`@swaggerexpert/jsonpath` supports **parsing**, **validation**, **compilation**, and **evaluation** of JSONPath expressions.
The parser and validator are based on a superset of [ABNF](https://www.rfc-editor.org/rfc/rfc5234) ([SABNF](https://cs.github.com/ldthomas/apg-js2/blob/master/SABNF.md))
and use [apg-lite](https://github.com/ldthomas/apg-lite) parser generator.

#### Parsing

Parsing a JSONPath Query expression is as simple as importing the **parse** function and calling it.

```js
import { parse } from '@swaggerexpert/jsonpath';

const parseResult = parse('$.store.book[0].title');
```

**parseResult** variable has the following shape:

```
{
  result: <ParseResult['result]>,
  tree: <ParseResult['tree']>,
  stats: <ParseResult['stats']>,
  trace: <ParseResult['trace']>,
}
```

[TypeScript typings](https://github.com/swaggerexpert/jsonpath/blob/main/types/index.d.ts) are available for all fields attached to parse result object returned by the `parse` function.


##### Normalized paths

[comment]: <> (SPDX-FileCopyrightText: Copyright &#40;c&#41; 2024 IETF Trust and the persons identified as the document authors. All rights reserved.)
[comment]: <> (SPDX-License-Identifier: BSD-3-Clause)

[Normalized Path](https://www.rfc-editor.org/rfc/rfc9535#name-normalized-paths) is a JSONPath query with restricted syntax.
A Normalized Path represents the identity of a node in a specific value.
There is precisely one Normalized Path identifying any particular node in a value.
Normalized Paths provide a predictable format that simplifies testing and post-processing of nodelists, e.g., to remove duplicate nodes.
Normalized Paths use the canonical bracket notation, rather than dot notation.
Single quotes are used in Normalized Paths to delimit string member names. This reduces the number of characters that need escaping when Normalized Paths appear in strings delimited by double quotes.

Parsing in normalized path mode can be enabled by setting `normalized` option to `true`.

```js
import { parse } from '@swaggerexpert/jsonpath';

parse("$['a']", { normalized: true });
parse("$[1]", { normalized: true });
parse("$[2]", { normalized: true });
parse("$['a']['b'][1]", { normalized: true });
parse("$['\\u000b']", { normalized: true });
```

##### Translators

`@swaggerexpert/jsonpath` provides several translators to convert the parse result into different tree representations.

###### CST translator

[Concrete Syntax Tree](https://en.wikipedia.org/wiki/Parse_tree) (Parse tree) representation is available on parse result
when instance of `CSTTranslator` is provided via a `translator` option to the `parse` function.
CST is suitable to be consumed by other tools like IDEs, editors, etc...

```js
import { parse, CSTTranslator } from '@swaggerexpert/jsonpath';

const { tree: CST } = parse('$.store.book[0].title', { translator: new CSTTranslator() });
```

CST tree has a shape documented by [TypeScript typings (CSTTree)](https://github.com/swaggerexpert/jsonpath/blob/main/types/index.d.ts).

###### CST Optimized translator

Same as CST, but optimizes the tree for more optimized representation. By default, it collapses
fragmented `single-quoted`, `double-quoted` or `normal-single-quoted` nodes into a single node.
`text`, `segments` and `singular-query-segments` nodes, when empty, are removed from the tree.

```js
import { parse, CSTOptimizedTranslator } from '@swaggerexpert/jsonpath';

const { tree: CST } = parse('$.store.book[0].title', { translator: new CSTOptimizedTranslator() });
```

###### AST translator

**Default translator**. [Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) representation is available on parse result
by default or when instance of `ASTTranslator` is provided via a `translator` option to the `parse` function.
AST is suitable to be consumed by implementations that need to analyze the structure of the JSONPath expression
or for building a custom JSONPath evaluation engine.

```js
import { parse } from '@swaggerexpert/jsonpath';

const { tree: AST } = parse('$.store.book[0].title');
```

or

```js
import { parse, ASTTranslator } from '@swaggerexpert/jsonpath';

const { tree: AST } = parse('$.store.book[0].title', { translator: new ASTTranslator() });
```

AST tree has a shape documented by [TypeScript typings (ASTTree)](https://github.com/swaggerexpert/jsonpath/blob/main/types/index.d.ts).

###### XML translator

```js
import { parse, XMLTranslator } from '@swaggerexpert/jsonpath';

const { tree: XML } = parse('$.store.book[0].title', { translator: new XMLTranslator() });
```

##### Statistics

`parse` function returns additional statistical information about the parsing process.
Collection of the statistics can be enabled by setting `stats` option to `true`.

```js
import { parse } from '@swaggerexpert/jsonpath';

const { stats } = parse('$.store.book[0].title', { stats: true });

stats.displayStats(); // returns operator stats
stats.displayHits(); // returns rules grouped by hit count
```

##### Tracing

`parse` function returns additional tracing information about the parsing process.
Tracing can be enabled by setting `trace` option to `true`. Tracing is essential
for debugging failed matches or analyzing rule execution flow.

```js
import { parse } from '@swaggerexpert/jsonpath';

const { result, trace } = parse('$fdfadfd', { trace: true });

result.success; // returns false
trace.displayTrace(); // returns trace information
trace.inferExpectations(); // returns parser expectations
```

By combining information from `result` and `trace`, you can analyze the parsing process in detail
and generate messages like: `'Syntax error at position 1, expected "[", ".", ".."'`. Please see this
[test file](https://github.com/swaggerexpert/jsonpath/blob/main/test/parse/trace.js) for more information how to achieve that.

#### Validation

`@swaggerexpert/jsonpath` provides a `test` function to validate JSONPath expressions.

```js
import { test } from '@swaggerexpert/jsonpath';

test('$.store.book[0].title'); // => true
test('$$'); // => false
```

**Normalized paths** can be validated by setting `normalized` option to `true`.

```js
import { test } from '@swaggerexpert/jsonpath';

test("$['a']", { normalized: true }); // => true
test('$.store.book[0].title', { normalized: true }); // => false
```

**Well-typedness validation** is enabled by default and validates the JSONPath expression against [RFC 9535 type system rules](https://www.rfc-editor.org/rfc/rfc9535#section-2.4.9)
(e.g., function argument types, return type usage). Set `wellTyped` option to `false` to perform syntax-only validation.

```js
import { test } from '@swaggerexpert/jsonpath';

test('$[?length(@.*) < 3]'); // => false (non-singular query for ValueType parameter)
test('$[?length(@.*) < 3]', { wellTyped: false }); // => true (syntax is valid)
```

#### Normalized paths

The `NormalizedPath` namespace provides utilities for working with [Normalized Paths](https://www.rfc-editor.org/rfc/rfc9535#name-normalized-paths).

##### NormalizedPath.test

Tests if a string is a valid normalized JSONPath. This is a convenience wrapper around `test(path, { normalized: true })`.

```js
import { NormalizedPath } from '@swaggerexpert/jsonpath';

NormalizedPath.test("$['a']"); // => true
NormalizedPath.test('$[0]'); // => true
NormalizedPath.test("$['store']['book'][0]['title']"); // => true
NormalizedPath.test('$.a'); // => false (dot notation not allowed)
NormalizedPath.test('$["a"]'); // => false (double quotes not allowed)
NormalizedPath.test('$[*]'); // => false (wildcard not allowed)
```

##### NormalizedPath.from

Creates a normalized path string from a list of selectors. Name selectors are automatically escaped.

```js
import { NormalizedPath } from '@swaggerexpert/jsonpath';

NormalizedPath.from(['store', 'book', 0, 'title']); // => "$['store']['book'][0]['title']"
NormalizedPath.from(["it's"]); // => "$['it\\'s']"
```

##### NormalizedPath.to

Parses a normalized path string and returns a list of selectors.

```js
import { NormalizedPath } from '@swaggerexpert/jsonpath';

NormalizedPath.to("$['store']['book'][0]['title']"); // => ['store', 'book', 0, 'title']
NormalizedPath.to("$['it\\'s']"); // => ["it's"]
```

##### NormalizedPath.escape

Escapes special characters in name selectors for use in normalized paths.
The apostrophe (`'`) and backslash (`\`) characters must be escaped.
Control characters (U+0000 through U+001F) are escaped using specific escape sequences
(`\b`, `\t`, `\n`, `\f`, `\r`) or Unicode escape sequences (`\uXXXX`).

```js
import { NormalizedPath } from '@swaggerexpert/jsonpath';

NormalizedPath.escape("it's"); // => "it\\'s"
NormalizedPath.escape('back\\slash'); // => "back\\\\slash"
NormalizedPath.escape('line\nfeed'); // => "line\\nfeed"
```

#### Evaluation

Evaluation is the process of applying a JSONPath expression against a JSON value to produce a nodelist (array of matched values).
Per [RFC 9535](https://www.rfc-editor.org/rfc/rfc9535#section-2.1), evaluation begins with the root value (`$`) and processes each
segment sequentially, producing a nodelist of all matching values.

```js
import { evaluate } from '@swaggerexpert/jsonpath';

const value = {
  store: {
    book: [
      { title: 'A', price: 10 },
      { title: 'B', price: 20 }
    ]
  }
};

evaluate(value, '$.store.book[*].title'); // => ['A', 'B']
evaluate(value, '$.store.book[0]'); // => [{ title: 'A', price: 10 }]
evaluate(value, '$.store.book[?@.price > 15]'); // => [{ title: 'B', price: 20 }]
```

##### Collecting normalized paths

Use the `callback` option to collect [normalized paths](https://www.rfc-editor.org/rfc/rfc9535#name-normalized-paths) alongside matched values:

```js
import { evaluate } from '@swaggerexpert/jsonpath';

const value = { store: { book: [{ title: 'A' }, { title: 'B' }] } };
const paths = [];

evaluate(value, '$.store.book[*].title', {
  callback: (v, path) => paths.push(path)
});
// paths => ["$['store']['book'][0]['title']", "$['store']['book'][1]['title']"]
```

##### Built-in functions

The evaluation engine includes all [RFC 9535 Section 2.4](https://www.rfc-editor.org/rfc/rfc9535#section-2.4) functions:

| Function | Description |
|----------|-------------|
| `length(value)` | Returns the length of a string, array, or object |
| `count(nodelist)` | Returns the number of nodes in a nodelist |
| `match(string, regex)` | Tests if a string matches an I-Regexp pattern (full match) |
| `search(string, regex)` | Tests if a string contains an I-Regexp pattern |
| `value(nodelist)` | Extracts a single value from a nodelist |

```js
import { evaluate } from '@swaggerexpert/jsonpath';

const value = { items: ['short', 'very long string', 'medium'] };

evaluate(value, '$.items[?length(@) > 5]'); // => ['very long string', 'medium']
evaluate(value, '$.items[?match(@, "^v.*")]'); // => ['very long string']
```

##### Custom functions

Extend or override built-in functions via the `functions` option:

```js
import { evaluate, functions } from '@swaggerexpert/jsonpath';

const customFunctions = {
  ...functions,
  min: (ctx, args) => {
    const values = args[0];
    if (!Array.isArray(values)) return undefined;
    return Math.min(...values);
  }
};

const value = { numbers: [3, 1, 4, 1, 5] };
evaluate(value, '$[?min($.numbers) == 1]', { functions: customFunctions });
```

##### Evaluation realms

Evaluation realms provide an abstraction layer for accessing different data structures during JSONPath evaluation.
By default, the evaluation engine uses the **JSON Evaluation Realm** which works with plain JavaScript objects and arrays.

###### JSON Evaluation Realm

By default, the evaluation operates under the **JSON realm**, which assumes that:

- **Arrays** are indexed numerically
- **Objects** (plain JavaScript objects) are accessed by string keys

```js
import { evaluate } from '@swaggerexpert/jsonpath';

const value = { store: { book: [{ title: 'A' }] } };
evaluate(value, '$.store.book[*].title'); // => ['A']
```

The default realm can also be specified explicitly:

```js
import { evaluate, JSONEvaluationRealm } from '@swaggerexpert/jsonpath';

const value = { store: { book: [{ title: 'A' }] } };
evaluate(value, '$.store.book[*].title', { realm: new JSONEvaluationRealm() }); // => ['A']
```

###### Custom Evaluation Realms

You can create custom evaluation realms to work with different data structures (e.g., Immutable.js, ApiDOM elements).
Extend the `EvaluationRealm` base class and implement the required methods:

| Method | Description |
|--------|-------------|
| `isObject(value)` | Check if value is an object (has named properties) |
| `isArray(value)` | Check if value is an array (has indexed elements) |
| `isString(value)` | Check if value is a string |
| `isNumber(value)` | Check if value is a number |
| `isBoolean(value)` | Check if value is a boolean |
| `isNull(value)` | Check if value is null |
| `getString(value)` | Get raw string value for regex operations |
| `getProperty(value, key)` | Get property by name from object |
| `hasProperty(value, key)` | Check if object has property |
| `getElement(value, index)` | Get element by index from array |
| `getKeys(value)` | Get all keys of object |
| `getLength(value)` | Get length of string, array, or object |
| `entries(value)` | Iterate over [key/index, value] pairs |
| `compare(left, op, right)` | Compare two values using operator (==, !=, <, <=, >, >=) |

```js
import { evaluate, EvaluationRealm } from '@swaggerexpert/jsonpath';

class CustomRealm extends EvaluationRealm {
  name = 'custom';

  isObject(value) { /* ... */ }
  isArray(value) { /* ... */ }
  // ... implement all required methods
}

const value = { /* ... */ };
evaluate(value, '$.path', { realm: new CustomRealm() });
```

#### Errors

`@swaggerexpert/jsonpath` provides a structured error class hierarchy,
enabling precise error handling across JSONPath operations, including parsing, compilation, and evaluation.

```js
import { JSONPathError, JSONPathParseError, JSONNormalizedPathError, JSONPathEvaluateError } from '@swaggerexpert/jsonpath';
```

**JSONPathError** is the base class for all JSONPath errors.

#### Grammar

New grammar instance can be created in following way:

```js
import { Grammar } from '@swaggerexpert/jsonpath';

const grammar = new Grammar();
```

To obtain original ABNF (SABNF) grammar as a string:

```js
import { Grammar } from '@swaggerexpert/jsonpath';

const grammar = new Grammar();

grammar.toString();
// or
String(grammar);
```

## More about JSONPath

JSONPath is defined by the following [ABNF](https://tools.ietf.org/html/rfc5234) syntax

[comment]: <> (SPDX-FileCopyrightText: Copyright &#40;c&#41; 2024 IETF Trust and the persons identified as the document authors. All rights reserved.)
[comment]: <> (SPDX-License-Identifier: BSD-3-Clause)

```abnf
; JSONPath: Query Expressions for JSON
; https://www.rfc-editor.org/rfc/rfc9535

; https://www.rfc-editor.org/rfc/rfc9535#section-2.1.1
jsonpath-query      = root-identifier segments
segments            = *(S segment)

B                   = %x20 /    ; Space
                      %x09 /    ; Horizontal tab
                      %x0A /    ; Line feed or New line
                      %x0D      ; Carriage return
S                   = *B        ; optional blank space

; https://www.rfc-editor.org/rfc/rfc9535#section-2.2.1
root-identifier     = "$"

; https://www.rfc-editor.org/rfc/rfc9535#section-2.3
selector            = name-selector /
                      wildcard-selector /
                      slice-selector /
                      index-selector /
                      filter-selector

; https://www.rfc-editor.org/rfc/rfc9535#section-2.3.1.1
name-selector       = string-literal

string-literal      = dquote *double-quoted dquote /     ; "string", MODIFICATION: surrogate text rule used
                      squote *single-quoted squote      ; 'string', MODIFICATION: surrogate text rule used

double-quoted       = unescaped /
                      %x27      /                    ; '
                      ESC %x22  /                    ; \"
                      ESC escapable

single-quoted       = unescaped /
                      %x22      /                    ; "
                      ESC %x27  /                    ; \'
                      ESC escapable

ESC                 = %x5C                           ; \ backslash

unescaped           = %x20-21 /                      ; see RFC 8259
                         ; omit 0x22 "
                      %x23-26 /
                         ; omit 0x27 '
                      %x28-5B /
                         ; omit 0x5C \
                      %x5D-D7FF /
                         ; skip surrogate code points
                      %xE000-10FFFF

escapable           = %x62 / ; b BS backspace U+0008
                      %x66 / ; f FF form feed U+000C
                      %x6E / ; n LF line feed U+000A
                      %x72 / ; r CR carriage return U+000D
                      %x74 / ; t HT horizontal tab U+0009
                      "/"  / ; / slash (solidus) U+002F
                      "\"  / ; \ backslash (reverse solidus) U+005C
                      (%x75 hexchar) ;  uXXXX U+XXXX

hexchar             = non-surrogate /
                      (high-surrogate "\" %x75 low-surrogate)
non-surrogate       = ((DIGIT / "A"/"B"/"C" / "E"/"F") 3HEXDIG) /
                      ("D" %x30-37 2HEXDIG )
high-surrogate      = "D" ("8"/"9"/"A"/"B") 2HEXDIG
low-surrogate       = "D" ("C"/"D"/"E"/"F") 2HEXDIG

HEXDIG              = DIGIT / "A" / "B" / "C" / "D" / "E" / "F"

; https://www.rfc-editor.org/rfc/rfc9535#section-2.3.2.1
wildcard-selector   = "*"

; https://www.rfc-editor.org/rfc/rfc9535#section-2.3.3.1
index-selector      = int                        ; decimal integer

int                 = "0" /
                      (["-"] DIGIT1 *DIGIT)      ; - optional
DIGIT1              = %x31-39                    ; 1-9 non-zero digit

; https://www.rfc-editor.org/rfc/rfc9535#section-2.3.4.1
slice-selector      = [start S] colon S [end S] [colon [S step ]] ; MODIFICATION: surrogate text rule used

start               = int       ; included in selection
end                 = int       ; not included in selection
step                = int       ; default: 1

; https://www.rfc-editor.org/rfc/rfc9535#section-2.3.5.1
filter-selector     = questionmark S logical-expr ; MODIFICATION: surrogate text rule used

logical-expr        = logical-or-expr
logical-or-expr     = logical-and-expr *(S disjunction S logical-and-expr) ; MODIFICATION: surrogate text rule used
                        ; disjunction
                        ; binds less tightly than conjunction
logical-and-expr    = basic-expr *(S conjunction S basic-expr) ; MODIFICATION: surrogate text rule used
                        ; conjunction
                        ; binds more tightly than disjunction

basic-expr          = paren-expr /
                      comparison-expr /
                      test-expr

paren-expr          = [logical-not-op S] left-paren S logical-expr S right-paren ; MODIFICATION: surrogate text rule used
                                        ; parenthesized expression
logical-not-op      = "!"               ; logical NOT operator

test-expr           = [logical-not-op S]
                      (filter-query / ; existence/non-existence
                       function-expr) ; LogicalType or NodesType
filter-query        = rel-query / jsonpath-query
rel-query           = current-node-identifier segments
current-node-identifier = "@"

comparison-expr     = comparable S comparison-op S comparable
literal             = number / string-literal /
                      true / false / null
comparable          = singular-query / ; singular query value
                      function-expr /  ; ValueType
                      literal
                      ; MODIFICATION: https://www.rfc-editor.org/errata/eid8352
comparison-op       = "==" / "!=" /
                      "<=" / ">=" /
                      "<"  / ">"

singular-query      = rel-singular-query / abs-singular-query
rel-singular-query  = current-node-identifier singular-query-segments
abs-singular-query  = root-identifier singular-query-segments
singular-query-segments = *(S (name-segment / index-segment))
name-segment        = (left-bracket name-selector right-bracket) / ; MODIFICATION: surrogate text rule used
                      (dot-prefix member-name-shorthand) ; MODIFICATION: surrogate text rule used
index-segment       = left-bracket index-selector right-bracket ; MODIFICATION: surrogate text rule used

number              = (int / "-0") [ frac ] [ exp ] ; decimal number
frac                = "." 1*DIGIT                  ; decimal fraction
exp                 = "e" [ "-" / "+" ] 1*DIGIT    ; decimal exponent
true                = %x74.72.75.65                ; true
false               = %x66.61.6c.73.65             ; false
null                = %x6e.75.6c.6c                ; null

; https://www.rfc-editor.org/rfc/rfc9535#section-2.4
function-name       = function-name-first *function-name-char
function-name-first = LCALPHA
function-name-char  = function-name-first / "_" / DIGIT
LCALPHA             = %x61-7A  ; "a".."z"

function-expr       = function-name left-paren S [function-argument ; MODIFICATION: surrogate text rule used
                         *(S comma S function-argument)] S right-paren ; MODIFICATION: surrogate text rule used
function-argument   = logical-expr / ; MODIFICATION: https://www.rfc-editor.org/errata/eid8343
                      filter-query / ; (includes singular-query)
                      function-expr /
                      literal


; https://www.rfc-editor.org/rfc/rfc9535#section-2.5
segment             = child-segment / descendant-segment

; https://www.rfc-editor.org/rfc/rfc9535#section-2.5.1.1
child-segment       = bracketed-selection /
                      (dot-prefix ; MODIFICATION: surrogate text rule used
                       (wildcard-selector /
                        member-name-shorthand))

bracketed-selection = left-bracket S selector *(S comma S selector) S right-bracket
                    ; MODIFICATION: surrogate text rule used

member-name-shorthand = name-first *name-char
name-first          = ALPHA /
                      "_"   /
                      %x80-D7FF /
                         ; skip surrogate code points
                      %xE000-10FFFF
name-char           = name-first / DIGIT

DIGIT               = %x30-39              ; 0-9
ALPHA               = %x41-5A / %x61-7A    ; A-Z / a-z

; https://www.rfc-editor.org/rfc/rfc9535#section-2.5.2.1
descendant-segment  = double-dot-prefix (bracketed-selection / ; MODIFICATION: surrogate text rule used
                                         wildcard-selector /
                                         member-name-shorthand)

; https://www.rfc-editor.org/rfc/rfc9535#name-normalized-paths
normalized-path      = root-identifier *(normal-index-segment)
normal-index-segment = left-bracket normal-selector right-bracket ; MODIFICATION: surrogate text rule used
normal-selector      = normal-name-selector / normal-index-selector
normal-name-selector = squote *normal-single-quoted squote ; 'string', MODIFICATION: surrogate text rule used
normal-single-quoted = normal-unescaped /
                       ESC normal-escapable
normal-unescaped     =    ; omit %x0-1F control codes
                       %x20-26 /
                          ; omit 0x27 '
                       %x28-5B /
                          ; omit 0x5C \
                       %x5D-D7FF /
                          ; skip surrogate code points
                       %xE000-10FFFF

normal-escapable     = %x62 / ; b BS backspace U+0008
                       %x66 / ; f FF form feed U+000C
                       %x6E / ; n LF line feed U+000A
                       %x72 / ; r CR carriage return U+000D
                       %x74 / ; t HT horizontal tab U+0009
                       "'" /  ; ' apostrophe U+0027
                       "\" /  ; \ backslash (reverse solidus) U+005C
                       (%x75 normal-hexchar)
                                       ; certain values u00xx U+00XX
normal-hexchar       = "0" "0"
                       (
                          ("0" %x30-37) / ; "00"-"07"
                             ; omit U+0008-U+000A BS HT LF
                          ("0" %x62) /    ; "0b"
                             ; omit U+000C-U+000D FF CR
                          ("0" %x65-66) / ; "0e"-"0f"
                          ("1" normal-HEXDIG)
                       )
normal-HEXDIG        = DIGIT / %x61-66    ; "0"-"9", "a"-"f"
normal-index-selector = "0" / (DIGIT1 *DIGIT)
                        ; non-negative decimal integer

; Surrogate named rules
dot-prefix          = "."
double-dot-prefix   = ".."
left-bracket        = "["
right-bracket       = "]"
left-paren          = "("
right-paren         = ")"
comma               = ","
colon               = ":"
dquote              = %x22 ; "
squote              = %x27 ; '
questionmark        = "?"
disjunction         = "||"
conjunction         = "&&"
```

## Setting up for development

```sh
 # Clone with submodules (recommended)
 $ git clone --recurse-submodules https://github.com/swaggerexpert/jsonpath.git

 # Or initialize submodules after cloning
 $ git submodule update --init

 # Install dependencies
 $ npm install
```

The project uses the [JSONPath Compliance Test Suite](https://github.com/jsonpath-standard/jsonpath-compliance-test-suite) as a git submodule for testing.

## License

`@swaggerexpert/jsonpath` is licensed under [Apache 2.0 license](https://github.com/swaggerexpert/jsonpath/blob/main/LICENSE).
`@swaggerexpert/jsonpath` comes with an explicit [NOTICE](https://github.com/swaggerexpert/jsonpath/blob/main/NOTICE) file
containing additional legal notices and information.
