import { assert } from 'chai';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { parse, ASTTranslator } from '../../src/index.js';

describe('parse', function () {
  context('ast-corpus-normalized', function () {
    const normalizedPaths = [
      // https://www.rfc-editor.org/rfc/rfc9535#section-2.7.1
      "$['a']",
      '$[1]',
      '$[2]',
      "$['a']['b'][1]",
      "$['\\u000b']",
    ];

    normalizedPaths.forEach((normalizedPath) => {
      specify(normalizedPath, function () {
        const parseResult = parse(normalizedPath, {
          normalized: true,
          translator: new ASTTranslator(),
        });

        assert.isTrue(parseResult.result.success);
        expect(parseResult.tree).toMatchSnapshot();
      });
    });
  });

  specify('should not parse in normalized path mode', function () {
    const parseResult = parse('$["\\u0061"]', {
      normalized: true,
      translator: new ASTTranslator(),
    });

    assert.isFalse(parseResult.result.success);
  });
});
