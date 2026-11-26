import { assert } from 'chai';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { parse, XMLTranslator } from '../../../src/index.js';

describe('parse', function () {
  context('translators', function () {
    context('XMLTranslator', function () {
      specify('should translate a JSONPath to a XML', function () {
        const parseResult = parse('$', { translator: new XMLTranslator() });

        assert.isTrue(parseResult.result.success);
        expect(parseResult.tree).toMatchSnapshot();
      });

      specify('should escape XML special characters', function () {
        const parseResult = parse(`$['</node><x>&"\\'']`, { translator: new XMLTranslator() });

        assert.isTrue(parseResult.result.success);
        assert.include(parseResult.tree, '&lt;/node&gt;&lt;x&gt;&amp;&quot;\\&apos;');
        assert.notInclude(parseResult.tree, '</node><x>');
        // & is allowed in XML comments, e.g. in the caveat comment of apg-lite
        let inComment = false;
        parseResult.tree.split('\n').forEach((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('<!--')) inComment = true;
          if (!inComment) assert.notMatch(line, /&(?!amp;|lt;|gt;|quot;|apos;)/, line);
          if (trimmed.endsWith('-->')) inComment = false;
        });
      });
    });
  });
});
