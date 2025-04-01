import { utilities, identifiers } from 'apg-lite';

import JSONPathParseError from '../../errors/JSONPathParseError.js';

const cst = (nodeType) => {
  return (state, chars, phraseIndex, phraseLength, data) => {
    if (!(typeof data === 'object' && data !== null && !Array.isArray(data))) {
      throw new JSONPathParseError("parser's user data must be an object");
    }

    // drop the empty nodes
    if (
      data.options?.optimize &&
      phraseLength === 0 &&
      data.options?.droppableTypes?.includes(nodeType)
    ) {
      return;
    }

    if (state === identifiers.SEM_PRE) {
      const node = {
        type: nodeType,
        text: utilities.charsToString(chars, phraseIndex, phraseLength),
        start: phraseIndex,
        length: phraseLength,
        children: [],
      };

      if (data.stack.length > 0) {
        const parent = data.stack[data.stack.length - 1];
        const prevSibling = parent.children[parent.children.length - 1];

        const isTextNodeWithinTextNode = parent.type === 'text' && node.type === 'text';
        const shouldCollapse =
          data.options?.optimize &&
          data.options?.collapsibleTypes?.includes(node.type) &&
          prevSibling?.type === node.type;

        if (shouldCollapse) {
          prevSibling.text += node.text;
          prevSibling.length += node.length;
        } else if (!isTextNodeWithinTextNode) {
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
