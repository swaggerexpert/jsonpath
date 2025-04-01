import JSONPathParseError from '../../../errors/JSONPathParseError.js';
import { decodeString, decodeInteger } from './decoders.js';

export const transformCSTtoAST = (node, transformerMap, ctx = { parent: null, path: [] }) => {
  const transformer = transformerMap[node.type];
  if (!transformer) {
    throw new JSONPathParseError(`No transformer for CST node type: ${node.type}`);
  }

  const nextCtx = { parent: node, path: [...ctx.path, node] };
  return transformer(node, nextCtx);
};

const transformers = {
  ['jsonpath-query'](node, ctx) {
    const segmentsNode = node.children.find((c) => c.type === 'segments');

    return {
      type: 'JsonPathQuery',
      segments: segmentsNode
        ? segmentsNode.children
            .filter(({ type }) => type === 'segment')
            .map((segNode) => transformCSTtoAST(segNode, transformers, ctx))
            .filter(Boolean)
        : [],
    };
  },
  segment(node, ctx) {
    const child = node.children.find(
      ({ type }) => type === 'child-segment' || type === 'descendant-segment',
    );

    return transformCSTtoAST(child, transformers, ctx);
  },
  ['child-segment'](node, ctx) {
    const selectorNode = node.children.find(({ type }) =>
      ['bracketed-selection', 'wildcard-selector', 'member-name-shorthand'].includes(type),
    );
    const selector = transformCSTtoAST(selectorNode, transformers, ctx);

    return { type: 'ChildSegment', selector };
  },
  ['descendant-segment'](node, ctx) {
    const selectorNode = node.children.find(({ type }) =>
      ['bracketed-selection', 'wildcard-selector', 'member-name-shorthand'].includes(type),
    );
    const selector = transformCSTtoAST(selectorNode, transformers, ctx);

    return { type: 'DescendantSegment', selector };
  },
  ['bracketed-selection'](node, ctx) {
    return {
      type: 'BracketedSelection',
      selectors: node.children
        .filter(({ type }) => type === 'selector')
        .map((selectorNode) => transformCSTtoAST(selectorNode, transformers, ctx))
        .filter(Boolean),
    };
  },
  selector(node, ctx) {
    const selectorNode = node.children.find(({ type }) =>
      [
        'name-selector',
        'wildcard-selector',
        'slice-selector',
        'index-selector',
        'filter-selector',
      ].includes(type),
    );

    return transformCSTtoAST(selectorNode, transformers, ctx);
  },
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
    const quoted = node.children.find(({ type }) =>
      ['double-quoted', 'single-quoted'].includes(type),
    );

    return { type: 'StringLiteral', value: decodeString(quoted.text), format: quoted.type };
  },
  ['wildcard-selector']() {
    return { type: 'WildcardSelector' };
  },
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
  ['index-selector'](node) {
    return { type: 'IndexSelector', value: decodeInteger(node.text) };
  },
  ['filter-selector'](node, ctx) {
    const logicalExprCSTNode = node.children.find(({ type }) => type === 'logical-expr');
    const logicalExprASTNode = transformCSTtoAST(logicalExprCSTNode, transformers, ctx);

    return { type: 'FilterSelector', expression: logicalExprASTNode };
  },
  ['logical-expr'](node, ctx) {
    const logicalOrExpr = node.children.find(({ type }) => type === 'logical-or-expr');
    return transformCSTtoAST(logicalOrExpr, transformers, ctx);
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
      return { type: 'LogicalNotExpr', expression: logicalExpressionASTNode };
    }

    return logicalExpressionASTNode;
  },
  ['comparison-expr'](node, ctx) {
    const children = node.children.filter(({ type }) =>
      ['comparable', 'comparison-op'].includes(type),
    );
    const leftNode = children[0];
    const opNode = children[1];
    const rightNode = children[2];

    return {
      type: 'ComparisonExpr',
      left: transformCSTtoAST(leftNode, transformers, ctx),
      op: opNode.text,
      right: transformCSTtoAST(rightNode, transformers, ctx),
    };
  },
  ['comparable']() {
    return { type: 'Comparable' };
  },
  ['member-name-shorthand'](node) {
    return { type: 'NameSelector', value: node.text, format: 'shorthand' };
  },
};

export default transformers;
