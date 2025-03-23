import { utilities, identifiers } from 'apg-lite';

import JSONPathParseError from '../../errors/JSONPathParseError.js';

const cst = (ruleName) => {
  return (state, chars, phraseIndex, phraseLength, data) => {
    if (!(typeof data === 'object' && data !== null && !Array.isArray(data))) {
      throw new JSONPathParseError("parser's user data must be an object");
    }

    if (!data.stack) {
      data.stack = [];
      data.root = null;
    }

    // drop the empty nodes
    if (phraseLength === 0) return

    if (state === identifiers.SEM_PRE) {
      const node = {
        type: ruleName,
        text: utilities.charsToString(chars, phraseIndex, phraseLength),
        start: phraseIndex,
        length: phraseLength,
        children: [],
      };

      if (data.stack.length > 0) {
        const parent = data.stack[data.stack.length - 1];

        // text nodes within text nodes are redundant
        if (!(parent.type === 'text' && node.type === 'text')) {
          parent.children.push(node);
        }
      } else {
        data.root = node;
      }

      data.stack.push(node);
    }

    if (state === identifiers.SEM_POST) {
      data.stack.pop();
    }
  };
};

export default cst;
