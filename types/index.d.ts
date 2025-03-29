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
export declare class XMLTranslator implements Translator<XMLTree> {
  getTree(): XMLTree;
}

export interface ParseResult<TTree = unknown> {
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
  readonly tree: TTree;
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

export interface Stats {
  displayStats(): string;
  displayHits(): string;
}

export interface Trace {
  displayTrace(): string;
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
