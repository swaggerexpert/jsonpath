import { assert } from 'chai';

import { parse, ASTTranslator } from '../../src/index.js';

describe('parse', function () {
  context('string decoding (RFC 9535 Section 2.3.1.2)', function () {
    const getNameSelector = (parseResult) => {
      const segment = parseResult.tree.segments[0];
      // Handle both direct selector and bracketed selection
      if (segment.selector.type === 'BracketedSelection') {
        return segment.selector.selectors[0];
      }
      return segment.selector;
    };

    context('single-quoted strings', function () {
      specify('should decode escaped apostrophe', function () {
        const parseResult = parse("$['it\\'s']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, "it's");
      });

      specify('should decode escaped backslash', function () {
        const parseResult = parse("$['back\\\\slash']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'back\\slash');
      });

      specify('should decode escaped backslash followed by apostrophe', function () {
        const parseResult = parse("$['\\\\\\'']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, "\\'");
      });

      specify('should handle literal double quote', function () {
        const parseResult = parse("$['hello\"world']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'hello"world');
      });

      specify('should decode tab escape', function () {
        const parseResult = parse("$['hello\\tworld']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'hello\tworld');
      });

      specify('should decode newline escape', function () {
        const parseResult = parse("$['hello\\nworld']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'hello\nworld');
      });

      specify('should decode unicode escape', function () {
        const parseResult = parse("$['hello\\u0041world']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'helloAworld');
      });

      specify('should decode unicode escape at end of string', function () {
        const parseResult = parse("$['test\\u0041']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'testA');
      });

      specify('should decode string that is only unicode escape', function () {
        const parseResult = parse("$['\\u0041']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'A');
      });

      specify('should decode escaped backslash followed by double quote', function () {
        const parseResult = parse("$['hello\\\\\"world']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'hello\\"world');
      });

      specify('should decode carriage return escape', function () {
        const parseResult = parse("$['hello\\rworld']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'hello\rworld');
      });

      specify('should decode form feed escape', function () {
        const parseResult = parse("$['hello\\fworld']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'hello\fworld');
      });

      specify('should decode backspace escape', function () {
        const parseResult = parse("$['hello\\bworld']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'hello\bworld');
      });

      specify('should decode forward slash escape', function () {
        const parseResult = parse("$['hello\\/world']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'hello/world');
      });

      specify('should decode multiple consecutive escapes', function () {
        const parseResult = parse("$['\\\\\\'\\'\\\\']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, "\\''\\");
      });

      specify('should decode multiple backslashes', function () {
        const parseResult = parse("$['\\\\\\\\']", { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, '\\\\');
      });
    });

    context('double-quoted strings', function () {
      specify('should decode escaped double quote', function () {
        const parseResult = parse('$["hello\\"world"]', { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'hello"world');
      });

      specify('should decode escaped backslash', function () {
        const parseResult = parse('$["back\\\\slash"]', { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'back\\slash');
      });

      specify('should handle literal apostrophe', function () {
        const parseResult = parse('$["it\'s"]', { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, "it's");
      });

      specify('should decode tab escape', function () {
        const parseResult = parse('$["hello\\tworld"]', { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'hello\tworld');
      });

      specify('should decode newline escape', function () {
        const parseResult = parse('$["hello\\nworld"]', { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'hello\nworld');
      });

      specify('should decode unicode escape', function () {
        const parseResult = parse('$["hello\\u0041world"]', { translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'helloAworld');
      });
    });

    context('normalized path strings', function () {
      specify('should decode escaped apostrophe in normalized path', function () {
        const parseResult = parse("$['it\\'s']", { normalized: true, translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, "it's");
      });

      specify('should decode escaped backslash in normalized path', function () {
        const parseResult = parse("$['back\\\\slash']", { normalized: true, translator: new ASTTranslator() });
        assert.isTrue(parseResult.result.success);
        const selector = getNameSelector(parseResult);
        assert.strictEqual(selector.value, 'back\\slash');
      });
    });

  });
});
