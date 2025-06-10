import { Static, Type } from "@sinclair/typebox";
import { Nullable } from "./utils";

export const EDITOR_INTERFACE_V1_TABLE = Type.Record(
    Type.String(),
    Type.Object({
        type: Type.String()
    })
)
export type EDITOR_INTERFACE_V1_TABLE = Static<typeof EDITOR_INTERFACE_V1_TABLE>

export const EDITOR_INTERFACE_V1_TABLE_SET = Type.Record(
    Type.String(),
    EDITOR_INTERFACE_V1_TABLE
)
export type EDITOR_INTERFACE_V1_TABLE_SET = Static<typeof EDITOR_INTERFACE_V1_TABLE_SET>

export const EDITOR_INTERFACE_V1_SUGGESTOIN = Type.Object({ label: Type.String(), type: Type.String(), info: Type.String() })
export type EDITOR_INTERFACE_V1_SUGGESTOIN = Static<typeof EDITOR_INTERFACE_V1_SUGGESTOIN>

export const EDITOR_INTERFACE_V1 = Type.Object({
    tables: Type.Optional(EDITOR_INTERFACE_V1_TABLE_SET),
    suggestions: Type.Optional(Type.Array(
        EDITOR_INTERFACE_V1_SUGGESTOIN
    ))
})

export type EDITOR_INTERFACE_V1 = Static<typeof EDITOR_INTERFACE_V1>