export type AstQuery = AstQueryOr | AstQueryAnd | AstQueryComparison

export type Literal = string | number | boolean | null

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

export type Comparator = "==" | "!=" | "<=" | ">=" | ">" | "<" | "startwiths" | "endwiths"

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

export interface AstFunction {
    type: 'function',
    name: string,
    arguments: Literal[]
}