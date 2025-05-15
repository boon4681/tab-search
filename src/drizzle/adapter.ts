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

class DrizzleTab<TOriginSchema extends Record<string, unknown> = Record<string, never>, TSchema extends Record<string, unknown> = ExtractTablesWithRelations<TOriginSchema>> {
    declare readonly _: {
        readonly schema: TSchema | undefined;
        readonly fullSchema: TOriginSchema;
    };
    private tables: Record<string, Table> = {}
    use(name: string, table: Table, options?: { extensions?: Extension[] }) {
        return new DrizzleUseTab(
            this.tables,
            name,
            table,
            options
        )
    }
    constructor(
        schema: TSchema | undefined,
    ) {
        this._ = schema ? {
            schema: schema,
            fullSchema: schema.fullSchema as TOriginSchema,
        } : {
            schema: undefined,
            fullSchema: {} as TOriginSchema,
        };
        this.tables = getTables(schema ?? {})
    }
}

class DrizzleUseTab<TSchema extends Record<string, Table>> {
    private functions: Record<string, AstFunctionResolver>
    constructor(
        private tables: TSchema,
        private name: string,
        private table: TSchema[keyof TSchema],
        options?: { extensions?: Extension[] }
    ) {
        const functions: Record<string, AstFunctionResolver> = {}
        if (options?.extensions) {
            for (const extension of options.extensions) {
                functions[extension.name] = extension.resolve
            }
        }
        this.functions = functions
    }
    codemirrorSchema() {
        const preprocess: TProperties = {
            [this.name]: tableToTypeBox(this.table)
        }
        // for (const table in tables) {
        //     preprocess[table.toLowerCase()] = tableToTypeBox(tables[table]!)
        // }
        return Type.Object({
            tables: Type.Object(
                preprocess
            )
        })
    }
    async prepare(query: string) {
        const [ast, error] = parseAST(query, this.functions)
        if (error) {
            throw new Error(error)
        }
        if (ast) return transform(this.table, ast)
        return undefined
    }
}

export function Tab<const TSchema extends Record<string, unknown>>(schema: TSchema) {
    return new DrizzleTab(schema)
}