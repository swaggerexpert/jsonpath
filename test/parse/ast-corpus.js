import { assert } from 'chai';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { parse, ASTTranslator } from '../../src/index.js';
import validJSONPaths from '../fixtures/json-paths-valid.js';

describe('parse', function () {
  context('ast-corpus', function () {
    validJSONPaths.forEach((jsonPath) => {
      specify(jsonPath, function () {
        const parseResult = parse(jsonPath, { translator: new ASTTranslator() });

        assert.isTrue(parseResult.result.success);
        expect(parseResult.tree).toMatchSnapshot();
      });
    });
  });
});
