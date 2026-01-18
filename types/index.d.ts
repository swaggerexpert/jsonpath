/**
 * Parsing
 */
export function parse(jsonpath: string, options?: ParseOptions): ParseResult;

export interface ParseOptions {
  readonly normalized?: boolean;
  readonly stats?: boolean;
  readonly trace?: boolean;
  readonly translator?: Translator | null;
}

export interface Translator<TTree = unknown> {
  getTree(): TTree;
}
export declare class CSTTranslator implements Translator<CSTTree> {
  getTree(): CSTTree;
}
export declare class CSTOptimizedTranslator extends CSTTranslator {
  constructor(options?: { collapsibleTypes?: string[]; droppableTypes?: string[] });
  getTree(): CSTTree;
}
export declare class ASTTranslator implements Translator<ASTTree> {
  getTree(): ASTTree;
}
export declare class XMLTranslator implements Translator<XMLTree> {
  getTree(): XMLTree;
}

export interface ParseResult<TTree = ASTTree> {
  readonly result: {
    readonly success: boolean;
    readonly state: number;
    readonly stateName: string;
    readonly length: number;
    readonly matched: number;
    readonly maxMatched: number;
    readonly maxTreeDepth: number
    readonly nodeHits: number;
  };
  readonly tree?: TTree;
  readonly stats?: Stats;
  readonly trace?: Trace;
}

export interface CSTNode {
  readonly type: string,
  readonly text: string,
  readonly start: number,
  readonly length: number,
  readonly children: CSTNode[],
}

export type CSTTree = CSTNode;

export type XMLTree = string;

/* AST Tree start */
export type ASTTree = JSONPathQueryASTNode;

export interface ASTNode {
  readonly type:
    | 'JSONPathQuery'
    | 'NameSelector'
    | 'WildcardSelector'
    | 'IndexSelector'
    | 'SliceSelector'
    | 'FilterSelector'
    | 'LogicalOrExpr'
    | 'LogicalAndExpr'
    | 'LogicalNotExpr'
    | 'TestExpr'
    | 'FilterQuery'
    | 'RelQuery'
    | 'ComparisonExpr'
    | 'Literal'
    | 'RelSingularQuery'
    | 'AbsSingularQuery'
    | 'FunctionExpr'
    | 'ChildSegment'
    | 'DescendantSegment'
    | 'BracketedSelection';
}
// https://www.rfc-editor.org/rfc/rfc9535#section-2.1.1
export interface JSONPathQueryASTNode extends ASTNode {
  readonly type: 'JSONPathQuery';
  segments: SegmentASTNode[];
}
// https://www.rfc-editor.org/rfc/rfc9535#section-2.3.1.1
export interface NameSelectorASTNode extends ASTNode {
  type: 'NameSelector';
  value: string;
  format: 'single-quoted' | 'double-quoted' | 'shorthand';
}
type NameSelectorShorthandASTNode = NameSelectorASTNode & { format: 'shorthand' };
type NameSelectorQuotedASTNode   = NameSelectorASTNode & { format: 'single-quoted' | 'double-quoted' };
// https://www.rfc-editor.org/rfc/rfc9535#section-2.3.2.1
export interface WildcardSelectorASTNode extends ASTNode {
  type: 'WildcardSelector';
}
// https://www.rfc-editor.org/rfc/rfc9535#name-normalized-paths
export interface IndexSelectorASTNode extends ASTNode {
  type: 'IndexSelector';
  value: number;
}
// https://www.rfc-editor.org/rfc/rfc9535#section-2.3.4.1
export interface SliceSelectorASTNode extends ASTNode {
  type: 'SliceSelector';
  start: number | null;
  end: number | null ;
  step: number | null;
}
// https://www.rfc-editor.org/rfc/rfc9535#section-2.3.5.1
export interface FilterSelectorASTNode extends ASTNode {
  type: 'FilterSelector';
  expression: LogicalExprASTNode;
}
export interface LogicalOrExprASTNode extends ASTNode {
  type: 'LogicalOrExpr';
  left: LogicalExprASTNode;
  right: LogicalExprASTNode;
}
export interface LogicalAndExprASTNode extends ASTNode {
  type: 'LogicalAndExpr';
  left: LogicalExprASTNode;
  right: LogicalExprASTNode;
}
export interface LogicalNotExprASTNode extends ASTNode {
  type: 'LogicalNotExpr';
  expression: LogicalExprASTNode;
}
export interface TestExprASTNode extends ASTNode {
  type: 'TestExpr';
  expression: FilterQueryASTNode | FunctionExprASTNode;
}
export interface FilterQueryASTNode extends ASTNode {
  type: 'FilterQuery';
  query: RelQueryASTNode | JSONPathQueryASTNode;
}
export interface RelQueryASTNode extends ASTNode {
  type: 'RelQuery';
  segments: SegmentASTNode[];
}
export interface ComparisonExprASTNode extends ASTNode {
  type: 'ComparisonExpr';
  left: ComparableASTNode;
  operator: '==' | '!=' | '<=' | '>=' | '<' | '>';
  right: ComparableASTNode;
}
export interface LiteralASTNode extends ASTNode {
  type: 'Literal';
  value: string | number | boolean | null;
}
export interface RelSingularQueryASTNode extends ASTNode {
  type: 'RelSingularQuery';
  segments: SingularQuerySegmentASTNode[];
}
export interface AbsSingularQueryASTNode extends ASTNode {
  type: 'AbsSingularQuery';
  segments: SingularQuerySegmentASTNode[];
}
// https://www.rfc-editor.org/rfc/rfc9535#section-2.4
export interface FunctionExprASTNode extends ASTNode {
  type: 'FunctionExpr';
  name: string;
  arguments: FunctionArgumentASTNode[];
}
// https://www.rfc-editor.org/rfc/rfc9535#section-2.5.1.1
export interface ChildSegmentASTNode extends ASTNode {
  type: 'ChildSegment';
  selector: BracketedSelectionASTNode | WildcardSelectorASTNode | NameSelectorShorthandASTNode;
}
export interface BracketedSelectionASTNode extends ASTNode {
  type: 'BracketedSelection';
  selectors: SelectorASTNode[];
}
export interface DescendantSegmentASTNode extends ASTNode {
  type: 'DescendantSegment';
  selector: BracketedSelectionASTNode | WildcardSelectorASTNode | NameSelectorShorthandASTNode;
}
// union types
export type SelectorASTNode =
  | NameSelectorQuotedASTNode
  | WildcardSelectorASTNode
  | SliceSelectorASTNode
  | IndexSelectorASTNode
  | FilterQueryASTNode;
