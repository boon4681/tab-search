import grammar, { QueryActionDict } from "@parser/tab-search.ohm-bundle";
// const grammar = require("@parser/tab-search.ohm-bundle")
import { NonterminalNode as NtN, TerminalNode as TN, IterationNode as IN, Node } from "ohm-js";
import { AstFunction, AstQuery, AstQueryAnd, AstQueryComparison, AstQueryTextSearch, AstQueryOr, AstTable, Literal } from "./ast.internal.types";
import { AstFunctionResolver, FunctionExtension } from "./extension";

export function parseAST(query: string, functions: Record<string, AstFunctionResolver> = {}) {
    const semantics = grammar.createSemantics().addOperation('visit',
        {
            Query: function (this: NtN, arg0: TN) {
                return arg0.visit()
            },
            Query_empty: function (this: NtN, arg0: TN) {
                return undefined
            },
            Query_spacesLead: function (this: NtN, arg0, arg1) {
                return arg1.visit()
            },
            Query_spacesLeadString: function (this: NtN, arg0, arg1) {
                return {
                    type: "query_text",
                    value: arg1.visit()
                } satisfies AstQueryTextSearch
            },
            DisjunctionQuery_or: function (this: NtN, arg0: NtN, arg1: NtN, arg2: TN, arg3: NtN, arg4: NtN) {
                return {
                    type: 'query_or',
                    left: arg0.visit(),
                    right: arg4.visit()
                } satisfies AstQueryOr
            },
            ConjunctionQuery_and: function (this: NtN, arg0: NtN, arg1: NtN, arg2: TN, arg3: NtN, arg4: NtN) {
                return {
                    type: 'query_and',
                    left: arg0.visit(),
                    right: arg4.visit()
                } satisfies AstQueryAnd
            },
            PriQuery_paren: function (this: NtN, arg0: TN, arg1: NtN, arg2: NtN, arg3: NtN, arg4: TN) {
                return arg2.visit()
            },
            QueryComparison: function (this: NtN, arg0: NtN, arg1: NtN, arg2: TN, arg3: NtN, arg4: NtN) {
                return {
                    type: 'query_comparison',
                    table: arg0.visit(),
                    comparator: arg2.sourceString as any,
                    value: arg4.visit()
                } satisfies AstQueryComparison
            },
            AddExp_plus: function (this: NtN, arg0: NtN, arg1: NtN, arg2: TN, arg3: NtN, arg4: NtN) {
                const left = arg0.visit()
                const right = arg4.visit()
                if (arg2.sourceString == '+')
                    return left + right
                throw new Error("Unknown operation. " + arg2.source.getLineAndColumnMessage())
            },
            AddExp_minus: function (this: NtN, arg0: NtN, arg1: NtN, arg2: TN, arg3: NtN, arg4: NtN) {
                const left = arg0.visit()
                const right = arg4.visit()
                if (arg2.sourceString == '-')
                    return left - right
                throw new Error("Unknown operation. " + arg2.source.getLineAndColumnMessage())
            },
            MulExp_times: function (this: NtN, arg0: NtN, arg1: NtN, arg2: TN, arg3: NtN, arg4: NtN) {
                const left = arg0.visit()
                const right = arg4.visit()
                if (arg2.sourceString == '*')
                    return left * right
                throw new Error("Unknown operation. " + arg2.source.getLineAndColumnMessage())
            },
            MulExp_divide: function (this: NtN, arg0: NtN, arg1: NtN, arg2: TN, arg3: NtN, arg4: NtN) {
                const left = arg0.visit()
                const right = arg4.visit()
                if (arg2.sourceString == '/')
                    return left / right
                throw new Error("Unknown operation. " + arg2.source.getLineAndColumnMessage())
            },
            Function: function (this: NtN, arg0: NtN, arg1: TN, arg2: NtN, arg3: TN) {
                const name = arg0.sourceString
                const ast: AstFunction = {
                    type: 'function',
                    name,
                    arguments: arg2.visit() // resolve arguments
                }
                const func = functions[name]
                if (!func) throw new Error("Unknown function. " + arg2.source.getLineAndColumnMessage())
                return func(ast)
            },
            FunctionParams: function (this: NtN, arg0: NtN, arg1: NtN, arg2: IN, arg3: IN, arg4: IN, arg5: IN, arg6: NtN) {
                return [arg1.visit(), ...arg5.children.map(a => a.visit())]
            },
            Table: function (this: NtN, arg0: NtN, arg1: IN, arg2: IN) {
                if (!arg2.children.length) throw new Error("Column must specify. " + arg2.source.getLineAndColumnMessage())
                return {
                    type: 'table',
                    name: arg0.visit(),
                    column: arg2.children[0].sourceString,
                    json: arg2.children.slice(1).map(a => a.sourceString)
                } satisfies AstTable
            },
            TableName: function (this: NtN, arg0: TN, arg1: NtN) {
                return arg1.sourceString
            },
            doubleQuoteString: function (this: NtN, arg0: TN, arg1: NtN, arg2: TN) {
                return arg1.sourceString
            },
            singleQuoteString: function (this: NtN, arg0: TN, arg1: NtN, arg2: TN) {
                return arg1.sourceString
            },
            Literal: function (arg0) {
                return {
                    position: arg0.source.getLineAndColumn(),
                    data: arg0.visit()
                } satisfies Literal
            },
            null: function (arg0) {
                return null
            },
            number: function (this: NtN, arg0: NtN) {
                return Number(arg0.sourceString)
            },
            letter: function (this: NtN, arg0: NtN) {
                return this.sourceString
            }
        }
    )
    const result = grammar.match(query)
    if (result.failed()) {
        return [undefined, result.message] as const
    }
    return [semantics(result).visit() as AstQuery, undefined] as const
}