import JSONPathParseError from '../../../errors/JSONPathParseError.js';
import {
  decodeSingleQuotedString,
  decodeDoubleQuotedString,
  decodeInteger,
  decodeJSONValue,
} from './decoders.js';

/**
 * RFC 9535 function type signatures.
 * @see https://www.rfc-editor.org/rfc/rfc9535#section-2.4
 */
const FUNCTION_SIGNATURES = {
  // count(NodesType) -> ValueType
  count: {
    params: [{ type: 'NodesType' }],
    returns: 'ValueType',
  },
  // length(ValueType) -> ValueType
  length: {
    params: [{ type: 'ValueType' }],
    returns: 'ValueType',
  },
  // value(NodesType) -> ValueType
  value: {
    params: [{ type: 'NodesType' }],
    returns: 'ValueType',
  },
  // match(ValueType, ValueType) -> LogicalType
  match: {
    params: [{ type: 'ValueType' }, { type: 'ValueType' }],
    returns: 'LogicalType',
  },
  // search(ValueType, ValueType) -> LogicalType
  search: {
    params: [{ type: 'ValueType' }, { type: 'ValueType' }],
    returns: 'LogicalType',
  },
};

/**
 * Check if an AST node represents a singular query.
 * Singular queries use only name selectors and index selectors.
 */
const isSingularQueryAST = (node) => {
  if (node.type !== 'FilterQuery') return false;
  const { query } = node;
  if (!query || !query.segments) return false;

  for (const segment of query.segments) {
    if (segment.type !== 'ChildSegment') return false;
    const { selector } = segment;
    if (selector.type !== 'NameSelector' && selector.type !== 'IndexSelector') {
      // Check for BracketedSelection with single NameSelector or IndexSelector
      if (selector.type === 'BracketedSelection') {
        if (selector.selectors.length !== 1) return false;
        const inner = selector.selectors[0];
        if (inner.type !== 'NameSelector' && inner.type !== 'IndexSelector') {
          return false;
        }
      } else {
        return false;
      }
    }
  }
  return true;
};

/**
 * Check if argument type matches expected parameter type.
 */
const checkArgumentType = (argAST, expectedType, funcName) => {
  if (expectedType === 'NodesType') {
    // NodesType requires a filter-query (non-singular)
    // Literals and singular queries are NOT NodesType
    if (argAST.type === 'Literal') {
      throw new RangeError(`Function ${funcName}() requires NodesType argument, got literal`);
    }
    if (argAST.type === 'TestExpr' && argAST.expression?.type === 'FilterQuery') {
      // This is a filter query wrapped in TestExpr - valid NodesType
      return;
    }
    if (argAST.type === 'FilterQuery') {
      // Direct filter query - valid NodesType
      return;
    }
    // Other types are not valid NodesType
    throw new RangeError(`Function ${funcName}() requires NodesType argument`);
  }

  if (expectedType === 'ValueType') {
    // ValueType accepts: literals, singular queries, function expressions
    if (argAST.type === 'Literal') return;
    if (argAST.type === 'FunctionExpr') return;

    // TestExpr containing FunctionExpr - valid if function returns ValueType
    if (argAST.type === 'TestExpr' && argAST.expression?.type === 'FunctionExpr') {
      // Function expressions that return ValueType are valid
      // Unknown functions are allowed (they return Nothing at runtime)
      return;
    }

    // TestExpr containing FilterQuery - check if singular
    if (argAST.type === 'TestExpr' && argAST.expression?.type === 'FilterQuery') {
      if (!isSingularQueryAST(argAST.expression)) {
        throw new RangeError(
          `Function ${funcName}() requires ValueType argument, got non-singular query`,
        );
      }
      return;
    }

    // FilterQuery - check if singular
    if (argAST.type === 'FilterQuery') {
      if (!isSingularQueryAST(argAST)) {
        throw new RangeError(
          `Function ${funcName}() requires ValueType argument, got non-singular query`,
        );
      }
      return;
    }

    // LogicalExpr types are not ValueType
    throw new RangeError(`Function ${funcName}() requires ValueType argument`);
  }
};

/**
 * Get the return type of an expression AST node.
 *
 * @param {object} node - AST node
 * @returns {string | null} - 'LogicalType', 'ValueType', 'NodesType', or null for unknown
 */
