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
export declare class CSTOptimizedTranslator implements CSTTranslator {
  constructor(options?: { collapsibleTypes?: string[] });
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

export interface CSTTree {
  readonly root: CSTNode;
}

export type XMLTree = string;

/* AST Tree start */
export interface ASTTree {
  readonly root: JSONPathQueryASTNode;
}
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
  selector: BracketedSelectionASTNode | WildcardSelectorASTNode | NameSelectorASTNode;
}
export interface BracketedSelectionASTNode extends ASTNode {
  type: 'BracketedSelection';
  selectors: SelectorASTNode[];
}
export interface DescendantSegmentASTNode extends ASTNode {
  type: 'DescendantSegment';
  selector: BracketedSelectionASTNode | WildcardSelectorASTNode | NameSelectorASTNode;
}
// union types
export type SelectorASTNode =
  | NameSelectorASTNode
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
