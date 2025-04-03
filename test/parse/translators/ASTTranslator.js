import { assert } from 'chai';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { parse, ASTTranslator } from '../../../src/index.js';

describe('parse', function () {
  context('translators', function () {
    context('ASTTranslator', function () {
      specify('should translate a JSONPath to an AST', function () {
        const parseResult = parse('$["a"]', { translator: new ASTTranslator() });

        assert.isTrue(parseResult.result.success);
        expect(parseResult.tree).toMatchSnapshot();
      });
    });
  });
});
