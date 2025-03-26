/**
 * Parsing
 */
export function parse(jsonpath: string, options?: ParseOptions): ParseResult;

export interface ParseOptions {
  readonly ast?: AST;
  readonly stats?: boolean;
  readonly trace?: boolean;
}

export interface AST {
  readonly translate: (parts: Record<string, CSTNode>) => Record<string, CSTNode>;
  readonly toXml: () => string;
}

export interface ParseResult {
  readonly result: {
    readonly success: boolean;
  };
  readonly ast: AST;
  readonly computed: Record<string, CSTNode>;
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
