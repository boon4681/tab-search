import { TSchema, Type } from "@sinclair/typebox";
import { Column, getTableColumns, Table } from "drizzle-orm";

function Nullable<T extends TSchema>(T: T) {
    return Type.Union([T, Type.Null()])
}

function dataTypeToStatic(dataType: Column['dataType']) {
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
    const type = dataTypeToStatic(dataType)
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