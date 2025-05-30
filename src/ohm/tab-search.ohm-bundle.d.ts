// AUTOGENERATED FILE
// This file was generated from tab-search.ohm by `ohm generateBundles`.

import {
  BaseActionDict,
  Grammar,
  IterationNode,
  Node,
  NonterminalNode,
  Semantics,
  TerminalNode
} from 'ohm-js';

export interface QueryActionDict<T> extends BaseActionDict<T> {
  Query_spacesLead?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode) => T;
  Query_empty?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  Query?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  DisjunctionQuery_or?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode, arg3: NonterminalNode, arg4: NonterminalNode) => T;
  DisjunctionQuery?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  ConjunctionQuery_and?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode, arg3: NonterminalNode, arg4: NonterminalNode) => T;
  ConjunctionQuery?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  PriQuery_paren?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode, arg2: NonterminalNode, arg3: NonterminalNode, arg4: TerminalNode) => T;
  PriQuery?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  QueryComparison?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: NonterminalNode, arg3: NonterminalNode, arg4: NonterminalNode) => T;
  Operation?: (this: NonterminalNode, arg0: TerminalNode) => T;
  Exp_pos?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode, arg2: NonterminalNode) => T;
  Exp_neg?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode, arg2: NonterminalNode) => T;
  Exp?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  OrExp_or?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode, arg3: NonterminalNode, arg4: NonterminalNode) => T;
  OrExp?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  AndExp_and?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode, arg3: NonterminalNode, arg4: NonterminalNode) => T;
  AndExp?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  AddExp_plus?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode, arg3: NonterminalNode, arg4: NonterminalNode) => T;
  AddExp_minus?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode, arg3: NonterminalNode, arg4: NonterminalNode) => T;
  AddExp?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  MulExp_times?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode, arg3: NonterminalNode, arg4: NonterminalNode) => T;
  MulExp_divide?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode, arg3: NonterminalNode, arg4: NonterminalNode) => T;
  MulExp?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  PriExp_paren?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode, arg2: NonterminalNode, arg3: NonterminalNode, arg4: TerminalNode) => T;
  PriExp?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  Function?: (this: NonterminalNode, arg0: NonterminalNode, arg1: TerminalNode, arg2: NonterminalNode, arg3: TerminalNode) => T;
  FunctionParams?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: IterationNode, arg3: IterationNode, arg4: IterationNode, arg5: IterationNode, arg6: NonterminalNode) => T;
  Table?: (this: NonterminalNode, arg0: NonterminalNode, arg1: IterationNode, arg2: IterationNode) => T;
  TableName?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode) => T;
  string?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  doubleQuoteString?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode, arg2: TerminalNode) => T;
  doubleQuoteContent?: (this: NonterminalNode, arg0: IterationNode) => T;
  doubleQuoteEscapedChar?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode) => T;
  doubleQuoteNormalChar?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  singleQuoteString?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode, arg2: TerminalNode) => T;
  singleQuoteContent?: (this: NonterminalNode, arg0: IterationNode) => T;
  singleQuoteEscapedChar?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode) => T;
  singleQuoteNormalChar?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  Literal?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  null?: (this: NonterminalNode, arg0: TerminalNode) => T;
  ident?: (this: NonterminalNode, arg0: NonterminalNode, arg1: IterationNode) => T;
  identifierStart?: (this: NonterminalNode, arg0: NonterminalNode | TerminalNode) => T;
  identifierPart?: (this: NonterminalNode, arg0: NonterminalNode | TerminalNode) => T;
  letter?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  unicodeCategoryNl?: (this: NonterminalNode, arg0: TerminalNode) => T;
  unicodeDigit?: (this: NonterminalNode, arg0: TerminalNode) => T;
  unicodeCombiningMark?: (this: NonterminalNode, arg0: TerminalNode) => T;
  unicodeConnectorPunctuation?: (this: NonterminalNode, arg0: TerminalNode) => T;
  unicodeSpaceSeparator?: (this: NonterminalNode, arg0: TerminalNode) => T;
  number_fract?: (this: NonterminalNode, arg0: IterationNode, arg1: TerminalNode, arg2: IterationNode) => T;
  number_whole?: (this: NonterminalNode, arg0: IterationNode) => T;
  number?: (this: NonterminalNode, arg0: NonterminalNode) => T;
}

export interface QuerySemantics extends Semantics {
  addOperation<T>(name: string, actionDict: QueryActionDict<T>): this;
  extendOperation<T>(name: string, actionDict: QueryActionDict<T>): this;
  addAttribute<T>(name: string, actionDict: QueryActionDict<T>): this;
  extendAttribute<T>(name: string, actionDict: QueryActionDict<T>): this;
}

export interface QueryGrammar extends Grammar {
  createSemantics(): QuerySemantics;
  extendSemantics(superSemantics: QuerySemantics): QuerySemantics;
}

declare const grammar: QueryGrammar;
export default grammar;

