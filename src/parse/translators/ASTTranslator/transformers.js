import JSONPathParseError from '../../../errors/JSONPathParseError.js';
import { decodeString } from './decoders.js';

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
    const segmentCSTNode = node.children.find((c) => c.type === 'segments');

    return {
      type: 'JsonPathQuery',
      segments: segmentCSTNode
        ? segmentCSTNode.children
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
      start: start ? JSON.parse(start.text) : null,
      end: end ? JSON.parse(end.text) : null,
      step: step ? JSON.parse(step.text) : null,
    };
  },
  ['index-selector'](node) {
    return { type: 'IndexSelector', value: JSON.parse(node.text) };
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
          .filter(({ type }) => type === 'name-segment' || type === 'index-segment')
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
          .filter(({ type }) => type === 'name-segment' || type === 'index-segment')
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
  ['function-expr'](node, ctx) {
    const nameCSTNode = node.children.find(({ type }) => type === 'function-name');
    const argCSTNodes = node.children.filter(({ type }) => type === 'function-argument');
    const argASTNodes = argCSTNodes.map((arg) => transformCSTtoAST(arg, transformers, ctx));

    return {
      type: 'FunctionExpr',
      name: nameCSTNode.text,
      arguments: argASTNodes,
    };
  },
  ['function-argument'](node, ctx) {
    const child = node.children.find(({ type }) =>
      ['logical-expr', 'function-expr', 'filter-query', 'literal'].includes(type),
    );

    return transformCSTtoAST(child, transformers, ctx);
  },
  ['test-expr'](node, ctx) {
    const isNegated = node.children.some(({ type }) => type === 'logical-not-op');
    const expressionCSTNode = node.children.find(({ type }) =>
      ['filter-query', 'function-expr'].includes(type),
    );
    const expressionASTNode = transformCSTtoAST(expressionCSTNode, transformers, ctx);

    const testExpr = {
      type: 'TestExpr',
      expression: expressionASTNode,
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
    const segmentCSTNode = node.children.find((c) => c.type === 'segments');

    const segments = segmentCSTNode
      ? segmentCSTNode.children
          .filter((n) => n.type === 'segment')
          .map((segNode) => transformCSTtoAST(segNode, transformers, ctx))
      : [];

    return {
      type: 'RelQuery',
      segments,
    };
  },
  ['literal'](node, ctx) {
    const child = node.children.find(({ type }) =>
      ['number', 'string-literal', 'true', 'false', 'null'].includes(type),
    );

    if (child.type === 'string-literal') {
      const ast = transformCSTtoAST(child, transformers, ctx);
      return {
        type: 'Literal',
        value: ast.value,
      };
    }

    return {
      type: 'Literal',
      value: JSON.parse(child.text),
    };
  },
  ['member-name-shorthand'](node) {
    return { type: 'NameSelector', value: node.text, format: 'shorthand' };
  },
};

export default transformers;
