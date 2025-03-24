import { assert } from 'chai';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { parse, JSONPathQueryCST } from '../../src/index.js';

describe('parse', function () {
  context('cst-corpus', function () {
    const jsonPaths = [
      // https://www.rfc-editor.org/rfc/rfc9535#section-1.4.2
      "$['store']['book'][0]['title']",
      '$.store.book[0].title',
      // https://www.rfc-editor.org/rfc/rfc9535#section-1.4.3
      '$.store.book[?@.price < 10].title',
      // https://www.rfc-editor.org/rfc/rfc9535#section-1.5
      '$.store.book[*].author',
      '$..author',
      '$.store.*',
      '$.store..price',
      '$..book[2]',
      '$..book[2].author',
      '$..book[2].publisher',
      '$..book[-1]',
      '$..book[0,1]',
      '$..book[:2]',
      '$..book[?@.isbn]',
      '$..book[?@.price<10]',
      '$..*',
      // https://www.rfc-editor.org/rfc/rfc9535#section-2.2.3
      '$',
      // https://www.rfc-editor.org/rfc/rfc9535#section-2.3.1.3
      "$.o['j j']",
      "$.o['j j']['k.k']",
      '$.o["j j"]["k.k"]',
      `$["'"]["@"]`,
      // https://www.rfc-editor.org/rfc/rfc9535#section-2.3.2.3
      '$[*]',
      '$.o[*]',
      '$.o[*]',
      '$.o[*, *]',
      '$.a[*]',
      // https://www.rfc-editor.org/rfc/rfc9535#section-2.3.3.3
      '$[1]',
      '$[-2]',
    ];

    jsonPaths.forEach((jsonPath) => {
      specify(jsonPath, function () {
        const parseResult = parse(jsonPath, { ast: new JSONPathQueryCST() });

        assert.isTrue(parseResult.result.success);
        expect(JSON.stringify(parseResult.computed, null, 2)).toMatchSnapshot();
      });
    });
  });
});
