import { assert } from 'chai';

import { Parser } from 'apg-lite';

import { parse, Grammar, Trace } from '../../src/index.js';

describe('parse', function () {
  context('trace', function () {
    specify('should not produce trace by default', function () {
      const parseResult = parse('$');

      assert.isUndefined(parseResult.trace);
    });

    specify('should produce stats when requested', function () {
      const parseResult = parse('$', { trace: true });

      assert.instanceOf(parseResult.trace, Trace);
    });

    specify('should provide trace', function () {
      const parseResult = parse('$', { trace: true });
      const expected =
        '|-|[RNM(jsonpath-query)]$\n' +
        '.|-|[CAT]$\n' +
        '..|-|[RNM(root-identifier)]$\n' +
        '...|-|[TLS($)]$\n' +
        "...|M|[TLS($)]'$'\n" +
        "..|M|[RNM(root-identifier)]'$'\n" +
        '..|-|[RNM(segments)]\n' +
        '...|-|[REP(0,inf)]\n' +
        "...|E|[REP(0,inf)]''\n" +
        "..|E|[RNM(segments)]''\n" +
        ".|M|[CAT]'$'\n" +
        "|M|[RNM(jsonpath-query)]'$'\n";

      assert.strictEqual(parseResult.trace.displayTrace(), expected);
    });

    specify('should be able to create human-readable trace message', function () {
      const { result, trace } = parse('$fdfadfd', { trace: true });
      const errorMessage = `Syntax error at position ${result.maxMatched}, expected ${trace.inferExpectations()}`;

      assert.isFalse(result.success);
      assert.strictEqual(
        errorMessage,
        'Syntax error at position 1, expected "\\x20", "\\x09", "\\x0A", "\\x0D", "[", ".", ".."',
      );
    });

    specify('should infer expectations at the end of the source', function () {
      const { result, trace } = parse('$.', { trace: true });

      assert.isFalse(result.success);
      assert.strictEqual(result.maxMatched, 2);
      assert.deepEqual(Array.from(trace.inferExpectations()), [
        '*',
        'A-Z',
        'a-z',
        '_',
        '\\x80-\\u{D7FF}',
        '\\u{E000}-\\u{10FFFF}',
        '.',
      ]);
    });

    specify('should infer remainders of partially matched literals', function () {
      [
        ['$[?@.a == -', ['1-9', '0']],
        ['$[?@.a == tru', ['a-z', '_', '0-9', '(', 'e']],
      ].forEach(([jsonPath, expected]) => {
        const { trace } = parse(jsonPath, { trace: true });

        assert.deepEqual(Array.from(trace.inferExpectations()), expected, jsonPath);
      });

      const { trace } = parse('$[?@.a<', { trace: true });
      assert.include(Array.from(trace.inferExpectations()), '=');
    });

    specify('should infer expectations at the position of the syntax error', function () {
      ['$x', '$.', '$[1:', "$['a", '$[?@.a ==', '$.a[?', '$..[', '$[1,2', '$[?@.a<'].forEach(
        (jsonPath) => {
          const { result, trace } = parse(jsonPath, { trace: true });
          const expectations = Array.from(trace.inferExpectations());
          // literals, as opposed to ranges (e.g. a-z) and escaped characters (e.g. \x20)
          const literals = expectations.filter((e) => !e.startsWith('\\') && !/^.-./.test(e));

          assert.isFalse(result.success, jsonPath);
          assert.isAbove(literals.length, 0, jsonPath);
          literals.forEach((literal) => {
            const { result: continued } = parse(
              `${jsonPath.slice(0, result.maxMatched)}${literal}`,
            );

            assert.isAbove(continued.maxMatched, result.maxMatched, `${jsonPath} + ${literal}`);
          });
        },
      );
    });

    specify('should infer expectations when used with apg-lite parser directly', function () {
      const parser = new Parser();
      const trace = new Trace();
      parser.trace = trace;

      parser.parse(new Grammar(), 'jsonpath-query', '$.abc[');
      const first = Array.from(trace.inferExpectations());
      assert.includeMembers(first, ['\\x20', '-', '1-9', ':', '?']);

      // reusing the trace does not report expectations of the previous parsing
      parser.parse(new Grammar(), 'jsonpath-query', '$x');
      assert.deepEqual(Array.from(trace.inferExpectations()), [
        '\\x20',
        '\\x09',
        '\\x0A',
        '\\x0D',
        '[',
        '.',
        '..',
      ]);
    });

    specify('should infer expectations only at the furthest offset', function () {
      const { result, trace } = parse('$[1:', { trace: true });
      const expectations = Array.from(trace.inferExpectations());

      assert.isFalse(result.success);
      assert.strictEqual(result.maxMatched, 4);
      assert.deepEqual(expectations, [
        '\\x20',
        '\\x09',
        '\\x0A',
        '\\x0D',
        '0',
        '-',
        '1-9',
        ':',
        ',',
        ']',
      ]);
      ['*', '.', '..', '['].forEach((terminal) => assert.notInclude(expectations, terminal));
    });

    specify('should escape quotes and backslashes in expectations', function () {
      const { trace } = parse("$['abc", { trace: true });
      const expectations = Array.from(trace.inferExpectations());

      assert.include(expectations, '\\x22');
      assert.include(expectations, '\\x5C');
      assert.include(expectations, "'");
    });

    specify('should infer expectations of normalized paths', function () {
      const { result, trace } = parse('$[1:', { normalized: true, trace: true });

      assert.isFalse(result.success);
      assert.strictEqual(result.maxMatched, 3);
      assert.deepEqual(Array.from(trace.inferExpectations()), ['0-9', ']']);
    });

    specify('should infer no expectations for valid JSONPath', function () {
      ['$', '$.a', '$[1:2]', "$['a']", '$..*', '$[?@.a == 1]'].forEach((jsonPath) => {
        const { result, trace } = parse(jsonPath, { trace: true });

        assert.isTrue(result.success);
        assert.lengthOf(Array.from(trace.inferExpectations()), 0, jsonPath);
      });
    });
  });
});