const getExpressionReturnType = (node) => {
  if (!node) return null;

  // Function expressions return based on signature
  if (node.type === 'FunctionExpr') {
    const signature = FUNCTION_SIGNATURES[node.name];
    return signature ? signature.returns : null;
  }

  // Literals are ValueType
  if (node.type === 'Literal') {
    return 'ValueType';
  }

  // Singular queries return ValueType
  if (node.type === 'RelSingularQuery' || node.type === 'AbsSingularQuery') {
    return 'ValueType';
  }

  // Filter queries return NodesType
  if (node.type === 'FilterQuery') {
    return 'NodesType';
  }

  // Logical expressions return LogicalType
  if (
    node.type === 'LogicalOrExpr' ||
    node.type === 'LogicalAndExpr' ||
    node.type === 'LogicalNotExpr' ||
    node.type === 'ComparisonExpr'
  ) {
    return 'LogicalType';
  }

  // TestExpr: depends on what it wraps
  if (node.type === 'TestExpr') {
    return getExpressionReturnType(node.expression);
  }

  return null;
};

/**
 * Validate function call against its type signature.
 */
const validateFunctionCall = (funcName, argASTs) => {
  const signature = FUNCTION_SIGNATURES[funcName];
  if (!signature) {
    // Unknown function - no validation (will return Nothing at runtime)
    return;
  }

  // Check argument count
  const expectedCount = signature.params.length;
  const actualCount = argASTs.length;

  if (actualCount < expectedCount) {
    throw new RangeError(
      `Function ${funcName}() requires ${expectedCount} argument(s), got ${actualCount}`,
    );
  }
  if (actualCount > expectedCount) {
    throw new RangeError(
      `Function ${funcName}() requires ${expectedCount} argument(s), got ${actualCount}`,
    );
  }

  // Check argument types
  for (let i = 0; i < expectedCount; i++) {
    checkArgumentType(argASTs[i], signature.params[i].type, funcName);
  }
};

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
    const expressionAST = transformCSTtoAST(child, transformers, ctx);

    // Validate: ValueType functions cannot be used as existence tests
    // Per RFC 9535 Section 2.4.9: "Type error: ValueType not TestExpr"
    // This only applies when the top-level expression is a TestExpr
    // containing a function that returns ValueType
    if (expressionAST.type === 'TestExpr') {
      const innerType = getExpressionReturnType(expressionAST.expression);
      if (innerType === 'ValueType') {
        const funcName =
          expressionAST.expression.type === 'FunctionExpr'
            ? expressionAST.expression.name
            : 'expression';
        throw new RangeError(
          `Function ${funcName}() returns ValueType which cannot be used as existence test; result must be compared`,
        );
      }
    }
    // Also check for LogicalNotExpr wrapping TestExpr (for negated existence tests)
    if (
      expressionAST.type === 'LogicalNotExpr' &&
      expressionAST.expression?.type === 'TestExpr'
    ) {
      const innerExpr = expressionAST.expression.expression;
      const innerType = getExpressionReturnType(innerExpr);
      if (innerType === 'ValueType') {
        const funcName = innerExpr.type === 'FunctionExpr' ? innerExpr.name : 'expression';
        throw new RangeError(
          `Function ${funcName}() returns ValueType which cannot be used as existence test; result must be compared`,
        );
      }
    }

    return {
      type: 'FilterSelector',
      expression: expressionAST,
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

    return left;
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

    const expressionAST = transformCSTtoAST(expression, transformers, ctx);

    const testExpr = {
      type: 'TestExpr',
      expression: expressionAST,
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

    const leftAST = transformCSTtoAST(left, transformers, ctx);
    const rightAST = transformCSTtoAST(right, transformers, ctx);

    // Validate: LogicalType functions cannot be used in comparisons
    // Per RFC 9535 Section 2.4.9: "Type error: no compare to LogicalType"
    const leftType = getExpressionReturnType(leftAST);
    const rightType = getExpressionReturnType(rightAST);

    if (leftType === 'LogicalType') {
      const funcName = leftAST.type === 'FunctionExpr' ? leftAST.name : 'expression';
      throw new RangeError(
        `Function ${funcName}() returns LogicalType which cannot be compared`,
      );
    }
    if (rightType === 'LogicalType') {
      const funcName = rightAST.type === 'FunctionExpr' ? rightAST.name : 'expression';
      throw new RangeError(
        `Function ${funcName}() returns LogicalType which cannot be compared`,
      );
    }

    return {
      type: 'ComparisonExpr',
      left: leftAST,
      op: op.text,
      right: rightAST,
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
    const argASTs = args.map((arg) => transformCSTtoAST(arg, transformers, ctx));

    // Validate function call against type signature
    validateFunctionCall(name.text, argASTs);

    return {
      type: 'FunctionExpr',
      name: name.text,
      arguments: argASTs,
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
