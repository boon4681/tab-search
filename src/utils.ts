import { TSchema, Type } from "@sinclair/typebox";
import { Column, getTableColumns, Table } from "drizzle-orm";
import { EDITOR_INTERFACE_V1, EDITOR_INTERFACE_V1_TABLE_SET } from "./interface";

export function Nullable<T extends TSchema>(T: T) {
    return Type.Union([T, Type.Null()])
}

function dataTypeToTypeBoxStatic(dataType: Column['dataType']) {
    switch (dataType) {
        case "string":
            return Type.String()
        case "number":
            return Type.Number()
        case "bigint":
            return Type.Number()
        case "boolean":
            return Type.Boolean()
        case "array":
            return Type.Any()
        case "json":
            return Type.Any()
        case "date":
            return Type.String()
        case "custom":
            return Type.Any()
        case "buffer":
            return Type.Any()
        case "dateDuration":
            return Type.String()
        case "localTime":
            return Type.String()
        case "localDate":
            return Type.String()
        case "localDateTime":
            return Type.String()
    }
}

function columnToTypeBox(column: Column) {
    const dataType = column.dataType
    const notNull = column.notNull
    const type = dataTypeToTypeBoxStatic(dataType)
    if (notNull && type && !column.hasDefault) {
        return Nullable(type)
    }
    return type
}

export function tableToTypeBox(table: Table) {
    const columns = getTableColumns(table)
    const obj: Record<string, TSchema> = {}
    for (const [key, value] of Object.entries(columns)) {
        const type = columnToTypeBox(value)
        if (type) obj[key] = type
    }
    return Type.Object(obj)
}

function dataTypeToTypeSchemaV1(dataType: Column['dataType']) {
    return dataType as string
}

export function columnToSchemaV1(column: Column) {
    const dataType = column.dataType
    return {
        type: dataTypeToTypeSchemaV1(dataType)
    }
}

export function tableToSchemaV1(table: Table) {
    const obj: EDITOR_INTERFACE_V1_TABLE_SET[string] = {}
    const columns = getTableColumns(table)
    for (const [key, value] of Object.entries(columns)) {
        const schema = columnToSchemaV1(value)
        if (schema) obj[key] = schema
    }
    return obj
}