export type LogicalExprASTNode =
  | LogicalOrExprASTNode
  | LogicalAndExprASTNode
  | LogicalNotExprASTNode
  | TestExprASTNode
  | ComparisonExprASTNode;
export type ComparableASTNode =
  | RelSingularQueryASTNode
  | AbsSingularQueryASTNode
  | FunctionExprASTNode
  | LiteralASTNode;
export type SegmentASTNode =
  | ChildSegmentASTNode
  | DescendantSegmentASTNode;
export type FunctionArgumentASTNode =
  | LogicalExprASTNode
  | FilterQueryASTNode
  | FunctionExprASTNode
  | LiteralASTNode;
export type SingularQuerySegmentASTNode =
  | NameSelectorASTNode
  | IndexSelectorASTNode;
/* AST Tree end */

export interface Stats {
  displayStats(): string;
  displayHits(): string;
}

export interface Trace {
  displayTrace(): string;
}

/**
 * Validation
 */
export function test(jsonpath: string, options?: TestOptions): boolean;

export interface TestOptions {
  readonly normalized?: boolean;
}

/**
 * Normalized Paths
 */
export namespace NormalizedPath {
  /**
   * Creates a normalized path string from a list of selectors.
   * Name selectors are automatically escaped.
   */
  function from(selectors: (string | number)[]): string;

  /**
   * Parses a normalized path string and returns a list of selectors.
   */
  function to(normalizedPath: string): (string | number)[];

  /**
   * Escapes special characters in name selectors for use in normalized paths.
   */
  function escape(value: string): string;
}

/**
 * Evaluation
 */
export function evaluate<T = unknown>(data: unknown, expression: string, options?: EvaluateOptions): T[];

