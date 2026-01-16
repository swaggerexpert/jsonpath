import JSONPathParseError from '../../../errors/JSONPathParseError.js';
import {
  decodeSingleQuotedString,
  decodeDoubleQuotedString,
  decodeInteger,
  decodeJSONValue,
} from './decoders.js';

export const transformCSTtoAST = (node, transformerMap, ctx = { parent: null, path: [] }) => {
  const transformer = transformerMap[node.type];
  if (!transformer) {
    throw new JSONPathParseError(`No transformer for CST node type: ${node.type}`);
  }

  const nextCtx = { parent: node, path: [...ctx.path, node] };
  return transformer(node, nextCtx);
};

const transformers = {
  /**
   * https://www.rfc-editor.org/rfc/rfc9535#section-2.1.1
   */
  ['jsonpath-query'](node, ctx) {
    const segments = node.children.find((c) => c.type === 'segments');

    return {
      type: 'JsonPathQuery',
      segments: segments
        ? segments.children
            .filter(({ type }) => type === 'segment')
            .map((segNode) => transformCSTtoAST(segNode, transformers, ctx))
        : [],
    };
  },
  /**
   * https://www.rfc-editor.org/rfc/rfc9535#section-2.5
   */
  segment(node, ctx) {
    const child = node.children.find(({ type }) =>
      ['child-segment', 'descendant-segment'].includes(type),
    );

    return transformCSTtoAST(child, transformers, ctx);
  },
  /**
   * https://www.rfc-editor.org/rfc/rfc9535#section-2.3
   */
  selector(node, ctx) {
    const child = node.children.find(({ type }) =>
      [
        'name-selector',
        'wildcard-selector',
        'slice-selector',
        'index-selector',
        'filter-selector',
      ].includes(type),
    );

    return transformCSTtoAST(child, transformers, ctx);
  },
  /**
   * https://www.rfc-editor.org/rfc/rfc9535#section-2.3.1.1
   */
  ['name-selector'](node, ctx) {
    const stringLiteralCSTNode = node.children.find(({ type }) => type === 'string-literal');
    const stringLiteralASTNode = transformCSTtoAST(stringLiteralCSTNode, transformers, ctx);

    return {
      type: 'NameSelector',
      value: stringLiteralASTNode.value,
      format: stringLiteralASTNode.format,
    };
  },
  ['string-literal'](node) {
    const isSingleQuoted = node.children.find(({ type, text }) => type === 'text' && text === "'");
    const quoted = node.children.find(({ type }) =>
      ['double-quoted', 'single-quoted'].includes(type),
    );
    const decodeString = isSingleQuoted ? decodeSingleQuotedString : decodeDoubleQuotedString;

    return {
      type: 'StringLiteral',
      value: quoted ? decodeString(quoted.text) : '',
      format: isSingleQuoted ? 'single-quoted' : 'double-quoted',
    };
  },
  /**
   * https://www.rfc-editor.org/rfc/rfc9535#section-2.3.2.1
   */
  ['wildcard-selector']() {
    return { type: 'WildcardSelector' };
  },
  /**
   * https://www.rfc-editor.org/rfc/rfc9535#section-2.3.3.1
   */
  ['index-selector'](node) {
    return {
      type: 'IndexSelector',
      value: decodeInteger(node.text),
    };
  },
  /**
   * https://www.rfc-editor.org/rfc/rfc9535#section-2.3.4.1
   */
  ['slice-selector'](node) {
    const start = node.children.find(({ type }) => type === 'start');
    const end = node.children.find(({ type }) => type === 'end');
    const step = node.children.find(({ type }) => type === 'step');

    return {
      type: 'SliceSelector',
      start: start ? decodeInteger(start.text) : null,
      end: end ? decodeInteger(end.text) : null,
      step: step ? decodeInteger(step.text) : null,
    };
  },
  /**
   * https://www.rfc-editor.org/rfc/rfc9535#section-2.3.5.1
   */
  ['filter-selector'](node, ctx) {
    const child = node.children.find(({ type }) => type === 'logical-expr');

    return {
      type: 'FilterSelector',
      expression: transformCSTtoAST(child, transformers, ctx),
    };
  },
  ['logical-expr'](node, ctx) {
    const child = node.children.find(({ type }) => type === 'logical-or-expr');
    return transformCSTtoAST(child, transformers, ctx);
  },
  ['logical-or-expr'](node, ctx) {
    const logicalAndExprs = node.children.filter(({ type }) => type === 'logical-and-expr');

    if (logicalAndExprs.length === 1) {
      return transformCSTtoAST(logicalAndExprs[0], transformers, ctx);
    }

    // fold left for left-associativity
    let left = transformCSTtoAST(logicalAndExprs[0], transformers, ctx);
    for (let i = 1; i < logicalAndExprs.length; i += 1) {
      const right = transformCSTtoAST(logicalAndExprs[i], transformers, ctx);
      left = {
        type: 'LogicalOrExpr',
        left,
        right,
      };
    }
  },
  ['logical-and-expr'](node, ctx) {
    const basicExprs = node.children.filter(({ type }) => type === 'basic-expr');

    if (basicExprs.length === 1) {
      return transformCSTtoAST(basicExprs[0], transformers, ctx);
    }

    let left = transformCSTtoAST(basicExprs[0], transformers, ctx);
    for (let i = 1; i < basicExprs.length; i += 1) {
      const right = transformCSTtoAST(basicExprs[i], transformers, ctx);
      left = {
        type: 'LogicalAndExpr',
        left,
        right,
      };
    }

    return left;
  },
  ['basic-expr'](node, ctx) {
    const child = node.children.find(({ type }) =>
      ['paren-expr', 'comparison-expr', 'test-expr'].includes(type),
    );

    return transformCSTtoAST(child, transformers, ctx);
  },
  ['paren-expr'](node, ctx) {
    const isNegated = node.children.some((child) => child.type === 'logical-not-op');
    const logicalExprCSTNode = node.children.find((child) => child.type === 'logical-expr');
    const logicalExpressionASTNode = transformCSTtoAST(logicalExprCSTNode, transformers, ctx);

    if (isNegated) {
      return {
        type: 'LogicalNotExpr',
        expression: logicalExpressionASTNode,
      };
    }

    return logicalExpressionASTNode;
  },
  ['test-expr'](node, ctx) {
    const isNegated = node.children.some(({ type }) => type === 'logical-not-op');
    const expression = node.children.find(({ type }) =>
      ['filter-query', 'function-expr'].includes(type),
    );

    const testExpr = {
      type: 'TestExpr',
      expression: transformCSTtoAST(expression, transformers, ctx),
    };

    return isNegated ? { type: 'LogicalNotExpr', expression: testExpr } : testExpr;
  },
  ['filter-query'](node, ctx) {
    const child = node.children.find(({ type }) => ['rel-query', 'jsonpath-query'].includes(type));

    return {
      type: 'FilterQuery',
      query: transformCSTtoAST(child, transformers, ctx),
    };
  },
  ['rel-query'](node, ctx) {
    const segments = node.children.find((c) => c.type === 'segments');

    return {
      type: 'RelQuery',
      segments: segments
        ? segments.children
            .filter((n) => n.type === 'segment')
            .map((segNode) => transformCSTtoAST(segNode, transformers, ctx))
        : [],
    };
  },
  ['comparison-expr'](node, ctx) {
    const children = node.children.filter(({ type }) =>
      ['comparable', 'comparison-op'].includes(type),
    );
    const [left, op, right] = children;

    return {
      type: 'ComparisonExpr',
      left: transformCSTtoAST(left, transformers, ctx),
      op: op.text,
      right: transformCSTtoAST(right, transformers, ctx),
    };
  },
  ['literal'](node, ctx) {
    const child = node.children.find(({ type }) =>
      ['number', 'string-literal', 'true', 'false', 'null'].includes(type),
    );

    if (child.type === 'string-literal') {
      const stringLiteralASTNode = transformCSTtoAST(child, transformers, ctx);
      return {
        type: 'Literal',
        value: stringLiteralASTNode.value,
      };
    }

    return {
      type: 'Literal',
      value: decodeJSONValue(child.text),
    };
  },
  ['comparable'](node, ctx) {
    const child = node.children.find(({ type }) =>
      ['singular-query', 'function-expr', 'literal'].includes(type),
    );

    return transformCSTtoAST(child, transformers, ctx);
  },
  ['singular-query'](node, ctx) {
    const child = node.children.find(({ type }) =>
      ['rel-singular-query', 'abs-singular-query'].includes(type),
    );

    return transformCSTtoAST(child, transformers, ctx);
  },
  ['rel-singular-query'](node, ctx) {
    const segmentsNode = node.children.find(({ type }) => type === 'singular-query-segments');

    const segments = segmentsNode
      ? segmentsNode.children
          .filter(({ type }) => ['name-segment', 'index-segment'].includes(type))
          .map((segNode) => ({
            type: 'SingularQuerySegment',
            selector: transformCSTtoAST(segNode, transformers, ctx),
          }))
      : [];

    return {
      type: 'RelSingularQuery',
      segments,
    };
  },
  ['abs-singular-query'](node, ctx) {
    const segmentsNode = node.children.find(({ type }) => type === 'singular-query-segments');

    const segments = segmentsNode
      ? segmentsNode.children
          .filter(({ type }) => ['name-segment', 'index-segment'].includes(type))
          .map((segNode) => ({
            type: 'SingularQuerySegment',
            selector: transformCSTtoAST(segNode, transformers, ctx),
          }))
      : [];

    return {
      type: 'AbsSingularQuery',
      segments,
    };
  },
  ['name-segment'](node, ctx) {
    const child = node.children.find(({ type }) =>
      ['name-selector', 'member-name-shorthand'].includes(type),
    );

    return transformCSTtoAST(child, transformers, ctx);
  },
  ['index-segment'](node, ctx) {
    const child = node.children.find(({ type }) => type === 'index-selector');

    return transformCSTtoAST(child, transformers, ctx);
  },
  /**
   * https://www.rfc-editor.org/rfc/rfc9535#section-2.4
   */
  ['function-expr'](node, ctx) {
    const name = node.children.find(({ type }) => type === 'function-name');
    const args = node.children.filter(({ type }) => type === 'function-argument');

    return {
      type: 'FunctionExpr',
      name: name.text,
      arguments: args.map((arg) => transformCSTtoAST(arg, transformers, ctx)),
    };
  },
  ['function-argument'](node, ctx) {
    const child = node.children.find(({ type }) =>
      ['logical-expr', 'function-expr', 'filter-query', 'literal'].includes(type),
    );

    return transformCSTtoAST(child, transformers, ctx);
  },
  /**
   * https://www.rfc-editor.org/rfc/rfc9535#section-2.5.1.1
   */
  ['child-segment'](node, ctx) {
    const child = node.children.find(({ type }) =>
      ['bracketed-selection', 'wildcard-selector', 'member-name-shorthand'].includes(type),
    );

    return {
      type: 'ChildSegment',
      selector: transformCSTtoAST(child, transformers, ctx),
    };
  },
  ['bracketed-selection'](node, ctx) {
    return {
      type: 'BracketedSelection',
      selectors: node.children
        .filter(({ type }) => type === 'selector')
        .map((selectorNode) => transformCSTtoAST(selectorNode, transformers, ctx)),
    };
  },
  ['member-name-shorthand'](node) {
    return {
      type: 'NameSelector',
      value: node.text,
      format: 'shorthand',
    };
  },
  /**
   * https://www.rfc-editor.org/rfc/rfc9535#section-2.5.2.1
   */
  ['descendant-segment'](node, ctx) {
    const child = node.children.find(({ type }) =>
      ['bracketed-selection', 'wildcard-selector', 'member-name-shorthand'].includes(type),
    );

    return {
      type: 'DescendantSegment',
      selector: transformCSTtoAST(child, transformers, ctx),
    };
  },
  /**
   * https://www.rfc-editor.org/rfc/rfc9535#name-normalized-paths
   */
  ['normalized-path'](node, ctx) {
    return {
      type: 'JsonPathQuery',
      segments: node.children
        .filter(({ type }) => type === 'normal-index-segment')
        .map((segNode) => transformCSTtoAST(segNode, transformers, ctx)),
    };
  },
  ['normal-index-segment'](node, ctx) {
    const child = node.children.find(({ type }) => type === 'normal-selector');

    return {
      type: 'ChildSegment',
      selector: transformCSTtoAST(child, transformers, ctx),
    };
  },
  ['normal-selector'](node, ctx) {
    const child = node.children.find(({ type }) =>
      ['normal-name-selector', 'normal-index-selector'].includes(type),
    );

    return transformCSTtoAST(child, transformers, ctx);
  },
  ['normal-name-selector'](node) {
    const child = node.children.find(({ type }) => type === 'normal-single-quoted');

    return {
      type: 'NameSelector',
      value: child ? decodeSingleQuotedString(child.text) : '',
      format: 'single-quoted',
    };
  },
  ['normal-index-selector'](node) {
    return {
      type: 'IndexSelector',
      value: decodeInteger(node.text),
    };
  },
};

export default transformers;
