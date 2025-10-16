import { LineAndColumnInfo } from "ohm-js"

export type AstQuery = AstQueryOr | AstQueryAnd | AstQueryComparison | AstQueryTextSearch

// export type Literal = string | number | boolean | null
export interface Literal {
    position: LineAndColumnInfo
    data: string | number | boolean | null
}

export interface AstTable {
    type: 'table',
    name: string,
    column: string,
    json: string[]
}

export interface AstQueryComparison {
    type: 'query_comparison',
    table: AstTable,
    comparator: Comparator,
    value: Literal
}

export type Comparator = "==" | "!=" | "<=" | ">=" | ">" | "<" | "startwiths" | "endwiths" | "contains"

export interface AstQueryOr {
    type: 'query_or',
    left: AstQuery,
    right: AstQuery
}

export interface AstQueryAnd {
    type: 'query_and',
    left: AstQuery,
    right: AstQuery
}

export interface AstQueryTextSearch {
    type: 'query_text',
    value: string
}

export interface AstFunction {
    type: 'function',
    name: string,
    arguments: Literal[]
}