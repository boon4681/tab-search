import type { ExtractTablesWithRelations, Table, View } from 'drizzle-orm';
import { Column, getTableColumns, getViewSelectedFields, is, isTable, isView, SQL } from 'drizzle-orm';
import { parseAST } from '../ast';
import { transform } from './transform';
import { tableToTypeBox } from '../utils';
import { AstFunctionResolver, Extension, FunctionExtension } from '../extension';
import { TProperties, Type } from '@sinclair/typebox';

export function getColumns(tableLike: Table | View) {
    return isTable(tableLike) ? getTableColumns(tableLike) : getViewSelectedFields(tableLike);
}

export function getTables<TSchema extends Record<string, unknown>>(schema: TSchema) {
    let tables: Record<string, unknown> = {}
    for (const [key, table] of Object.entries(schema)) {
        if (isTable(table) || isView(table)) {
            tables[key] = table
        }
    }
    return tables as Record<string, Table>
}

export function Tab<const TSchema extends Record<string, unknown> = Record<string, never>>(schema: TSchema, options?: { extensions?: Extension[] }) {
    const tables = getTables(schema)
    const functions: Record<string, AstFunctionResolver> = {}
    if (options?.extensions) {
        for (const extension of options.extensions) {
            functions[extension.name] = extension.resolve
        }
    }
    return {
        use: <J extends (keyof TSchema) & string>(table: J) => ({
            codemirrorSchema: function () {
                const preprocess: TProperties = {
                    [table.toLowerCase()]: tableToTypeBox(tables[table]!)
                }
                // for (const table in tables) {
                //     preprocess[table.toLowerCase()] = tableToTypeBox(tables[table]!)
                // }
                return Type.Object({
                    tables: Type.Object(
                        preprocess
                    )
                })
            },
            prepare: function (query: string) {
                const [ast, error] = parseAST(query, functions)
                if (error) {
                    throw new Error(error)
                }
                if (ast) return transform(tables[table]!, ast)
                return undefined
            }
        })
    }
}