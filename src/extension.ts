import { AstFunction, Literal } from "./ast.internal.types";

type _Extension = {
    type: string
}
export type Extension = FunctionExtension | StringSuggestionExtension
export type AstFunctionResolver = (func: AstFunction) => null | boolean | number | undefined | string
export interface FunctionExtension extends _Extension {
    type: "function.extension",
    name: string,
    resolve: AstFunctionResolver
}

export type StringSuggestionResolver = string[] | (() => string[]) | (() => Promise<string[]>)

export interface StringSuggestionExtension extends _Extension {
    type: "string_suggestion.extension",
    resolve: StringSuggestionResolver
}

export function createStringSuggestionExtension(resolve: StringSuggestionResolver): StringSuggestionExtension {
    return {
        type: "string_suggestion.extension" as const,
        resolve
    }
}

export function createFunctionExtension(name: string, resolve: AstFunctionResolver): FunctionExtension {
    return {
        type: "function.extension" as const,
        name,
        resolve
    }
}