# @swaggerexpert/jsonpath

[![npmversion](https://img.shields.io/npm/v/%40swaggerexpert%2Fjsonpath?style=flat-square&label=npm%20package&color=%234DC81F&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40swaggerexpert%2Fjsonpath)](https://www.npmjs.com/package/@swaggerexpert/jsonpath)
[![npm](https://img.shields.io/npm/dm/@swaggerexpert/jsonpath)](https://www.npmjs.com/package/@swaggerexpert/jsonpath)
[![Test workflow](https://github.com/swaggerexpert/jsonpath/actions/workflows/test.yml/badge.svg)](https://github.com/swaggerexpert/jsonpath/actions)
[![Dependabot enabled](https://img.shields.io/badge/Dependabot-enabled-blue.svg)](https://dependabot.com/)
[![try on RunKit](https://img.shields.io/badge/try%20on-RunKit-brightgreen.svg?style=flat)](https://npm.runkit.com/@swaggerexpert/jsonpath)
[![Tidelift](https://tidelift.com/badges/package/npm/@swaggerexpert%2Fjsonpath)](https://tidelift.com/subscription/pkg/npm-.swaggerexpert-jsonpath?utm_source=npm-swaggerexpert-jsonpath&utm_medium=referral&utm_campaign=readme)

`@swaggerexpert/jsonpath` is a **parser** and **validator** for [RFC 9535](https://www.rfc-editor.org/rfc/rfc9535) Query Expressions for JSON - **JSONPath**.

The development of this library contributed to the identification and formal submission of [Errata 8343](https://www.rfc-editor.org/errata/eid8343) against RFC 9535.

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
    - [Errors](#errors)
    - [Grammar](#grammar)
- [More about JSONPath](#more-about-jsonpath)
- [License](#license)

## Getting started

### Installation

You can install `@swaggerexpert/jsonpath` using `npm`:

```sh
 $ npm install @swaggerexpert/jsonpath
```

### Usage

`@swaggerexpert/jsonpath` currently supports **parsing** and **validation**.
Both parser and validator are based on a superset of [ABNF](https://www.rfc-editor.org/rfc/rfc5234) ([SABNF](https://cs.github.com/ldthomas/apg-js2/blob/master/SABNF.md))
and use [apg-lite](https://github.com/ldthomas/apg-lite) parser generator.

#### Parsing

Parsing a JSONPath Query expression is as simple as importing the **parse** function and calling it.

```js
import { parse } from '@swaggerexpert/jsonpath';

const parseResult = parse('$.store.book[0].title');
```

or

```js
import { parse, JSONPathQueryCST } from '@swaggerexpert/jsonpath';

const parseResult = parse('$.store.book[0].title', { ast: new JSONPathQueryCST() });
```

**parseResult** variable has the following shape:

```
{
  result: {
    success: true,
    state: 101,
    stateName: 'MATCH',
    length: 21,
    matched: 21,
    maxMatched: 21,
    maxTreeDepth: 21,
    nodeHits: 298
  },
  ast: <JSONPathQueryCST>,
  computed: {
    stack: [],
    root: {
      type: 'jsonpath-query',
      text: '$.store.book[0].title',
      start: 0,
      length: 21,
      children: [
        {
          type: 'root-identifier',
          text: '$',
          start: 0,
          length: 1,
          children: []
        },
        {
          type: 'segments',
          text: '.store.book[0].title',
          start: 1,
          length: 20,
          children: [
            {
              type: 'segment',
              text: '.store',
              start: 1,
              length: 6,
              children: [
                {
                  type: 'child-segment',
                  text: '.store',
                  start: 1,
                  length: 6,
                  children: [
                    {
                      type: 'text',
                      text: '.',
                      start: 1,
                      length: 1,
                      children: []
                    },
                    {
                      type: 'member-name-shorthand',
                      text: 'store',
                      start: 2,
                      length: 5,
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              type: 'segment',
              text: '.book',
              start: 7,
              length: 5,
              children: [
                {
                  type: 'child-segment',
                  text: '.book',
                  start: 7,
                  length: 5,
                  children: [
                    {
                      type: 'text',
                      text: '.',
                      start: 7,
                      length: 1,
                      children: []
                    },
                    {
                      type: 'member-name-shorthand',
                      text: 'book',
                      start: 8,
                      length: 4,
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              type: 'segment',
              text: '[0]',
              start: 12,
              length: 3,
              children: [
                {
                  type: 'child-segment',
                  text: '[0]',
                  start: 12,
                  length: 3,
                  children: [
                    {
                      type: 'bracketed-selection',
                      text: '[0]',
                      start: 12,
                      length: 3,
                      children: [
                        {
                          type: 'text',
                          text: '[',
                          start: 12,
                          length: 1,
                          children: []
                        },
                        {
                          type: 'selector',
                          text: '0',
                          start: 13,
                          length: 1,
                          children: [
                            {
                              type: 'index-selector',
                              text: '0',
                              start: 13,
                              length: 1,
                              children: []
                            }
                          ]
                        },
                        {
                          type: 'text',
                          text: ']',
                          start: 14,
                          length: 1,
                          children: []
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: 'segment',
              text: '.title',
              start: 15,
              length: 6,
              children: [
                {
                  type: 'child-segment',
                  text: '.title',
                  start: 15,
                  length: 6,
                  children: [
                    {
                      type: 'text',
                      text: '.',
                      start: 15,
                      length: 1,
                      children: []
                    },
                    {
                      type: 'member-name-shorthand',
                      text: 'title',
                      start: 16,
                      length: 5,
                      children: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

###### Interpreting AST as XML

```js
import { parse } from '@swaggerexpert/jsonpath';

const parseResult = parse('$.store.book[0].title');
const xml = parseResult.ast.toXml();
```

#### Errors

`@swaggerexpert/jsonpath` provides a structured error class hierarchy,
enabling precise error handling across JSONPath operations, including parsing.

```js
import { JSONPathError, JSONPathParseError } from '@swaggerexpert/jsonpath';
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
comparable          = literal /
                      singular-query / ; singular query value
                      function-expr    ; ValueType
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
function-argument   = logical-expr / ; MODIFICATION: PEG-ordered
                      function-expr /
                      filter-query / ; (includes singular-query)
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
normal-index-segment = "[" normal-selector "]"
normal-selector      = normal-name-selector / normal-index-selector
normal-name-selector = %x27 *normal-single-quoted %x27 ; 'string'
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

## License

`@swaggerexpert/jsonpath` is licensed under [Apache 2.0 license](https://github.com/swaggerexpert/jsonpath/blob/main/LICENSE).
`@swaggerexpert/jsonpath` comes with an explicit [NOTICE](https://github.com/swaggerexpert/jsonpath/blob/main/NOTICE) file
containing additional legal notices and information.
