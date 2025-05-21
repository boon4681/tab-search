import { and, eq, getTableColumns, getTableName, ne, gte, lte, lt, or, SQL, SQLWrapper, Table, gt, Column, like, isNull, isNotNull } from "drizzle-orm";
import { AstQuery, AstQueryAnd, AstQueryComparison, AstQueryOr, Literal } from "../ast.internal.types";
import { AssertError, Value } from "@sinclair/typebox/value";
import { resolveSafeParse, StringToDate } from "../typebox";

function castLiteral(tableName: string, column: Column, literal: Literal) {
    const dataType = column.dataType
    const value = literal.data
    function mismatch() {
        return new Error(`Type mismatched at ${tableName}.${column.name}, cannot compare ${JSON.stringify(dataType)} to ${JSON.stringify(typeof value)}.`)
    }
    function parsefail(err: AssertError) {
        return new Error(`Failed to parse ${dataType} at Line:${literal.position.lineNum}:${literal.position.colNum}, ${err.message}`)
    }
    if (typeof value == "number") {
        if (dataType == "number") {
            return value
        }
        throw mismatch()
    }
    if (typeof value == "bigint" || typeof value == "number") {
        if (dataType == "bigint") {
            return value
        }
        throw mismatch()
    }
    if (typeof value == "string") {
        if (dataType == "string") {
            return value
        }
        if (dataType == "date") {
            const [v, err] = resolveSafeParse(() => Value.Parse(StringToDate, value))
            if (err) {
                throw parsefail(err)
            }
            return v
        }
        throw mismatch()
    }
    if (dataType == "json") {
        throw new Error(`JSON comparison is not supported. ${tableName}.${column.name}`)
    }
    throw new Error(`Type ${value} not implemented.`)
}

function transformQueryOr(table: Table, ast: AstQueryOr) {
    const left = transform(table, ast.left)
    const right = transform(table, ast.right)
    return or(...[left, right])
}

function transformQueryAnd(table: Table, ast: AstQueryAnd) {
    const left = transform(table, ast.left)
    const right = transform(table, ast.right)
    return and(...[left, right])
}

function transformQueryComparison(table: Table, ast: AstQueryComparison) {
    const columns = getTableColumns(table)
    const tableName = getTableName(table)
    if (ast.table.name != tableName) {
        throw new Error("Unknown table named " + JSON.stringify(tableName) + ".")
    }
    if (!(ast.table.column in columns)) {
        throw new Error("Unknown column named " + JSON.stringify(ast.table.column) + " in table " + JSON.stringify(tableName) + ".")
    }
    if (ast.value.data == null && columns[ast.table.column]!.notNull) {
        throw new Error(`${ast.table.name}.${ast.table.column} compare to null`)
    }
    const column = columns[ast.table.column]!
    const cast = castLiteral(tableName, column, ast.value)
    switch (ast.comparator) {
        case "==":
            if (cast == null) return isNull(column)
            return eq(column, cast)
        case "!=":
            if (cast == null) return isNotNull(column)
            return ne(column, cast)
        case "<=":
            return lte(column, cast)
        case ">=":
            return gte(column, cast)
        case ">":
            return gt(column, cast)
        case "<":
            return lt(column, cast)
        case "startwiths":
            return like(column, cast + "%")
        case "endwiths":
            return like(column, "%" + cast)
    }
}

export function transform(table: Table<any>, ast: AstQuery): SQL {
    switch (ast.type) {
        case "query_or":
            return transformQueryOr(table, ast)!
        case "query_and":
            return transformQueryAnd(table, ast)!
        case "query_comparison":
            return transformQueryComparison(table, ast)
    }
    throw new Error("Unreachable code.")
}