export interface EvaluateOptions {
  /**
   * Callback function called for each match.
   * Receives the matched value and its normalized path.
   */
  readonly callback?: (value: unknown, normalizedPath: string) => void;
  /**
   * Custom evaluation realm for different data structures.
   * Default is JSON realm for plain objects/arrays.
   */
  readonly realm?: EvaluationRealmInterface;
  /**
   * Custom function registry.
   * Can extend or override built-in functions.
   */
  readonly functions?: Record<string, Function>;
}

/**
 * Evaluation realm interface for custom data structures.
 * Implement this to evaluate JSONPath on Immutable.js, ApiDOM, etc.
 */
export interface EvaluationRealmInterface {
  name?: string;
  isObject(value: unknown): boolean;
  isArray(value: unknown): boolean;
  isString(value: unknown): boolean;
  isNumber(value: unknown): boolean;
  isBoolean(value: unknown): boolean;
  isNull(value: unknown): boolean;
  getString(value: unknown): string | undefined;
  getProperty(value: unknown, key: string): unknown;
  hasProperty(value: unknown, key: string): boolean;
  getElement(value: unknown, index: number): unknown;
  getKeys(value: unknown): string[];
  getLength(value: unknown): number;
  entries(value: unknown): Iterable<[string | number, unknown]>;
  compare(left: unknown, operator: '==' | '!=' | '<' | '<=' | '>' | '>=', right: unknown): boolean;
}

/**
 * Built-in evaluation functions.
 */
export const functions: Record<string, Function>;

/**
 * Base class for evaluation realms.
 * Extend this class to create custom evaluation realms.
 */
export declare class EvaluationRealm implements EvaluationRealmInterface {
  name: string;
  isObject(value: unknown): boolean;
  isArray(value: unknown): boolean;
  isString(value: unknown): boolean;
  isNumber(value: unknown): boolean;
  isBoolean(value: unknown): boolean;
  isNull(value: unknown): boolean;
  getString(value: unknown): string | undefined;
  getProperty(value: unknown, key: string): unknown;
  hasProperty(value: unknown, key: string): boolean;
  getElement(value: unknown, index: number): unknown;
  getKeys(value: unknown): string[];
  getLength(value: unknown): number;
  entries(value: unknown): Iterable<[string | number, unknown]>;
  compare(left: unknown, operator: '==' | '!=' | '<' | '<=' | '>' | '>=', right: unknown): boolean;
}

/**
 * JSON Evaluation Realm for plain JavaScript objects and arrays.
 * This is the default realm used by the evaluate function.
 */
export declare class JSONEvaluationRealm extends EvaluationRealm {
  name: 'json';
}

/**
 * Errors
 */
export declare class JSONPathError extends Error {
  constructor(message?: string, options?: JSONPathErrorOptions);
  cause?: Error;
}

export interface JSONPathErrorOptions {
  cause?: Error;
  [key: string]: unknown;
}

export declare class JSONNormalizedPathError extends JSONPathError {
  selectors?: (string | number)[];
  normalizedPath?: string;
}

export declare class JSONPathParseError extends JSONPathError {}

export declare class JSONPathEvaluateError extends JSONPathError {
  expression?: string;
}

/**
 * Grammar
 */
export function Grammar(): Grammar;

export interface Grammar {
  grammarObject: string; // Internal identifier
  rules: Rule[]; // List of grammar rules
  udts: UDT[]; // User-defined terminals (empty in this grammar)
  toString(): string; // Method to return the grammar in ABNF format
}

export interface Rule {
  name: string; // Rule name
  lower: string; // Lowercased rule name
  index: number; // Rule index
  isBkr: boolean; // Is this a back-reference?
  opcodes?: Opcode[]; // List of opcodes for the rule
}

export type Opcode =
  | { type: 1; children: number[] } // ALT (alternation)
  | { type: 2; children: number[] } // CAT (concatenation)
  | { type: 3; min: number; max: number } // REP (repetition)
  | { type: 4; index: number } // RNM (rule reference)
  | { type: 5; min: number; max: number } // TRG (terminal range)
  | { type: 6 | 7; string: number[] }; // TBS or TLS (byte sequence or literal string)

export type UDT = {}; // User-defined terminals (empty in this grammar)
